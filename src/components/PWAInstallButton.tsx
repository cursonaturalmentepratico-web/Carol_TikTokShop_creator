import React, { useState } from 'react';
import { Download, Share, PlusSquare, X, Smartphone, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running inside standalone PWA mode, don't show prompt
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-full bg-[#E8A0BF] px-4 py-2 text-xs font-semibold text-[#111111] shadow-md hover:bg-[#df8fb1] active:scale-95 transition-all"
        title="Instalar App no Celular"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Instalar App</span>
      </button>
    );
  }

  // iOS Safari flow or generic install info
  return (
    <>
      <button
        onClick={() => setShowIOSGuide(true)}
        className="flex items-center gap-1.5 rounded-full border border-[#333333] bg-[#1a1a1a] px-3.5 py-1.5 text-xs font-medium text-[#F5F5F5] hover:border-[#E8A0BF] hover:text-[#E8A0BF] active:scale-95 transition-all"
      >
        <Smartphone className="w-3.5 h-3.5 text-[#E8A0BF]" />
        <span>{isIOS ? 'Instalar no iPhone' : 'Instalar como App'}</span>
      </button>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-[#2a2a2a] bg-[#161616] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E8A0BF]/15 border border-[#E8A0BF]/30 flex items-center justify-center text-[#E8A0BF]">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Instalar no iPhone</h3>
                  <p className="text-[11px] text-[#A0A0A0]">Carol Rosa TikTokShop Editor</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-8 h-8 rounded-full bg-[#222222] flex items-center justify-center text-[#888888] hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-3.5 rounded-2xl bg-[#1d1d1d] p-3.5 border border-[#262626]">
                <div className="w-7 h-7 rounded-lg bg-[#2a2a2a] flex items-center justify-center shrink-0 text-[#E8A0BF]">
                  <Share className="w-4 h-4" />
                </div>
                <div className="text-xs text-[#E0E0E0] leading-relaxed">
                  <span className="font-semibold text-white block mb-0.5">1. Toque em Compartilhar</span>
                  No Safari do iPhone, toque no botão de compartilhar (ícone com quadrado e seta para cima na barra inferior).
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-2xl bg-[#1d1d1d] p-3.5 border border-[#262626]">
                <div className="w-7 h-7 rounded-lg bg-[#2a2a2a] flex items-center justify-center shrink-0 text-[#E8A0BF]">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div className="text-xs text-[#E0E0E0] leading-relaxed">
                  <span className="font-semibold text-white block mb-0.5">2. Adicionar à Tela de Início</span>
                  Role para baixo e selecione a opção <strong className="text-[#E8A0BF]">"Adicionar à Tela de Início"</strong>.
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-2xl bg-[#1d1d1d] p-3.5 border border-[#262626]">
                <div className="w-7 h-7 rounded-lg bg-[#2a2a2a] flex items-center justify-center shrink-0 text-[#E8A0BF]">
                  <Check className="w-4 h-4" />
                </div>
                <div className="text-xs text-[#E0E0E0] leading-relaxed">
                  <span className="font-semibold text-white block mb-0.5">3. Acesso Rápido em Tela Cheia</span>
                  O editor funcionará como um aplicativo nativo no seu iPhone, sem barras de navegação.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-6 w-full rounded-2xl bg-[#E8A0BF] py-3 text-sm font-semibold text-[#111111] hover:bg-[#df8fb1] active:scale-[0.98] transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
