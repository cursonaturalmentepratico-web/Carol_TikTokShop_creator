/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './services/supabase';
import { ProjectService } from './services/projectService';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { ProjectList } from './components/ProjectList';
import { ProjectEditor } from './components/ProjectEditor';
import { VideoPreviewModal } from './components/VideoPreviewModal';
import { CombinationsMatrixModal } from './components/CombinationsMatrixModal';
import { ResultsView } from './components/ResultsView';
import { BackendStatusModal } from './components/BackendStatusModal';
import { SettingsModal } from './components/SettingsModal';
import { Project, VideoClip, GeneratedCombination } from './types';
import { buildCombinationsMatrix } from './utils/videoUtils';
import { submitProjectForRendering } from './services/renderWorkflow';
import { waitForRenderCompletion } from './services/renderPolling';
import { RenderApi } from './services/renderApi';
import { Loader2, AlertCircle } from 'lucide-react';

export default function App() {
  // Authentication state
  const [session, setSession] = useState<Session | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // App navigation view
  const [currentView, setCurrentView] = useState<'home' | 'editor' | 'results'>('home');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSubmittingRender, setIsSubmittingRender] = useState(false);
  const [renderMessage, setRenderMessage] = useState<string | null>(null);

  // Modals state
  const [previewClip, setPreviewClip] = useState<VideoClip | null>(null);
  const [showMatrixModal, setShowMatrixModal] = useState(false);
  const [showBackendModal, setShowBackendModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Fetch real projects for the authenticated user from Supabase
  const loadUserProjects = useCallback(async (userId: string) => {
    setIsLoadingProjects(true);
    setGlobalError(null);
    try {
      const data = await ProjectService.getProjects(userId);
      setProjects(data);
    } catch (err: unknown) {
      console.error('Erro ao buscar projetos:', err);
      const msg = err instanceof Error ? err.message : 'Falha ao sincronizar projetos do Supabase.';
      setGlobalError(msg);
    } finally {
      setIsLoadingProjects(false);
    }
  }, []);

  // Monitor Supabase session and auth state changes
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Erro ao verificar sessão Supabase:', error.message);
        }
        if (isMounted) {
          const currentSession = data?.session || null;
          setSession(currentSession);
          if (currentSession?.user) {
            loadUserProjects(currentSession.user.id);
          }
        }
      } catch (err) {
        console.error('Erro na inicialização de autenticação:', err);
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    }

    initAuth();

    // Listen to real-time auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        loadUserProjects(newSession.user.id);
      } else {
        setProjects([]);
        setActiveProject(null);
        setCurrentView('home');
      }
      setIsCheckingAuth(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserProjects]);

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setProjects([]);
      setActiveProject(null);
      setCurrentView('home');
    } catch (err) {
      console.error('Erro ao sair da conta:', err);
    }
  };

  // Create real project in Supabase with status 'draft' and user_id
  const handleNewProject = async () => {
    if (!session?.user) return;

    setGlobalError(null);
    try {
      const created = await ProjectService.createProject('Novo Projeto', session.user.id);
      setProjects((prev) => [created, ...prev]);
      setActiveProject(created);
      setCurrentView('editor');
    } catch (err: unknown) {
      console.error('Falha ao criar projeto:', err);
      const msg = err instanceof Error ? err.message : 'Erro ao criar projeto no Supabase.';
      setGlobalError(msg);
    }
  };

  const handleOpenProject = async (project: Project) => {
    setGlobalError(null);
    setActiveProject(project);
    setRenderMessage('Consultando vídeos disponíveis na VPS...');

    try {
      const job = await RenderApi.status(project.id);

      if (job.status === 'completed') {
        const outputs = await RenderApi.outputs(project.id);

        if (outputs.files.length > 0) {
          let savedResults: GeneratedCombination[] = [];

          try {
            const stored = localStorage.getItem(
              `carol-render-results:${session!.user.id}:${project.id}`
            );
            if (stored) {
              const parsed: unknown = JSON.parse(stored);
              if (Array.isArray(parsed)) {
                savedResults = parsed as GeneratedCombination[];
              }
            }
          } catch {
            // Se o armazenamento estiver indisponível, os MP4 continuam acessíveis.
          }

          setActiveProject({
            ...project,
            results: savedResults,
            totalCombinations: outputs.files.length,
            status: 'ready',
            expiresAt: outputs.expiresAt,
          });
          setCurrentView('results');
          return;
        }

        setGlobalError('A renderização foi concluída, mas nenhum vídeo está disponível.');
        return;
      }

      if (job.status === 'not_started') {
        setCurrentView('editor');
        return;
      }

      if (job.status === 'pending' || job.status === 'running') {
        setGlobalError('Este projeto ainda está sendo processado na VPS.');
        return;
      }

      if (job.status === 'expired' || job.status === 'deleting') {
        setGlobalError('Os vídeos deste projeto não estão mais disponíveis.');
        return;
      }

      if (job.status === 'failed') {
        setGlobalError('A renderização deste projeto falhou.');
        return;
      }

      setGlobalError('Não foi possível identificar o estado deste projeto.');
    } catch (error) {
      setGlobalError(
        error instanceof Error
          ? `Falha ao consultar a VPS: ${error.message}`
          : 'Falha ao consultar a VPS.'
      );
    } finally {
      setRenderMessage(null);
    }
  };

  // Delete draft project from Supabase
  const handleDeleteProject = async (projectId: string) => {
    if (!session?.user) return;

    setGlobalError(null);
    try {
      await ProjectService.deleteDraftProject(projectId, session.user.id);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      if (activeProject?.id === projectId) {
        setActiveProject(null);
        setCurrentView('home');
      }
    } catch (err: unknown) {
      console.error('Falha ao excluir projeto:', err);
      const msg = err instanceof Error ? err.message : 'Erro ao excluir projeto.';
      setGlobalError(msg);
    }
  };

  const handleUpdateProject = (updated: Project) => {
    setActiveProject(updated);
    // Also update in list if present
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? { ...p, title: updated.title } : p)));
  };

  // Save project name changes to Supabase
  const handleSaveProject = async () => {
    if (!activeProject || !session?.user) return;

    try {
      await ProjectService.updateProjectName(
        activeProject.id,
        activeProject.title,
        session.user.id
      );
    } catch (err) {
      console.error('Falha ao salvar nome no Supabase:', err);
    }
  };

  const handleRequestGenerate = async () => {
    if (!activeProject || isSubmittingRender) return;

    const project = activeProject;

    setGlobalError(null);
    setIsSubmittingRender(true);
    setRenderMessage('Preparando os vídeos para envio...');

    try {
      const matrix = buildCombinationsMatrix(
        project.hooks,
        project.developments,
        project.ctas
      );

      await ProjectService.updateProjectName(
        project.id,
        project.title,
        session!.user.id
      );

      await submitProjectForRendering(project, (progress) => {
        setRenderMessage(progress.message);
      });

      setActiveProject({
        ...project,
        results: matrix,
        totalCombinations: matrix.length,
        updatedAt: new Date().toISOString(),
      });

      setRenderMessage(
        'Vídeos enviados! Aguardando processamento na VPS...'
      );

      await waitForRenderCompletion(project.id, (job) => {
        if (job.status === 'pending') {
          setRenderMessage('Aguardando sua vez na fila de processamento...');
        } else if (job.status === 'running') {
          setRenderMessage('FFmpeg está gerando suas combinações...');
        }
      });

      const outputs = await RenderApi.outputs(project.id);

      // Preserva os detalhes das combinações para futuras visitas.
      localStorage.setItem(
        `carol-render-results:${session!.user.id}:${project.id}`,
        JSON.stringify(matrix)
      );

      if (outputs.files.length === 0) {
        throw new Error('Processamento concluído, mas nenhum vídeo foi encontrado.');
      }

      setActiveProject({
        ...project,
        results: matrix,
        totalCombinations: matrix.length,
        expiresAt: outputs.expiresAt,
        status: 'ready',
        updatedAt: new Date().toISOString(),
      });

      setCurrentView('results');
      setRenderMessage(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível iniciar a renderização.';

      setGlobalError(message);
      setRenderMessage(null);
    } finally {
      setIsSubmittingRender(false);
    }
  };

  const handleOpenResultsView = () => {
    setShowBackendModal(false);
    setCurrentView('results');
  };

  const handleBackToEditor = () => {
    setCurrentView('editor');
  };

  const handleGoHome = async () => {
    if (activeProject && session?.user) {
      await handleSaveProject();
    }
    setCurrentView('home');
  };

  // Initial loading splash while verifying Supabase session
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#111111] text-white flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center space-y-4 animate-in fade-in duration-300">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#242424] to-[#161616] border border-[#333333] shadow-2xl">
            <span className="font-serif italic text-2xl font-bold text-[#E8A0BF]">CR</span>
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-white font-serif tracking-tight">Carol Rosa</h2>
            <p className="text-xs uppercase tracking-wider text-[#E8A0BF] font-semibold">
              TikTokShop Editor
            </p>
          </div>
          <div className="flex items-center gap-2 pt-2 text-xs text-[#8E8E8E]">
            <Loader2 className="w-4 h-4 animate-spin text-[#E8A0BF]" />
            <span>Verificando autenticação...</span>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, strictly show the Login Screen
  if (!session) {
    return (
      <LoginScreen
        onLoginSuccess={() => {
          // Auth state change listener handles session update automatically
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] text-[#FFFFFF] flex flex-col antialiased selection:bg-[#E8A0BF] selection:text-[#111111]">
      {/* Sticky Header with User Info and Sign Out */}
      <Header
        onOpenSettings={() => setShowSettingsModal(true)}
        onGoHome={currentView !== 'home' ? handleGoHome : undefined}
        isInsideProject={currentView !== 'home'}
        userEmail={session.user.email}
        onSignOut={handleSignOut}
      />

      {/* Global Error Banner */}
      {globalError && (
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 pt-4">
          <div className="rounded-2xl border border-rose-800/40 bg-rose-950/30 p-3.5 text-xs text-rose-200 flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{globalError}</span>
            </div>
            <button
              onClick={() => setGlobalError(null)}
              className="text-[#999999] hover:text-white text-xs font-semibold"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {renderMessage && (
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 pt-4">
          <div className="rounded-2xl border border-[#E8A0BF]/40 bg-[#E8A0BF]/10 p-4 text-sm text-[#E8A0BF] flex items-center gap-3">
            {isSubmittingRender && (
              <Loader2 className="w-5 h-5 animate-spin shrink-0" />
            )}
            <span>{renderMessage}</span>
          </div>
        </div>
      )}

      {/* Main View Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-20">
        {currentView === 'home' && (
          <ProjectList
            projects={projects}
            isLoading={isLoadingProjects}
            onOpenProject={handleOpenProject}
            onDeleteProject={handleDeleteProject}
            onNewProject={handleNewProject}
          />
        )}

        {currentView === 'editor' && activeProject && (
          <ProjectEditor
            project={activeProject}
            onUpdateProject={handleUpdateProject}
            onSaveProject={handleSaveProject}
            onBack={handleGoHome}
            onPreviewClip={(clip) => setPreviewClip(clip)}
            onViewMatrix={() => setShowMatrixModal(true)}
            onRequestGenerate={handleRequestGenerate}
            isSubmittingRender={isSubmittingRender}
          />
        )}

        {currentView === 'results' && activeProject && (
          <ResultsView
            project={activeProject}
            onBackToEditor={handleBackToEditor}
            onPreviewCombination={async (combo) => {
              const filename = `combinacao-${String(combo.combinationNumber).padStart(3, '0')}.mp4`;

              setGlobalError(null);
              setRenderMessage('Carregando vídeo final para pré-visualização...');

              try {
                const url = await RenderApi.preview(activeProject.id, filename);

                setPreviewClip({
                  id: combo.id,
                  category: 'hooks',
                  name: filename,
                  size: 0,
                  sizeFormatted: combo.fileSizeFormatted || 'MP4',
                  duration: combo.estimatedDuration,
                  durationFormatted: combo.estimatedDurationFormatted,
                  previewUrl: url,
                  thumbnailUrl: null,
                  uploadedAt: new Date().toISOString(),
                });
              } catch (error) {
                setGlobalError(
                  error instanceof Error
                    ? error.message
                    : 'Não foi possível carregar o vídeo.'
                );
              } finally {
                setRenderMessage(null);
              }
            }}
          />
        )}
      </main>

      {/* Video Preview Modal */}
      {previewClip && (
        <VideoPreviewModal
          clip={previewClip}
          onClose={() => {
            if (previewClip?.previewUrl.startsWith('blob:')) {
              URL.revokeObjectURL(previewClip.previewUrl);
            }
            setPreviewClip(null);
          }}
        />
      )}

      {/* Combinations Permutations Matrix Modal */}
      {showMatrixModal && activeProject && (
        <CombinationsMatrixModal
          combinations={
            activeProject.results && activeProject.results.length > 0
              ? activeProject.results
              : buildCombinationsMatrix(
                  activeProject.hooks,
                  activeProject.developments,
                  activeProject.ctas
                )
          }
          projectTitle={activeProject.title}
          onClose={() => setShowMatrixModal(false)}
        />
      )}

      {/* Backend Status / VPS FFmpeg Notification Modal */}
      {showBackendModal && activeProject && (
        <BackendStatusModal
          project={activeProject}
          onClose={() => setShowBackendModal(false)}
          onOpenResultsPreview={handleOpenResultsView}
        />
      )}

      {/* Settings & Auth Diagnostic Modal */}
      {showSettingsModal && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
          userEmail={session.user.email}
        />
      )}
    </div>
  );
}
