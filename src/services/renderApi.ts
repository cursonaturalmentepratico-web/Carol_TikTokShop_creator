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
    filename: string,
    onProgress?: (percent: number | null) => void
  ): Promise<void> {
    if (!/^combinacao-\d{3}\.mp4$/.test(filename)) {
      throw new Error('Nome de vídeo inválido.');
    }

    type WritableFile = {
      write(data: Uint8Array): Promise<void>;
      close(): Promise<void>;
      abort(): Promise<void>;
    };

    type FileHandle = {
      createWritable(): Promise<WritableFile>;
    };

    const picker = (
      window as Window & {
        showSaveFilePicker?: (options: {
          suggestedName: string;
          types: Array<{
            description: string;
            accept: Record<string, string[]>;
          }>;
        }) => Promise<FileHandle>;
      }
    ).showSaveFilePicker;

    let writable: WritableFile | null = null;

    if (typeof picker === 'function') {
      try {
        const handle = await picker.call(window, {
          suggestedName: filename,
          types: [{
            description: 'Vídeo MP4',
            accept: { 'video/mp4': ['.mp4'] },
          }],
        });

        writable = await handle.createWritable();
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        throw error;
      }
    }

    let completed = false;

    try {
      const response = await authenticatedRequest(
        `/projects/${projectId}/outputs/${filename}`
      );

      const total = Number(response.headers.get('Content-Length')) || 0;

      if (!response.body) {
        throw new Error('O navegador não disponibilizou o streaming do vídeo.');
      }

      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        if (writable) {
          await writable.write(value);
        } else {
          chunks.push(value);
        }

        received += value.byteLength;

        onProgress?.(total ? Math.min(100, Math.round(received * 100 / total)) : null);
      }

      if (total && received !== total) {
        throw new Error('Download incompleto. Tente novamente.');
      }

      if (writable) {
        await writable.close();
      } else {
        const blob = new Blob(chunks as BlobPart[], { type: 'video/mp4' });
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
      }

      completed = true;
      onProgress?.(100);
    } finally {
      if (!completed && writable) {
        try {
          await writable.abort();
        } catch {
          // A gravação já pode ter sido encerrada pelo navegador.
        }
      }
    }
  },

  async preview(projectId: string, filename: string): Promise<string> {
    if (!/^combinacao-\\d{3}\\.mp4$/.test(filename)) {
      throw new Error('Nome de vídeo inválido.');
    }

    const response = await authenticatedRequest(
      `/projects/${projectId}/outputs/${filename}`
    );

    const blob = await response.blob();

    return URL.createObjectURL(blob);
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
