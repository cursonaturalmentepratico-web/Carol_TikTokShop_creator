import { GeneratedCombination, VideoClip } from '../types';

/**
 * Formats seconds into mm:ss format
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formats bytes into human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Extracts metadata (duration, thumbnail) from an uploaded video file in the browser
 */
export async function extractVideoMetadata(
  file: File
): Promise<{ duration: number; thumbnailUrl: string | null }> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.playsInline = true;
    video.muted = true;
    const url = URL.createObjectURL(file);
    video.src = url;

    let resolved = false;

    const cleanup = () => {
      URL.revokeObjectURL(url);
    };

    video.onloadedmetadata = () => {
      const duration = video.duration || 0;
      // Seek slightly into the video to capture an interesting frame
      const seekTime = Math.min(Math.max(0.3, duration * 0.15), 2.0);
      video.currentTime = seekTime;
    };

    video.onseeked = () => {
      if (resolved) return;
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 360;
        canvas.height = video.videoHeight || 640;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.82);
          resolved = true;
          cleanup();
          resolve({ duration: video.duration || 0, thumbnailUrl });
          return;
        }
      } catch (err) {
        console.warn('Canvas thumbnail extraction fallback:', err);
      }
      resolved = true;
      cleanup();
      resolve({ duration: video.duration || 0, thumbnailUrl: null });
    };

    video.onerror = () => {
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve({ duration: 0, thumbnailUrl: null });
    };

    // Timeout safety for weird codec formats
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        cleanup();
        resolve({ duration: video.duration || 0, thumbnailUrl: null });
      }
    }, 4000);
  });
}

/**
 * Builds all combination permutations from hooks, developments, and CTAs
 */
export function buildCombinationsMatrix(
  hooks: VideoClip[],
  developments: VideoClip[],
  ctas: VideoClip[]
): GeneratedCombination[] {
  const results: GeneratedCombination[] = [];
  let count = 1;

  for (const hook of hooks) {
    for (const dev of developments) {
      for (const cta of ctas) {
        const estDuration = (hook.duration || 0) + (dev.duration || 0) + (cta.duration || 0);
        results.push({
          id: `combo-${count}-${Date.now().toString(36)}`,
          combinationNumber: count,
          hookName: hook.name,
          hookClipId: hook.id,
          developmentName: dev.name,
          developmentClipId: dev.id,
          ctaName: cta.name,
          ctaClipId: cta.id,
          estimatedDuration: estDuration,
          estimatedDurationFormatted: formatDuration(estDuration),
          resolution: '1080x1920 (9:16 TikTok)',
          status: 'ready',
        });
        count++;
      }
    }
  }

  return results;
}

/**
 * Calculates remaining time until expiration
 */
export function calculateTimeRemaining(expiresAt: string): {
  totalSeconds: number;
  formatted: string;
  isExpired: boolean;
} {
  const target = new Date(expiresAt).getTime();
  const now = Date.now();
  const diffMs = target - now;

  if (diffMs <= 0 || isNaN(target)) {
    return { totalSeconds: 0, formatted: '00:00:00', isExpired: true };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formatted = `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return { totalSeconds, formatted, isExpired: false };
}
