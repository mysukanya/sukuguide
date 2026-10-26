import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://placeholder.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

// Graceful client fallback: createClient if valid URL, or dummy client to prevent runtime exceptions
let client: SupabaseClient;

if (isSupabaseConfigured) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.warn('[SukuGuide] Supabase client initialization error, falling back to local mode:', err);
    client = createClient('https://placeholder-url.supabase.co', 'placeholder-key');
  }
} else {
  // Safe offline client initialization
  client = createClient('https://offline.sukuguide.local', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.fake_key_for_offline_sukuguide');
}

export const supabase = client;

export async function testSupabaseConnection(): Promise<{ success: boolean; latencyMs?: number; error?: string }> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      error: 'Supabase credentials (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are not configured in .env'
    };
  }

  const start = performance.now();
  try {
    const { error } = await supabase.from('subjects').select('count', { count: 'exact', head: true });
    const latencyMs = Math.round(performance.now() - start);
    
    if (error && error.code !== 'PGRST116') {
      return { success: false, latencyMs, error: error.message };
    }
    return { success: true, latencyMs };
  } catch (err: unknown) {
    const latencyMs = Math.round(performance.now() - start);
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, latencyMs, error: message };
  }
}
