import { createClient } from '@supabase/supabase-js';

const env = import.meta.env;
const supabaseUrl =
  env.VITE_SUPABASE_URL ||
  env.NEXT_PUBLIC_SUPABASE_URL ||
  env.VITE_NEXT_PUBLIC_SUPABASE_URL ||
  '';
const supabaseKey =
  env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  env.VITE_SUPABASE_ANON_KEY ||
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
export const supabaseConfigMessage = isSupabaseConfigured
  ? ''
  : 'Supabase env vars missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY).';

const timedFetch = async (input, init = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

const urlForClient = supabaseUrl || 'https://invalid.supabase.local';
const keyForClient = supabaseKey || 'missing-key';

if (!isSupabaseConfigured) {
  console.error(supabaseConfigMessage);
}

export const supabase = createClient(urlForClient, keyForClient, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: timedFetch,
  },
});
