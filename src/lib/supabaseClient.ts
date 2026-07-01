import { createClient } from '@supabase/supabase-js';

// Retrieve keys from Vite client-side environment variables
const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

// Verify if both variables are properly set
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Gracefully initialize Supabase client to avoid crashing on missing environment keys
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Returns the Supabase client instance.
 * Throws a helpful, clear error if accessed without environment variables configured.
 */
export function getSupabaseClient() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'Supabase client is not initialized. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables are defined in your project secrets.'
    );
  }
  return supabase;
}
