import { Project, VideoClip } from '../types';

const STORAGE_KEY = 'carol_rosa_projects_v1';

// In-memory registry for File objects during active session
const activeFileCache = new Map<string, File>();

export function registerActiveFile(clipId: string, file: File): void {
  activeFileCache.set(clipId, file);
}

export function getActiveFile(clipId: string): File | undefined {
  return activeFileCache.get(clipId);
}

/**
 * Strips non-serializable File objects before saving to localStorage
 */
function sanitizeProjectForStorage(project: Project): Project {
  const sanitizeClip = (clip: VideoClip): VideoClip => {
    // If the file is in memory, keep reference in cache
    if (clip.file) {
      registerActiveFile(clip.id, clip.file);
    }
    // Return clip metadata without the non-serializable File property
    const { file: _, ...rest } = clip;
    return rest;
  };

  return {
    ...project,
    hooks: project.hooks.map(sanitizeClip),
    developments: project.developments.map(sanitizeClip),
    ctas: project.ctas.map(sanitizeClip),
  };
}

export const ProjectStorage = {
  /**
   * Retrieves all saved projects. Returns an empty array if none exist (no fake data).
   */
  getProjects(): Project[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed: Project[] = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch (err) {
      console.error('Failed to parse saved projects:', err);
      return [];
    }
  },

  /**
   * Retrieves a single project by ID
   */
  getProjectById(id: string): Project | null {
    const projects = this.getProjects();
    return projects.find((p) => p.id === id) || null;
  },

  /**
   * Saves or updates a project
   */
  saveProject(project: Project): void {
    try {
      const sanitized = sanitizeProjectForStorage(project);
      const existing = this.getProjects();
      const index = existing.findIndex((p) => p.id === sanitized.id);

      let updated: Project[];
      if (index >= 0) {
        updated = [...existing];
        updated[index] = sanitized;
      } else {
        updated = [sanitized, ...existing];
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to persist project:', err);
    }
  },

  /**
   * Deletes a project
   */
  deleteProject(id: string): void {
    try {
      const existing = this.getProjects();
      const filtered = existing.filter((p) => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  },

  /**
   * Clears all stored projects
   */
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
