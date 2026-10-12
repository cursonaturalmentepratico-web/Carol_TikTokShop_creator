export type CategoryType = 'hooks' | 'developments' | 'ctas';

export interface VideoClip {
  id: string;
  category: CategoryType;
  file?: File;
  name: string;
  size: number;
  sizeFormatted: string;
  duration: number; // in seconds
  durationFormatted: string;
  previewUrl: string;
  thumbnailUrl: string | null;
  uploadedAt: string;
}

export type ProjectStatus = 'draft' | 'pending_backend' | 'processing' | 'ready' | 'expired';

export interface GeneratedCombination {
  id: string;
  combinationNumber: number;
  hookName: string;
  hookClipId: string;
  developmentName: string;
  developmentClipId: string;
  ctaName: string;
  ctaClipId: string;
  estimatedDuration: number;
  estimatedDurationFormatted: string;
  videoUrl?: string;
  fileSizeFormatted?: string;
  resolution: string;
  status: 'ready' | 'rendering' | 'error';
}

export interface SupabaseProjectRow {
  id: string;
  user_id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  userId?: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  hooks: VideoClip[];
  developments: VideoClip[];
  ctas: VideoClip[];
  totalCombinations: number;
  status: ProjectStatus;
  expiresAt?: string; // ISO date string provided by server (2 hours retention)
  results?: GeneratedCombination[];
  notes?: string;
}

export interface BackendPayload {
  projectId: string;
  projectTitle: string;
  totalCombinations: number;
  clips: {
    hooks: Array<{ id: string; name: string; duration: number }>;
    developments: Array<{ id: string; name: string; duration: number }>;
    ctas: Array<{ id: string; name: string; duration: number }>;
  };
  combinationsMatrix: Array<{
    combinationId: string;
    sequence: [string, string, string]; // [hookId, developmentId, ctaId]
  }>;
}
