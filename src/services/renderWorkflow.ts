import { Project, VideoClip } from '../types';
import { RenderApi } from './renderApi';

type UploadCategory = 'gancho' | 'desenvolvimento' | 'cta';

interface UploadGroup {
  category: UploadCategory;
  clips: VideoClip[];
}

export interface WorkflowProgress {
  phase: 'uploading' | 'queued';
  completed: number;
  total: number;
  message: string;
}

export async function submitProjectForRendering(
  project: Project,
  onProgress?: (progress: WorkflowProgress) => void
): Promise<void> {
  const groups: UploadGroup[] = [
    { category: 'gancho', clips: project.hooks },
    { category: 'desenvolvimento', clips: project.developments },
    { category: 'cta', clips: project.ctas },
  ];

  for (const group of groups) {
    if (group.clips.length < 1 || group.clips.length > 3) {
      throw new Error(
        `A categoria ${group.category} precisa conter entre 1 e 3 vídeos.`
      );
    }
  }

  const total = groups.reduce(
    (sum, group) => sum + group.clips.length,
    0
  );

  let completed = 0;

  for (const group of groups) {
    for (let index = 0; index < group.clips.length; index++) {
      const clip = group.clips[index];

      if (!clip.file) {
        throw new Error(
          `O arquivo ${clip.name} não está disponível. Selecione-o novamente.`
        );
      }

      onProgress?.({
        phase: 'uploading',
        completed,
        total,
        message: `Enviando ${clip.name} (${completed + 1}/${total})`,
      });

      await RenderApi.upload(
        project.id,
        group.category,
        index + 1,
        clip.file
      );

      completed++;
    }
  }

  onProgress?.({
    phase: 'queued',
    completed,
    total,
    message: 'Uploads concluídos. Solicitando renderização...',
  });

  const result = await RenderApi.start(project.id);

  if (!result.queued) {
    throw new Error('A VPS não aceitou o processamento.');
  }
}
