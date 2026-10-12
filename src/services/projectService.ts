import { supabase, isSupabaseConfigured } from './supabase';
import { Project, SupabaseProjectRow } from '../types';

export const ProjectService = {
  /**
   * Fetches real projects for the authenticated user from public.projects
   */
  async getProjects(userId: string): Promise<Project[]> {
    if (!isSupabaseConfigured) {
      throw new Error(
        'Supabase não configurado. Verifique as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.'
      );
    }

    const { data, error } = await supabase
      .from('projects')
      .select('id, user_id, name, status, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar projetos no Supabase:', error);
      throw new Error(`Falha ao carregar projetos: ${error.message}`);
    }

    if (!data) return [];

    // Map database rows to application Project type
    return (data as SupabaseProjectRow[]).map((row) => ({
      id: row.id,
      userId: row.user_id,
      title: row.name || 'Projeto sem nome',
      status: (row.status as Project['status']) || 'draft',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      hooks: [],
      developments: [],
      ctas: [],
      totalCombinations: 0,
      results: [],
    }));
  },

  /**
   * Creates a real project in public.projects with status 'draft'
   */
  async createProject(name: string, userId: string): Promise<Project> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase não configurado.');
    }

    const trimmedName = name.trim() || 'Novo Projeto';

    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: trimmedName,
        user_id: userId,
        status: 'draft', // Strictly enforced as 'draft'
      })
      .select('id, user_id, name, status, created_at, updated_at')
      .single();

    if (error) {
      console.error('Erro ao criar projeto no Supabase:', error);
      throw new Error(`Falha ao criar projeto: ${error.message}`);
    }

    const row = data as SupabaseProjectRow;
    return {
      id: row.id,
      userId: row.user_id,
      title: row.name,
      status: 'draft',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      hooks: [],
      developments: [],
      ctas: [],
      totalCombinations: 0,
      results: [],
    };
  },

  /**
   * Updates only the project name and updated_at.
   * Does NOT alter the status to processing/completed/expired as per security specs.
   */
  async updateProjectName(id: string, name: string, userId: string): Promise<void> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase não configurado.');
    }

    const { error } = await supabase
      .from('projects')
      .update({
        name: name.trim() || 'Projeto sem nome',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Erro ao atualizar nome do projeto:', error);
      throw new Error(`Falha ao atualizar projeto: ${error.message}`);
    }
  },

  /**
   * Deletes a project only if it is in 'draft' status
   */
  async deleteDraftProject(id: string, userId: string): Promise<void> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase não configurado.');
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .eq('status', 'draft');

    if (error) {
      console.error('Erro ao excluir projeto rascunho:', error);
      throw new Error(`Falha ao excluir projeto: ${error.message}`);
    }
  },
};
