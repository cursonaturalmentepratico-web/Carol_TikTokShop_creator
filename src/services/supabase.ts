import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials from environment variables as requested
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl.trim() !== '' &&
  supabaseKey &&
  supabaseKey.trim() !== '' &&
  !supabaseUrl.includes('your-project.supabase.co')
);

// Create the Supabase client instance using public/anon credentials only
// (never service_role or admin secret keys)
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
    },
  }
);
