import React from 'react';
import { Layers, Sparkles, CheckCircle2, AlertCircle, Eye } from 'lucide-react';

interface CombinationsCounterProps {
  hooksCount: number;
  developmentsCount: number;
  ctasCount: number;
  onViewMatrix: () => void;
}

export const CombinationsCounter: React.FC<CombinationsCounterProps> = ({
  hooksCount,
  developmentsCount,
  ctasCount,
  onViewMatrix,
}) => {
  const total = hooksCount * developmentsCount * ctasCount;
  const isComplete = hooksCount > 0 && developmentsCount > 0 && ctasCount > 0;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#2d2d2d] bg-gradient-to-b from-[#1c1c1c] to-[#141414] p-5 sm:p-6 shadow-xl">
      {/* Background glow subtle pink */}
      <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-[#E8A0BF]/10 blur-2xl" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left side: Formula breakdown */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E8A0BF]/15 text-[#E8A0BF]">
              <Layers className="h-3 w-3" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#E8A0BF]">
              Cálculo Dinâmico de Variações
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold text-white">
            <div className="flex items-center gap-1.5 rounded-xl bg-[#222222] px-2.5 py-1.5 border border-[#303030]">
              <span className="text-[#A0A0A0]">Ganchos:</span>
              <span className={hooksCount > 0 ? 'text-[#E8A0BF] font-bold' : 'text-[#666666]'}>
                {hooksCount}
              </span>
            </div>

            <span className="text-[#666666] font-bold">×</span>

            <div className="flex items-center gap-1.5 rounded-xl bg-[#222222] px-2.5 py-1.5 border border-[#303030]">
              <span className="text-[#A0A0A0]">Desenv.:</span>
              <span className={developmentsCount > 0 ? 'text-[#E8A0BF] font-bold' : 'text-[#666666]'}>
                {developmentsCount}
              </span>
            </div>

            <span className="text-[#666666] font-bold">×</span>

            <div className="flex items-center gap-1.5 rounded-xl bg-[#222222] px-2.5 py-1.5 border border-[#303030]">
              <span className="text-[#A0A0A0]">CTAs:</span>
              <span className={ctasCount > 0 ? 'text-[#E8A0BF] font-bold' : 'text-[#666666]'}>
                {ctasCount}
              </span>
            </div>
          </div>
        </div>

        {/* Right side: Total counter with animated number */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#262626]">
          <div className="text-left sm:text-right">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
                {total}
              </span>
              <span className="text-sm font-bold text-[#E8A0BF]">
                {total === 1 ? 'vídeo' : 'vídeos'}
              </span>
            </div>
            <p className="text-[11px] font-medium text-[#888888]">
              {total > 0 ? 'combinações prontas para render' : 'aguardando vídeos'}
            </p>
          </div>

          {total > 0 && (
            <button
              onClick={onViewMatrix}
              className="flex items-center gap-1.5 rounded-2xl border border-[#333333] bg-[#222222] px-3 py-2 text-xs font-semibold text-white hover:border-[#E8A0BF] hover:text-[#E8A0BF] active:scale-95 transition-all"
              title="Visualizar a lista detalhada das combinações"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver Matriz</span>
            </button>
          )}
        </div>
      </div>

      {/* Status bar helper */}
      <div className="mt-4 pt-3 border-t border-[#252525]">
        {isComplete ? (
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              Todas as 3 partes preenchidas! Você pode gerar <strong>{total} vídeos únicos</strong> para testar no TikTok Shop.
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-[#999999]">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#E8A0BF]" />
            <span>
              {hooksCount === 0 && developmentsCount === 0 && ctasCount === 0
                ? 'Adicione pelo menos 1 gancho, 1 desenvolvimento e 1 CTA para calcular.'
                : `Falta adicionar vídeos em: ${[
                    hooksCount === 0 ? 'Ganchos' : null,
                    developmentsCount === 0 ? 'Desenvolvimentos' : null,
                    ctasCount === 0 ? 'CTAs' : null,
                  ]
                    .filter(Boolean)
                    .join(', ')}.`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
