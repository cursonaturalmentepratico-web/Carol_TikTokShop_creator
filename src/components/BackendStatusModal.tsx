import React, { useState } from 'react';
import {
  X,
  Server,
  Layers,
  Code2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Project, BackendPayload } from '../types';
import { BackendService } from '../services/api';

interface BackendStatusModalProps {
  project: Project;
  onClose: () => void;
  onOpenResultsPreview: () => void;
}

export const BackendStatusModal: React.FC<BackendStatusModalProps> = ({
  project,
  onClose,
  onOpenResultsPreview,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'payload'>('status');
  const [copied, setCopied] = useState(false);

  const payload: BackendPayload = BackendService.buildProjectPayload(project);

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-lg max-h-[92vh] rounded-3xl bg-[#161616] border border-[#2e2e2e] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#1b1b1b] border-b border-[#262626]">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#E8A0BF]/15 flex items-center justify-center text-[#E8A0BF] border border-[#E8A0BF]/30">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Status do Processamento</h3>
              <p className="text-xs text-[#999999]">Integração FFmpeg & VPS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#242424] flex items-center justify-center text-[#888888] hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#262626] bg-[#141414] px-4 pt-2">
          <button
            onClick={() => setActiveTab('status')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'status'
                ? 'border-[#E8A0BF] text-[#E8A0BF]'
                : 'border-transparent text-[#888888] hover:text-white'
            }`}
          >
            Status do Backend
          </button>
          <button
            onClick={() => setActiveTab('payload')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'payload'
                ? 'border-[#E8A0BF] text-[#E8A0BF]'
                : 'border-transparent text-[#888888] hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Pacote JSON (FFmpeg)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'status' ? (
            <>
              {/* Important Official Notification Card */}
              <div className="rounded-2xl border border-amber-800/40 bg-amber-950/20 p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs sm:text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Processamento Real Aguardando Backend VPS</span>
                </div>
                <p className="text-xs text-[#D8D8D8] leading-relaxed">
                  Conforme planejado para esta primeira etapa, o processamento de renderização com
                  FFmpeg não é executado no navegador. Os <strong>{project.totalCombinations} vídeos</strong> foram
                  validados e estruturados com precisão, prontos para envio ao servidor remoto.
                </p>
              </div>

              {/* Summary Stats */}
              <div className="rounded-2xl bg-[#1c1c1c] p-4 border border-[#282828] space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#A0A0A0] block">
                  Resumo do Pacote Pronto para Envio
                </span>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-[#242424] p-2.5 border border-[#303030]">
                    <span className="text-xs text-[#888888] block">Ganchos</span>
                    <span className="text-base font-bold text-[#E8A0BF]">{project.hooks.length}</span>
                  </div>
                  <div className="rounded-xl bg-[#242424] p-2.5 border border-[#303030]">
                    <span className="text-xs text-[#888888] block">Desenv.</span>
                    <span className="text-base font-bold text-white">{project.developments.length}</span>
                  </div>
                  <div className="rounded-xl bg-[#242424] p-2.5 border border-[#303030]">
                    <span className="text-xs text-[#888888] block">CTAs</span>
                    <span className="text-base font-bold text-[#E8A0BF]">{project.ctas.length}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#262626] text-xs">
                  <span className="text-[#AAAAAA]">Total de Combinações:</span>
                  <span className="font-bold text-white font-mono">{project.totalCombinations} vídeos únicos</span>
                </div>
              </div>

              {/* Next Steps / Architecture Readiness */}
              <div className="rounded-2xl bg-[#191919] p-4 border border-[#262626] space-y-2.5 text-xs text-[#A0A0A0]">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#E8A0BF]" />
                  <span>Próximos Passos na VPS</span>
                </div>
                <ul className="space-y-1.5 list-disc list-inside text-[11px] text-[#B0B0B0]">
                  <li>Configurar endpoint remoto (ex: <code className="text-[#E8A0BF]">https://render.seuservidor.com</code>)</li>
                  <li>Executar worker Docker com FFmpeg para concatenação sem perda</li>
                  <li>Ativar política de auto-limpeza em 2 horas após renderização</li>
                </ul>
              </div>

              {/* View Results Screen Architecture Button */}
              <button
                type="button"
                onClick={onOpenResultsPreview}
                className="flex w-full items-center justify-between rounded-2xl bg-[#252525] p-3.5 border border-[#333333] hover:border-[#E8A0BF] text-xs font-semibold text-white transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-[#E8A0BF]" />
                  <span>Visualizar Interface da Tela de Resultados</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#777777] group-hover:text-white transition-colors" />
              </button>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#888888]">
                  Manifesto pronto para a fila do FFmpeg (JSON):
                </span>
                <button
                  onClick={handleCopyPayload}
                  className="flex items-center gap-1 text-xs text-[#E8A0BF] hover:underline"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>

              <pre className="rounded-2xl bg-black p-3.5 text-[11px] font-mono text-[#CCCCCC] overflow-x-auto max-h-[360px] border border-[#2a2a2a]">
                {JSON.stringify(payload, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#181818] border-t border-[#262626] flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto rounded-2xl bg-[#E8A0BF] px-6 py-2.5 text-xs font-bold text-[#111111] hover:bg-[#df8fb1] transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
