import React, { useState, useEffect } from 'react';
import {
  Clock,
  Download,
  Play,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  FileArchive,
  RefreshCw,
  Server,
  Sparkles,
  Info,
} from 'lucide-react';
import { Project, GeneratedCombination } from '../types';
import { calculateTimeRemaining } from '../utils/videoUtils';
import { RenderApi, RenderOutput } from '../services/renderApi';

interface ResultsViewProps {
  project: Project;
  onBackToEditor: () => void;
  onPreviewCombination?: (combo: GeneratedCombination) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  project,
  onBackToEditor,
  onPreviewCombination,
}) => {
  // Target expiration provided by server (default to 2 hours from now if simulating backend test)
  const defaultExpiry =
    project.expiresAt || new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

  const [timeRemaining, setTimeRemaining] = useState(() =>
    calculateTimeRemaining(defaultExpiry)
  );

  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [serverFiles, setServerFiles] = useState<RenderOutput[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);

  // Update countdown every second based on real server expiration date
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining(defaultExpiry);
      setTimeRemaining(remaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [defaultExpiry]);

  const combinations = project.results || [];

  useEffect(() => {
    let active = true;

    setLoadingFiles(true);

    RenderApi.outputs(project.id)
      .then((result) => {
        if (active) setServerFiles(result.files);
      })
      .catch((error) => {
        if (active) {
          setDownloadNotice(
            error instanceof Error ? error.message : 'Falha ao consultar vídeos.'
          );
        }
      })
      .finally(() => {
        if (active) setLoadingFiles(false);
      });

    return () => {
      active = false;
    };
  }, [project.id]);

  const handleDownloadSingle = async (combo: GeneratedCombination) => {
    const filename = `combinacao-${String(combo.combinationNumber).padStart(3, '0')}.mp4`;

    if (!serverFiles.some((file) => file.filename === filename)) {
      setDownloadNotice('Este vídeo não está disponível para download.');
      return;
    }

    try {
      setDownloadNotice(`Iniciando download do vídeo #${combo.combinationNumber}...`);

      await RenderApi.download(project.id, filename, (percent) => {
        setDownloadNotice(
          percent === null
            ? `Baixando vídeo #${combo.combinationNumber}...`
            : `Baixando vídeo #${combo.combinationNumber}: ${percent}%`
        );
      });

      setDownloadNotice(null);
    } catch (error) {
      setDownloadNotice(
        error instanceof Error ? error.message : 'Falha ao baixar vídeo.'
      );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#242424]">
        <button
          onClick={onBackToEditor}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#A0A0A0] hover:text-[#E8A0BF] transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para edição do projeto</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-white">Central de Entrega de Vídeos</span>
        </div>
      </div>

      {/* Project Title Banner */}
      <div className="rounded-3xl border border-[#2a2a2a] bg-[#161616] p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8A0BF] bg-[#E8A0BF]/15 px-2 py-0.5 rounded-md border border-[#E8A0BF]/30">
                TikTok Shop Ready
              </span>
              <span className="text-xs text-[#888888]">•</span>
              <span className="text-xs text-[#888888]">1080x1920 (Vertical 9:16)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {project.title || 'Projeto TikTok Shop'}
            </h2>
            <p className="text-xs text-[#999999] mt-1">
              {combinations.length} variações estruturadas para escala orgânica e tráfego pago.
            </p>
          </div>

          <span className="text-xs text-[#A0A0A0]">
            {loadingFiles ? 'Consultando arquivos...' : `${serverFiles.length} MP4 disponível(is)`}
          </span>
        </div>
      </div>

      {/* Expiration Countdown Banner (Real 2-hour server calculation) */}
      <div
        className={`rounded-3xl border p-5 sm:p-6 transition-all ${
          timeRemaining.isExpired
            ? 'border-rose-900/50 bg-rose-950/20 text-rose-200'
            : 'border-[#333333] bg-gradient-to-r from-[#1c1c1c] to-[#171717] text-white'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
                timeRemaining.isExpired
                  ? 'border-rose-800 bg-rose-900/30 text-rose-400'
                  : 'border-[#E8A0BF]/40 bg-[#E8A0BF]/15 text-[#E8A0BF]'
              }`}
            >
              <Clock className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold tracking-tight">
                  {timeRemaining.isExpired
                    ? 'Arquivos Expirados no Servidor'
                    : 'Prazo de Disponibilidade dos Vídeos'}
                </h3>
              </div>
              <p className="text-xs text-[#A0A0A0] mt-0.5 leading-relaxed max-w-lg">
                Os vídeos ficam disponíveis para download por <strong>2 horas</strong> após a
                conclusão. Após esse prazo, os arquivos são excluídos automaticamente da VPS para
                liberar armazenamento.
              </p>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="text-left sm:text-right shrink-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#A0A0A0] block">
              Tempo restante no servidor
            </span>
            <div
              className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${
                timeRemaining.isExpired
                  ? 'text-rose-400'
                  : timeRemaining.totalSeconds < 1800
                  ? 'text-amber-400 animate-pulse'
                  : 'text-[#E8A0BF]'
              }`}
            >
              {timeRemaining.isExpired ? 'EXPIRADO' : timeRemaining.formatted}
            </div>
          </div>
        </div>
      </div>

      {/* Notice Message if clicked */}
      {downloadNotice && (
        <div className="rounded-2xl border border-amber-800/50 bg-amber-950/30 p-4 text-xs text-amber-200 flex items-start gap-3 animate-in fade-in">
          <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-white mb-0.5">Aviso de Integração com Backend</p>
            <p>{downloadNotice}</p>
          </div>
        </div>
      )}

      {/* Generated Combinations Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Vídeos Produzidos ({combinations.length})
          </h3>
          <span className="text-xs text-[#888888]">Prontos para download individual</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {combinations.map((combo) => (
            <div
              key={combo.id}
              className="flex flex-col justify-between rounded-2xl bg-[#191919] p-4 border border-[#262626] hover:border-[#E8A0BF]/50 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#242424] px-2.5 py-1 text-xs font-mono font-bold text-[#E8A0BF] border border-[#333333]">
                    Vídeo #{combo.combinationNumber}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                    <CheckCircle className="w-3 h-3" />
                    Estruturado
                  </span>
                </div>

                {/* Sequence */}
                <div className="space-y-1 text-xs text-[#CCCCCC] mb-3 bg-[#141414] p-3 rounded-xl border border-[#222222]">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase text-[#E8A0BF] w-14">Gancho:</span>
                    <span className="truncate text-white font-medium">{combo.hookName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase text-[#A0A0A0] w-14">Desenv.:</span>
                    <span className="truncate text-white font-medium">{combo.developmentName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase text-[#E8A0BF] w-14">CTA:</span>
                    <span className="truncate text-white font-medium">{combo.ctaName}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#888888] mb-3 px-1">
                  <span>Duração estimada: ~{combo.estimatedDurationFormatted}</span>
                  <span>{combo.resolution}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#242424]">
                <button
                  type="button"
                  onClick={() => onPreviewCombination && onPreviewCombination(combo)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#242424] py-2.5 px-3 text-xs font-semibold text-white hover:bg-[#2c2c2c] active:scale-95 transition-all"
                >
                  <Play className="w-3.5 h-3.5 text-[#E8A0BF]" />
                  <span>Pré-visualizar</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadSingle(combo)}
                  disabled={
                    loadingFiles ||
                    !serverFiles.some(
                      (file) =>
                        file.filename ===
                        `combinacao-${String(combo.combinationNumber).padStart(3, '0')}.mp4`
                    )
                  }
                  className="flex-1 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 rounded-xl border border-[#333333] bg-[#1d1d1d] py-2.5 px-3 text-xs font-semibold text-[#F5F5F5] hover:border-[#E8A0BF] hover:text-[#E8A0BF] active:scale-95 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar MP4</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
