import React from 'react';
import { Server, LogOut, User } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onOpenSettings: () => void;
  onGoHome?: () => void;
  isInsideProject?: boolean;
  userEmail?: string | null;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onGoHome,
  isInsideProject = false,
  userEmail,
  onSignOut,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#222222] bg-[#111111]/90 backdrop-blur-md pt-safe">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand identity */}
        <div
          onClick={onGoHome}
          className={`flex items-center gap-3 ${onGoHome ? 'cursor-pointer' : ''} group`}
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#242424] to-[#161616] border border-[#333333] shadow-inner group-hover:border-[#E8A0BF]/50 transition-colors">
            <span className="font-serif italic text-base font-bold text-[#E8A0BF] tracking-tight">CR</span>
            <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#E8A0BF] ring-2 ring-[#111111]" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-bold tracking-tight text-[#FFFFFF]">Carol Rosa</span>
              <span className="inline-flex items-center rounded-full bg-[#E8A0BF]/15 px-1.5 py-0.5 text-[9px] font-semibold text-[#E8A0BF] border border-[#E8A0BF]/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] font-medium tracking-wider text-[#A0A0A0] uppercase">
              TikTokShop Editor
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 rounded-full border border-[#2a2a2a] bg-[#191919] px-3 py-1.5 text-xs text-[#CCCCCC] hover:border-[#E8A0BF]/40 hover:text-white active:scale-95 transition-all cursor-pointer"
            title="Configurações e Diagnóstico da API"
          >
            <Server className="w-3.5 h-3.5 text-[#E8A0BF]" />
            <span className="hidden sm:inline">Configurações</span>
          </button>

          <PWAInstallButton />

          {onSignOut && (
            <button
              onClick={onSignOut}
              className="flex items-center gap-1.5 rounded-full border border-[#2a2a2a] bg-[#191919] px-3 py-1.5 text-xs text-[#A0A0A0] hover:border-rose-900/50 hover:bg-rose-950/20 hover:text-rose-300 active:scale-95 transition-all"
              title={userEmail ? `Sair (${userEmail})` : 'Sair da conta'}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
