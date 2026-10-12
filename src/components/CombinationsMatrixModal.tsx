import React from 'react';
import { X, Layers, Clock, Film } from 'lucide-react';
import { GeneratedCombination } from '../types';

interface CombinationsMatrixModalProps {
  combinations: GeneratedCombination[];
  projectTitle: string;
  onClose: () => void;
}

export const CombinationsMatrixModal: React.FC<CombinationsMatrixModalProps> = ({
  combinations,
  projectTitle,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-xl max-h-[90vh] rounded-3xl bg-[#161616] border border-[#2a2a2a] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#1b1b1b] border-b border-[#262626]">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#E8A0BF]/15 flex items-center justify-center text-[#E8A0BF]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Matriz de Combinações</h3>
              <p className="text-xs text-[#999999] truncate max-w-xs">
                {projectTitle || 'Projeto'} • {combinations.length} vídeos resultantes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#242424] flex items-center justify-center text-[#888888] hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of combinations */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          <p className="text-xs text-[#A0A0A0] leading-relaxed">
            Cada combinação abaixo representa um vídeo completo pronto para o algoritmo do TikTok Shop, composto pela junção de 1 Gancho + 1 Desenvolvimento + 1 CTA.
          </p>

          <div className="space-y-2.5">
            {combinations.map((combo) => (
              <div
                key={combo.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-2xl bg-[#1b1b1b] p-3.5 border border-[#262626] hover:border-[#E8A0BF]/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-[#242424] flex items-center justify-center text-xs font-mono font-bold text-[#E8A0BF] shrink-0 border border-[#333333]">
                    #{combo.combinationNumber}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-white">
                      <span className="font-semibold text-[#E8A0BF] truncate max-w-[120px] sm:max-w-none">
                        {combo.hookName}
                      </span>
                      <span className="text-[#666666]">+</span>
                      <span className="font-semibold text-[#E0E0E0] truncate max-w-[120px] sm:max-w-none">
                        {combo.developmentName}
                      </span>
                      <span className="text-[#666666]">+</span>
                      <span className="font-semibold text-[#E8A0BF] truncate max-w-[120px] sm:max-w-none">
                        {combo.ctaName}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#777777]">Sequência linear FFmpeg (9:16)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#242424]">
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#D0D0D0] bg-[#222222] px-2 py-1 rounded-lg">
                    <Clock className="w-3 h-3 text-[#E8A0BF]" />
                    ~{combo.estimatedDurationFormatted}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#181818] border-t border-[#262626] flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto rounded-2xl bg-[#E8A0BF] px-6 py-2.5 text-xs font-bold text-[#111111] hover:bg-[#df8fb1] transition-all"
          >
            Fechar Matriz
          </button>
        </div>
      </div>
    </div>
  );
};
