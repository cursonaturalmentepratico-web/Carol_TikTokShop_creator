import React, { useState } from 'react';
import { Lock, Mail, AlertCircle, Loader2, KeyRound, Sparkles } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isSupabaseConfigured) {
      setErrorMessage(
        'O Supabase Cloud precisa ser configurado com as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.'
      );
      return;
    }

    if (!email.trim() || !password) {
      setErrorMessage('Por favor, informe seu e-mail e senha.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('Falha de autenticação Supabase:', error.message);
        // Translate common Supabase Auth error messages to clear Portuguese
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('E-mail ou senha incorretos. Verifique suas credenciais.');
        } else if (error.message.includes('Email not confirmed')) {
          setErrorMessage('O e-mail cadastrado ainda não foi confirmado.');
        } else if (error.message.includes('Too many requests')) {
          setErrorMessage('Muitas tentativas sem sucesso. Aguarde alguns instantes.');
        } else {
          setErrorMessage(error.message);
        }
        return;
      }

      if (data?.session) {
        onLoginSuccess();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na conexão com o servidor de autenticação.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col justify-center items-center px-4 py-12 selection:bg-[#E8A0BF] selection:text-[#111111]">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in duration-300">
        {/* Brand identity header */}
        <div className="text-center space-y-3">
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#242424] to-[#161616] border border-[#333333] shadow-2xl">
            <span className="font-serif italic text-2xl font-bold text-[#E8A0BF] tracking-tight">CR</span>
            <div className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full bg-[#E8A0BF] ring-4 ring-[#111111]" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-serif">
              Carol Rosa
            </h1>
            <p className="text-sm font-semibold tracking-wider text-[#E8A0BF] uppercase">
              TikTokShop Editor
            </p>
          </div>

          <p className="text-xs text-[#8E8E8E] max-w-xs mx-auto">
            Acesso exclusivo para criadora de conteúdo
          </p>
        </div>

        {/* Missing environment config warning if not provided */}
        {!isSupabaseConfigured && (
          <div className="rounded-2xl border border-amber-800/40 bg-amber-950/20 p-4 text-xs text-amber-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Configuração Pendente do Supabase</span>
            </div>
            <p className="text-[#C8C8C8] leading-relaxed">
              Defina as variáveis de ambiente <code className="text-[#E8A0BF]">VITE_SUPABASE_URL</code> e{' '}
              <code className="text-[#E8A0BF]">VITE_SUPABASE_PUBLISHABLE_KEY</code> no painel ou arquivo .env para conectar ao seu projeto Supabase.
            </p>
          </div>
        )}

        {/* Login form card */}
        <div className="rounded-3xl border border-[#262626] bg-[#161616] p-6 sm:p-7 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-start gap-2.5 rounded-2xl bg-rose-950/30 border border-rose-800/40 p-3.5 text-xs text-rose-200 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="login-email"
                className="block text-xs font-bold uppercase tracking-wider text-[#C0C0C0]"
              >
                E-mail
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#666666]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu-email@dominio.com"
                  className="w-full rounded-2xl border border-[#303030] bg-[#121212] pl-10 pr-4 py-3 text-sm font-medium text-white placeholder-[#555555] focus:border-[#E8A0BF] focus:outline-none focus:ring-1 focus:ring-[#E8A0BF] transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="login-password"
                className="block text-xs font-bold uppercase tracking-wider text-[#C0C0C0]"
              >
                Senha
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#666666]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-[#303030] bg-[#121212] pl-10 pr-4 py-3 text-sm font-medium text-white placeholder-[#555555] focus:border-[#E8A0BF] focus:outline-none focus:ring-1 focus:ring-[#E8A0BF] transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#E8A0BF] py-3.5 px-4 text-sm font-bold text-[#111111] hover:bg-[#df8fb1] active:scale-[0.98] transition-all shadow-lg shadow-[#E8A0BF]/10 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#111111]" />
                  <span>Entrando...</span>
                </>
              ) : (
                <span>Entrar</span>
              )}
            </button>
          </form>
        </div>

        {/* Security badge note */}
        <p className="text-center text-[11px] text-[#666666]">
          Ambiente seguro • Autenticação direta com Supabase Cloud
        </p>
      </div>
    </div>
  );
};
