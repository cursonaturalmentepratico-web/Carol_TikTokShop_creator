import { RenderApi, RenderJob } from './renderApi';

export async function waitForRenderCompletion(
  projectId: string,
  onStatus: (job: RenderJob) => void,
  signal?: AbortSignal
): Promise<RenderJob> {
  const intervalMs = 3000;

  while (!signal?.aborted) {
    const job = await RenderApi.status(projectId);

    onStatus(job);

    if (job.status === 'completed') {
      return job;
    }

    if (['failed', 'expired', 'deleting'].includes(job.status)) {
      throw new Error(
        job.status === 'failed'
          ? 'O processamento falhou na VPS.'
          : 'Os arquivos deste projeto não estão mais disponíveis.'
      );
    }

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        signal?.removeEventListener('abort', onAbort);
        resolve();
      }, intervalMs);

      const onAbort = () => {
        clearTimeout(timer);
        reject(new DOMException('Operação cancelada.', 'AbortError'));
      };

      if (signal) {
        if (signal.aborted) {
          onAbort();
        } else {
          signal.addEventListener('abort', onAbort, { once: true });
        }
      }
    });
  }

  throw new DOMException('Operação cancelada.', 'AbortError');
}
