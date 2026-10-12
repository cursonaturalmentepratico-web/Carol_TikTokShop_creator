import { BackendPayload, Project } from '../types';

/**
 * Interface representing the VPS FFmpeg Processing Server contract
 */
export interface BackendConfig {
  apiUrl: string;
  configured: boolean;
}

export interface BackendJobResponse {
  jobId: string;
  projectId: string;
  status: 'queued' | 'processing' | 'ready' | 'failed';
  totalVideos: number;
  expiresAt: string; // ISO date format for 2-hour server deletion
  message: string;
}

export const BackendService = {
  /**
   * Checks whether the external VPS FFmpeg processing worker is configured
   */
  isConfigured(): boolean {
    const customEndpoint = (import.meta as unknown as { env: Record<string, string> }).env.VITE_FFMPEG_BACKEND_URL;
    return Boolean(customEndpoint && customEndpoint.trim().length > 0);
  },

  /**
   * Builds the exact payload package ready for the external FFmpeg backend on the VPS
   */
  buildProjectPayload(project: Project): BackendPayload {
    const combinationsMatrix: BackendPayload['combinationsMatrix'] = [];
    let count = 1;

    for (const h of project.hooks) {
      for (const d of project.developments) {
        for (const c of project.ctas) {
          combinationsMatrix.push({
            combinationId: `vcombo_${count}`,
            sequence: [h.id, d.id, c.id],
          });
          count++;
        }
      }
    }

    return {
      projectId: project.id,
      projectTitle: project.title,
      totalCombinations: project.totalCombinations,
      clips: {
        hooks: project.hooks.map((h) => ({ id: h.id, name: h.name, duration: h.duration })),
        developments: project.developments.map((d) => ({ id: d.id, name: d.name, duration: d.duration })),
        ctas: project.ctas.map((c) => ({ id: c.id, name: c.name, duration: c.duration })),
      },
      combinationsMatrix,
    };
  },

  /**
   * Dispatches the project to the external VPS FFmpeg backend.
   * If not configured, throws an informative error explaining that the backend is pending.
   */
  async submitForProcessing(project: Project): Promise<BackendJobResponse> {
    const isConfigured = this.isConfigured();

    if (!isConfigured) {
      throw new Error(
        'O processamento real em VPS ainda não está disponível nesta etapa. O backend externo com FFmpeg será conectado posteriormente.'
      );
    }

    const endpoint = (import.meta as unknown as { env: Record<string, string> }).env.VITE_FFMPEG_BACKEND_URL;
    const payload = this.buildProjectPayload(project);

    const formData = new FormData();
    formData.append('manifest', JSON.stringify(payload));

    // Append actual video files from the session
    project.hooks.forEach((h, idx) => {
      if (h.file) formData.append(`hook_${idx}`, h.file, h.name);
    });
    project.developments.forEach((d, idx) => {
      if (d.file) formData.append(`dev_${idx}`, d.file, d.name);
    });
    project.ctas.forEach((c, idx) => {
      if (c.file) formData.append(`cta_${idx}`, c.file, c.name);
    });

    const response = await fetch(`${endpoint}/api/v1/render`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Falha no servidor de renderização: ${err}`);
    }

    return response.json();
  },

  /**
   * Fetches job status from the remote VPS
   */
  async fetchJobStatus(jobId: string): Promise<BackendJobResponse> {
    const endpoint = (import.meta as unknown as { env: Record<string, string> }).env.VITE_FFMPEG_BACKEND_URL;
    if (!endpoint) {
      throw new Error('Backend não configurado.');
    }

    const response = await fetch(`${endpoint}/api/v1/jobs/${jobId}`);
    if (!response.ok) {
      throw new Error('Falha ao consultar status na VPS.');
    }
    return response.json();
  },

  /**
   * Diagnóstico temporário da autenticação da API:
   * 1. Recupera a sessão atual do Supabase
   * 2. Verifica se existe access_token
   * 3. Se não existir, retorna "Sessão não encontrada"
   * 4. Se existir, envia GET para ${VITE_API_URL}/auth/test com Authorization: Bearer
   * 5. Nunca registra ou exibe o JWT
   */
  async testApiAuthentication(): Promise<{
    success: boolean;
    message: string;
    statusCode?: number;
    responseBody?: unknown;
    endpoint?: string;
  }> {
    // 1 & 2. Recuperar sessão do Supabase
    const { supabase } = await import('./supabase');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    const accessToken = sessionData?.session?.access_token;

    // 3. Caso não exista token ou sessão
    if (!accessToken || sessionError) {
      return {
        success: false,
        message: 'Sessão não encontrada',
      };
    }

    // Verificar se a URL da API está configurada
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl || typeof apiUrl !== 'string' || !apiUrl.trim()) {
      return {
        success: false,
        message: 'API ainda não configurada',
      };
    }

    // 4. Preparar requisição GET para /auth/test com Authorization: Bearer
    const cleanUrl = `${apiUrl.trim().replace(/\/+$/, '')}/auth/test`;

    try {
      const response = await fetch(cleanUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      let parsedBody: unknown = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          parsedBody = await response.json();
        } catch {
          parsedBody = null;
        }
      } else {
        parsedBody = await response.text();
      }

      if (response.ok) {
        return {
          success: true,
          message: `Requisição bem-sucedida (${response.status} ${response.statusText || 'OK'})`,
          statusCode: response.status,
          responseBody: parsedBody,
          endpoint: cleanUrl,
        };
      } else {
        return {
          success: false,
          message: `Resposta da API: HTTP ${response.status} ${response.statusText || 'Erro'}`,
          statusCode: response.status,
          responseBody: parsedBody,
          endpoint: cleanUrl,
        };
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Falha na comunicação de rede com o endpoint.';
      return {
        success: false,
        message: `Falha ao conectar com o endpoint: ${errorMsg}`,
        endpoint: cleanUrl,
      };
    }
  },
};
