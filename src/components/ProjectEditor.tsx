import React, { useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Save,
  Play,
  Layers,
  Film,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Project, VideoClip, GeneratedCombination } from '../types';
import { VideoUploaderSection } from './VideoUploaderSection';
import { CombinationsCounter } from './CombinationsCounter';
import { buildCombinationsMatrix } from '../utils/videoUtils';

interface ProjectEditorProps {
  project: Project;
  onUpdateProject: (updated: Project) => void;
  onSaveProject: () => void;
  onBack: () => void;
  onPreviewClip: (clip: VideoClip) => void;
  onViewMatrix: () => void;
  onRequestGenerate: () => void;
  isSubmittingRender?: boolean;
}

export const ProjectEditor: React.FC<ProjectEditorProps> = ({
  project,
  onUpdateProject,
  onSaveProject,
  onBack,
  onPreviewClip,
  onViewMatrix,
  onRequestGenerate,
  isSubmittingRender = false,
}) => {
  const [saveToast, setSaveToast] = useState(false);

  const canGenerate =
    project.hooks.length > 0 &&
    project.developments.length > 0 &&
    project.ctas.length > 0;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    onUpdateProject({
      ...project,
      title,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddClips = (category: 'hooks' | 'developments' | 'ctas', newClips: VideoClip[]) => {
    const updated = {
      ...project,
      [category]: [...project[category], ...newClips],
      updatedAt: new Date().toISOString(),
    };
    // Recalculate total combinations
    updated.totalCombinations =
      updated.hooks.length * updated.developments.length * updated.ctas.length;
    // Build combinations structure
    updated.results = buildCombinationsMatrix(
      updated.hooks,
      updated.developments,
      updated.ctas
    );
    onUpdateProject(updated);
  };

  const handleRemoveClip = (category: 'hooks' | 'developments' | 'ctas', id: string) => {
    const updated = {
      ...project,
      [category]: project[category].filter((c) => c.id !== id),
      updatedAt: new Date().toISOString(),
    };
    updated.totalCombinations =
      updated.hooks.length * updated.developments.length * updated.ctas.length;
    updated.results = buildCombinationsMatrix(
      updated.hooks,
      updated.developments,
      updated.ctas
    );
    onUpdateProject(updated);
  };

  const handleManualSave = () => {
    onSaveProject();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Top action bar */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-[#222222]">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#A0A0A0] hover:text-[#E8A0BF] active:scale-95 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Início</span>
        </button>

        <div className="flex items-center gap-2">
          {saveToast && (
            <span className="text-xs text-emerald-400 font-medium animate-in fade-in duration-150">
              Salvo com sucesso!
            </span>
          )}

          <button
            type="button"
            onClick={handleManualSave}
            className="flex items-center gap-1.5 rounded-xl border border-[#2f2f2f] bg-[#1a1a1a] px-3.5 py-2 text-xs font-semibold text-white hover:border-[#E8A0BF] hover:text-[#E8A0BF] active:scale-95 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Salvar Rascunho</span>
          </button>
        </div>
      </div>

      {/* Field: Nome do projeto / Produto */}
      <div className="rounded-3xl border border-[#262626] bg-[#161616] p-5 sm:p-6 shadow-xl space-y-2">
        <label
          htmlFor="project-title"
          className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-[#E8A0BF]"
        >
          Nome do Projeto / Produto
        </label>
        <div className="relative">
          <input
            id="project-title"
            type="text"
            value={project.title}
            onChange={handleTitleChange}
            placeholder="Ex.: Sérum Facial"
            className="w-full rounded-2xl border border-[#333333] bg-[#121212] px-4 py-3.5 text-base sm:text-lg font-medium text-white placeholder-[#555555] focus:border-[#E8A0BF] focus:outline-none focus:ring-1 focus:ring-[#E8A0BF] transition-all"
          />
        </div>
        <p className="text-[11px] text-[#777777]">
          Identifique o produto ou campanha do TikTok Shop que você está gravando.
        </p>
      </div>

      {/* Temporary browser memory reminder */}
      <div className="rounded-2xl border border-[#2c2c2c] bg-[#161616] p-3.5 sm:p-4 text-xs text-[#A0A0A0] flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-[#E8A0BF] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold text-white block">Armazenamento temporário no navegador</span>
          <p className="text-[11px] leading-relaxed text-[#8E8E8E]">
            Os vídeos selecionados ficam carregados na memória do seu dispositivo. Caso você feche ou recarregue esta página, será necessário selecionar os arquivos novamente da galeria antes de enviar ao processamento.
          </p>
        </div>
      </div>

      {/* Dynamic Combinations Counter */}
      <CombinationsCounter
        hooksCount={project.hooks.length}
        developmentsCount={project.developments.length}
        ctasCount={project.ctas.length}
        onViewMatrix={onViewMatrix}
      />

      {/* Video Sections */}
      <div className="space-y-5">
        {/* SEÇÃO 1 — GANCHOS */}
        <VideoUploaderSection
          category="hooks"
          badgeNumber={1}
          title="Ganchos (Hooks)"
          subtitle="Os primeiros 3 segundos do vídeo para prender a atenção no feed"
          clips={project.hooks}
          onAddClips={(clips) => handleAddClips('hooks', clips)}
          onRemoveClip={(id) => handleRemoveClip('hooks', id)}
          onPreviewClip={onPreviewClip}
        />

        {/* SEÇÃO 2 — DESENVOLVIMENTOS */}
        <VideoUploaderSection
          category="developments"
          badgeNumber={2}
          title="Desenvolvimentos"
          subtitle="Demonstração do produto, benefícios práticos e prova social"
          clips={project.developments}
          onAddClips={(clips) => handleAddClips('developments', clips)}
          onRemoveClip={(id) => handleRemoveClip('developments', id)}
          onPreviewClip={onPreviewClip}
        />

        {/* SEÇÃO 3 — CTAs */}
        <VideoUploaderSection
          category="ctas"
          badgeNumber={3}
          title="Chamadas para Ação (CTAs)"
          subtitle="Chamadas finais direcionando para o botão amarelo da TikTok Shop"
          clips={project.ctas}
          onAddClips={(clips) => handleAddClips('ctas', clips)}
          onRemoveClip={(id) => handleRemoveClip('ctas', id)}
          onPreviewClip={onPreviewClip}
        />
      </div>

      {/* Botão de Geração de Vídeos (Big button for iPhone screen) */}
      <div className="sticky bottom-4 z-30 pt-2 pb-safe">
        <div className="rounded-3xl border border-[#333333] bg-[#161616]/95 backdrop-blur-md p-4 shadow-2xl space-y-3">
          <div className="flex items-center justify-between text-xs text-[#AAAAAA]">
            <span>Combinações prontas:</span>
            <span className="font-bold text-white font-mono">
              {project.totalCombinations} {project.totalCombinations === 1 ? 'vídeo' : 'vídeos'}
            </span>
          </div>

          <button
            type="button"
            disabled={!canGenerate || isSubmittingRender}
            onClick={onRequestGenerate}
            className={`w-full flex items-center justify-center gap-3 rounded-2xl py-4 px-6 text-base font-extrabold tracking-wide transition-all duration-200 cursor-pointer shadow-lg ${
              canGenerate
                ? 'bg-[#E8A0BF] text-[#111111] hover:bg-[#df8fb1] active:scale-[0.98] shadow-[#E8A0BF]/20'
                : 'bg-[#252525] text-[#666666] border border-[#333333] cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-5 h-5 fill-current" />
            <span>
              {isSubmittingRender ? 'Enviando vídeos...' : 'Gerar combinações'}
            </span>
          </button>

          {!canGenerate && (
            <p className="text-center text-[11px] text-[#777777]">
              Adicione pelo menos 1 vídeo em cada categoria para habilitar o processamento.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
