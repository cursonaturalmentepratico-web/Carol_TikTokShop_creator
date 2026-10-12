import React from 'react';
import { Plus, Video, Calendar, Trash2, ArrowRight, Loader2, Tag } from 'lucide-react';
import { Project } from '../types';

interface ProjectListProps {
  projects: Project[];
  isLoading?: boolean;
  onOpenProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onNewProject: () => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  isLoading = false,
  onOpenProject,
  onDeleteProject,
  onNewProject,
}) => {
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recente';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-[#242424] px-2 py-0.5 text-[11px] font-medium text-[#E8A0BF] border border-[#333333]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E8A0BF]" />
            Rascunho
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-950/40 px-2 py-0.5 text-[11px] font-medium text-amber-300 border border-amber-800/40">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Processando
          </span>
        );
      case 'ready':
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-950/40 px-2 py-0.5 text-[11px] font-medium text-emerald-300 border border-emerald-800/40">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Concluído
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-zinc-800/50 px-2 py-0.5 text-[11px] font-medium text-zinc-400 border border-zinc-700/50">
            Expirado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-[#242424] px-2 py-0.5 text-[11px] font-medium text-[#A0A0A0] border border-[#333333]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Section */}
      <div className="text-center space-y-4 pt-4 sm:pt-8 pb-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#2a2a2a] bg-[#161616] px-3.5 py-1 text-xs text-[#E8A0BF]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#E8A0BF]" />
          <span>Editor Exclusivo TikTok Shop</span>
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-serif">
            Carol Rosa
          </h1>
          <p className="text-lg sm:text-xl font-medium tracking-wide text-[#E8A0BF]">
            TikTokShop Editor
          </p>
        </div>

        <p className="mx-auto max-w-md text-sm sm:text-base text-[#A8A8A8] font-normal leading-relaxed">
          “Transforme suas gravações em múltiplos vídeos.”
        </p>

        {/* Primary Action Button (Big for iPhone screen) */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onNewProject}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-[#E8A0BF] px-8 py-4 text-base font-bold text-[#111111] hover:bg-[#df8fb1] active:scale-95 transition-all shadow-xl shadow-[#E8A0BF]/10 cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Novo projeto</span>
          </button>
        </div>
      </div>

      {/* Previous Projects Section */}
      <div className="space-y-4 pt-4 border-t border-[#222222]">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Projetos Anteriores
          </h2>
          {projects.length > 0 && !isLoading && (
            <span className="text-xs text-[#888888] font-mono">
              {projects.length} {projects.length === 1 ? 'projeto cadastrado' : 'projetos cadastrados'}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="rounded-3xl border border-[#222222] bg-[#141414] p-10 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#E8A0BF]" />
            <p className="text-xs text-[#888888]">Carregando projetos do Supabase...</p>
          </div>
        ) : projects.length > 0 ? (
          <div className="space-y-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-[#161616] p-5 border border-[#262626] hover:border-[#E8A0BF]/50 transition-all duration-200 shadow-md"
              >
                {/* Project Info */}
                <div
                  onClick={() => onOpenProject(project)}
                  className="flex-1 cursor-pointer min-w-0"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    {getStatusBadge(project.status)}
                    <span className="text-xs text-[#666666]">•</span>
                    <span className="text-xs text-[#888888] flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#666666]" />
                      {formatDate(project.createdAt)}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#E8A0BF] transition-colors truncate">
                    {project.title || 'Projeto sem nome'}
                  </h3>

                  <p className="text-[11px] text-[#7E7E7E] mt-1">
                    Toque para abrir a área de combinação e seleção de vídeos.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#222222]">
                  {/* Allow deleting only draft projects */}
                  {project.status === 'draft' && (
                    <button
                      type="button"
                      onClick={() => onDeleteProject(project.id)}
                      aria-label="Excluir projeto em rascunho"
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#202020] text-[#777777] hover:bg-rose-950/40 hover:text-rose-400 active:scale-95 transition-all"
                      title="Excluir rascunho"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onOpenProject(project)}
                    className="flex items-center gap-2 rounded-xl bg-[#242424] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#E8A0BF] hover:text-[#111111] active:scale-95 transition-all cursor-pointer"
                  >
                    <span>Abrir</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state - Zero fake records */
          <div className="rounded-3xl border border-[#222222] bg-[#141414] p-8 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1c1c1c] text-[#666666] border border-[#282828]">
              <Video className="h-6 w-6 text-[#888888]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white">Nenhum projeto criado ainda</h3>
              <p className="text-xs text-[#7E7E7E] max-w-sm mx-auto leading-relaxed">
                Clique em <strong>Novo projeto</strong> acima para iniciar sua primeira sequência de vídeos para o TikTok Shop.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
