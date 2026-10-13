import { supabase } from './supabase';

export type RenderStatus =
  | 'not_started'
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'deleting'
  | 'expired';

export interface RenderJob {
  projectId?: string;
  status: RenderStatus;
  createdAt?: string;
  startedAt?: string;
  finishedAt?: string;
  deletedAt?: string;
  error?: string;
}

export interface RenderOutput {
  filename: string;
  size: number;
}

export interface RenderOutputsResponse {
  files: RenderOutput[];
  expiresAt: string;
}

const getApiUrl = (): string => {
  const url = import.meta.env.VITE_API_URL?.trim();

  if (!url) {
    throw new Error('URL da API de vídeos não configurada.');
  }

  return url.replace(/\/+$/, '');
};

async function authenticatedRequest(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const { data, error } = await supabase.auth.getSession();

  const token = data.session?.access_token;

  if (error || !token) {
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${getApiUrl()}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `Erro HTTP ${response.status}`;

    try {
      const body = await response.json();
      message = body.error || message;
    } catch {
      // Resposta sem JSON.
    }

    throw new Error(message);
  }

  return response;
}

export const RenderApi = {
  async upload(
    projectId: string,
    category: 'gancho' | 'desenvolvimento' | 'cta',
    slot: number,
    file: File
  ): Promise<void> {
    const form = new FormData();
    form.append('file', file);

    await authenticatedRequest(
      `/projects/${projectId}/uploads/${category}/${slot}`,
      {
        method: 'POST',
        body: form,
      }
    );
  },

  async start(projectId: string): Promise<{
    queued: boolean;
    status: string;
    combinations: number;
  }> {
    const response = await authenticatedRequest(
      `/projects/${projectId}/render`,
      { method: 'POST' }
    );

    return response.json();
  },

  async status(projectId: string): Promise<RenderJob> {
    const response = await authenticatedRequest(
      `/projects/${projectId}/render`
    );

    const result = await response.json();
    return result.job;
  },

  async outputs(projectId: string): Promise<RenderOutputsResponse> {
    const response = await authenticatedRequest(
      `/projects/${projectId}/outputs`
    );

    return response.json();
  },

  async download(
    projectId: string,
    filename: string
  ): Promise<void> {
    if (!/^combinacao-\d{3}\.mp4$/.test(filename)) {
      throw new Error('Nome de vídeo inválido.');
    }

    const response = await authenticatedRequest(
      `/projects/${projectId}/outputs/${filename}`
    );

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    }
  },

  async deleteVideos(projectId: string): Promise<void> {
    await authenticatedRequest(
      `/projects/${projectId}/outputs`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirm: true }),
      }
    );
  },
};
