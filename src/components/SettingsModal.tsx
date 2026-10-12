import React, { useState } from 'react';
import {
  X,
  Settings,
  Server,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
  Layers,
  Database,
  Smartphone,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { BackendService } from '../services/api';

interface SettingsModalProps {
  onClose: () => void;
  userEmail?: string | null;
}

interface DiagnosticState {
  status: 'idle' | 'loading' | 'success' | 'error' | 'unconfigured' | 'no_session';
  message: string;
  statusCode?: number;
  responseBody?: unknown;
  endpoint?: string;
  timestamp?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, userEmail }) => {
  const [activeTab, setActiveTab] = useState<'diagnostic' | 'architecture'>('diagnostic');
  const [diagnostic, setDiagnostic] = useState<DiagnosticState>({
    status: 'idle',
    message: '',
  });

  const handleTestApiAuth = async () => {
    setDiagnostic({
      status: 'loading',
      message: 'Executando teste de autenticação...',
    });

    try {
      const result = await BackendService.testApiAuthentication();

      if (!result.success) {
        if (result.message === 'Sessão não encontrada') {
          setDiagnostic({
            status: 'no_session',
            message: 'Sessão não encontrada',
            timestamp: new Date().toLocaleTimeString(),
          });
        } else if (result.message === 'API ainda não configurada') {
          setDiagnostic({
            status: 'unconfigured',
            message: 'API ainda não configurada',
            timestamp: new Date().toLocaleTimeString(),
          });
        } else {
          setDiagnostic({
            status: 'error',
            message: result.message,
            statusCode: result.statusCode,
            responseBody: result.responseBody,
            endpoint: result.endpoint,
            timestamp: new Date().toLocaleTimeString(),
          });
        }
      } else {
        setDiagnostic({
          status: 'success',
          message: result.message,
          statusCode: result.statusCode,
          responseBody: result.responseBody,
          endpoint: result.endpoint,
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha desconhecida durante o teste.';
      setDiagnostic({
        status: 'error',
        message: msg,
        timestamp: new Date().toLocaleTimeString(),
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-xl max-h-[92vh] rounded-3xl bg-[#161616] border border-[#2e2e2e] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#1b1b1b] border-b border-[#262626]">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#E8A0BF]/15 flex items-center justify-center text-[#E8A0BF] border border-[#E8A0BF]/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Configurações & Diagnóstico</h3>
              <p className="text-xs text-[#999999]">
                {userEmail ? `Conectado como ${userEmail}` : 'Área de Configurações'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#242424] flex items-center justify-center text-[#888888] hover:text-white transition"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#262626] bg-[#141414] px-4 pt-2">
          <button
            onClick={() => setActiveTab('diagnostic')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'diagnostic'
                ? 'border-[#E8A0BF] text-[#E8A0BF]'
                : 'border-transparent text-[#888888] hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Diagnóstico da Autenticação</span>
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'architecture'
                ? 'border-[#E8A0BF] text-[#E8A0BF]'
                : 'border-transparent text-[#888888] hover:text-white'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Arquitetura do Sistema</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'diagnostic' ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#1c1c1c] p-4 border border-[#282828] space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#E8A0BF] block">
                  Teste de Autenticação da API
                </span>
                <p className="text-xs text-[#CCCCCC] leading-relaxed">
                  Recupera a sessão atual do Supabase e valida o envio seguro do token para o
                  endpoint <code className="text-[#E8A0BF]">/auth/test</code> da API configurada em{' '}
                  <code className="text-white font-mono">VITE_API_URL</code>.
                </p>
                <div className="flex items-center gap-1.5 pt-1 text-[11px] text-[#888888]">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Segurança garantida: o JWT nunca é exibido na tela nem registrado em logs.</span>
                </div>
              </div>

              {/* Botão solicitado */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleTestApiAuth}
                  disabled={diagnostic.status === 'loading'}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#E8A0BF] py-3.5 px-5 text-sm font-bold text-[#111111] hover:bg-[#df8fb1] active:scale-[0.98] transition-all shadow-md shadow-[#E8A0BF]/10 disabled:opacity-50 cursor-pointer"
                >
                  {diagnostic.status === 'loading' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#111111]" />
                      <span>Testando autenticação...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Testar autenticação da API</span>
                    </>
                  )}
                </button>
              </div>

              {/* Resultado do Teste */}
              {diagnostic.status !== 'idle' && (
                <div className="space-y-3 pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#A0A0A0] block">
                    Resultado da Requisição
                  </span>

                  {/* Estado: Sem Sessão */}
                  {diagnostic.status === 'no_session' && (
                    <div className="flex items-start gap-3 rounded-2xl border border-rose-900/50 bg-rose-950/20 p-4 text-xs text-rose-200 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-semibold text-rose-300">
                          Sessão não encontrada
                        </strong>
                        <p className="mt-0.5 text-rose-300/80">
                          Nenhuma sessão ativa foi localizada no Supabase. Faça login novamente para obter um access_token válido.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Estado: API não configurada */}
                  {diagnostic.status === 'unconfigured' && (
                    <div className="flex items-start gap-3 rounded-2xl border border-amber-900/50 bg-amber-950/20 p-4 text-xs text-amber-200 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-semibold text-amber-300">
                          API ainda não configurada
                        </strong>
                        <p className="mt-0.5 text-amber-300/80">
                          A variável de ambiente <code className="font-mono text-white">VITE_API_URL</code> não foi definida. Configure a URL base da sua API (ex: https://api.seuservidor.com) para executar o diagnóstico.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Estado: Sucesso */}
                  {diagnostic.status === 'success' && (
                    <div className="rounded-2xl border border-emerald-900/50 bg-emerald-950/20 p-4 space-y-2 text-xs text-emerald-200 animate-in fade-in">
                      <div className="flex items-center gap-2 font-bold text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                        <span>Autenticação Validada com Sucesso</span>
                      </div>
                      <p className="text-emerald-300/90 leading-relaxed">
                        {diagnostic.message}
                      </p>
                      {diagnostic.endpoint && (
                        <div className="text-[11px] font-mono text-emerald-400/80 truncate">
                          Endpoint: {diagnostic.endpoint}
                        </div>
                      )}
                      {diagnostic.responseBody !== undefined && (
                        <div className="pt-2">
                          <span className="text-[10px] font-mono uppercase text-[#AAAAAA] block mb-1">
                            Resposta da API:
                          </span>
                          <pre className="rounded-xl bg-black/60 p-3 text-[11px] font-mono text-[#D0D0D0] overflow-x-auto max-h-36 border border-emerald-950">
                            {typeof diagnostic.responseBody === 'object'
                              ? JSON.stringify(diagnostic.responseBody, null, 2)
                              : String(diagnostic.responseBody)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Estado: Erro HTTP ou Conexão */}
                  {diagnostic.status === 'error' && (
                    <div className="rounded-2xl border border-rose-900/50 bg-rose-950/20 p-4 space-y-2 text-xs text-rose-200 animate-in fade-in">
                      <div className="flex items-center gap-2 font-bold text-rose-300">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                        <span>Erro ao Executar Teste</span>
                      </div>
                      <p className="text-rose-300/90 leading-relaxed">
                        {diagnostic.message}
                      </p>
                      {diagnostic.endpoint && (
                        <div className="text-[11px] font-mono text-rose-400/80 truncate">
                          Endpoint: {diagnostic.endpoint}
                        </div>
                      )}
                      {diagnostic.responseBody !== undefined && diagnostic.responseBody !== null && (
                        <div className="pt-2">
                          <span className="text-[10px] font-mono uppercase text-[#AAAAAA] block mb-1">
                            Corpo do Erro retornado:
                          </span>
                          <pre className="rounded-xl bg-black/60 p-3 text-[11px] font-mono text-rose-200 overflow-x-auto max-h-36 border border-rose-950">
                            {typeof diagnostic.responseBody === 'object'
                              ? JSON.stringify(diagnostic.responseBody, null, 2)
                              : String(diagnostic.responseBody)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Tab Arquitetura */
            <div className="space-y-3 text-xs text-[#CCCCCC] leading-relaxed">
              <div className="rounded-2xl bg-[#1b1b1b] p-4 border border-[#282828] space-y-1.5">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Smartphone className="w-4 h-4 text-[#E8A0BF]" />
                  <span>Frontend Mobile-First & PWA</span>
                </div>
                <p>
                  Construído em <strong>React 19 + TypeScript + Tailwind CSS</strong>, otimizado para a
                  experiência de toque no Safari do iPhone com suporte a Progressive Web App (PWA) e seleção
                  direta de vídeos da galeria.
                </p>
              </div>

              <div className="rounded-2xl bg-[#1b1b1b] p-4 border border-[#282828] space-y-1.5">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Database className="w-4 h-4 text-[#E8A0BF]" />
                  <span>Supabase Cloud (Auth & Projects)</span>
                </div>
                <p>
                  Autenticação segura via <code className="text-[#E8A0BF]">supabase.auth</code> e persistência na tabela <code className="text-[#E8A0BF]">public.projects</code>. Sem exposição de chaves privadas ou service_role.
                </p>
              </div>

              <div className="rounded-2xl bg-[#1b1b1b] p-4 border border-[#282828] space-y-1.5">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Clock className="w-4 h-4 text-[#E8A0BF]" />
                  <span>Retenção de 2 Horas no Servidor</span>
                </div>
                <p>
                  Vídeos processados pelo backend externo permanecem disponíveis por 2 horas com exclusão automática após o término do prazo.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#181818] border-t border-[#262626] flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto rounded-2xl bg-[#242424] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#2c2c2c] transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
