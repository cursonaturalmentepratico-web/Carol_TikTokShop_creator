import React from 'react';
import { X, Server, Database, Shield, Zap, Layers, Clock, Smartphone } from 'lucide-react';

interface ArchitectureInfoModalProps {
  onClose: () => void;
}

export const ArchitectureInfoModal: React.FC<ArchitectureInfoModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-lg max-h-[90vh] rounded-3xl bg-[#161616] border border-[#2e2e2e] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#1b1b1b] border-b border-[#262626]">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#E8A0BF]/15 flex items-center justify-center text-[#E8A0BF] border border-[#E8A0BF]/30">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Arquitetura do Sistema</h3>
              <p className="text-xs text-[#999999]">Supabase Cloud & VPS FFmpeg</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#242424] flex items-center justify-center text-[#888888] hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-[#CCCCCC] leading-relaxed">
          <div className="rounded-2xl bg-[#1b1b1b] p-4 border border-[#282828] space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Smartphone className="w-4 h-4 text-[#E8A0BF]" />
              <span>1. Frontend Mobile-First (iPhone & PWA)</span>
            </div>
            <p>
              Construído em <strong>React 19 + TypeScript + Tailwind CSS</strong>, otimizado para a
              experiência de toque no Safari do iOS com suporte a Progressive Web App (PWA) e seleção
              direta de arquivos de vídeo da galeria.
            </p>
          </div>

          <div className="rounded-2xl bg-[#1b1b1b] p-4 border border-[#282828] space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Layers className="w-4 h-4 text-[#E8A0BF]" />
              <span>2. Motor de Combinações TikTok Shop</span>
            </div>
            <p>
              Calcula dinamicamente a fórmula matemática <code className="text-[#E8A0BF]">Ganchos × Desenvolvimentos × CTAs</code> (até 27 vídeos na v1). Os vídeos são estruturados em matrizes ordenadas prontas para renderização.
            </p>
          </div>

          <div className="rounded-2xl bg-[#1b1b1b] p-4 border border-[#282828] space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Database className="w-4 h-4 text-[#E8A0BF]" />
              <span>3. Integração com Supabase Cloud</span>
            </div>
            <p>
              A camada de dados está desenhada para autenticação por sessão e gravação de histórico de projetos no Supabase Cloud, garantindo privacidade absoluta dos vídeos da criadora sem exposição de segredos no cliente.
            </p>
          </div>

          <div className="rounded-2xl bg-[#1b1b1b] p-4 border border-[#282828] space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Clock className="w-4 h-4 text-[#E8A0BF]" />
              <span>4. Política de Retenção de 2 Horas (Auto-Exclusão)</span>
            </div>
            <p>
              Após a conclusão do render na VPS, o servidor define um carimbo de data/hora (<code className="text-[#E8A0BF]">expiresAt</code>). O aplicativo exibe uma contagem regressiva em tempo real. Passadas 2 horas, todos os arquivos temporários são excluídos automaticamente.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#181818] border-t border-[#262626] flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto rounded-2xl bg-[#E8A0BF] px-6 py-2.5 text-xs font-bold text-[#111111] hover:bg-[#df8fb1] transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
