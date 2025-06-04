// src/lib/supabaseClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase: отсутствует VITE_SUPABASE_URL или VITE_SUPABASE_ANON_KEY');
  throw new Error('Supabase URL или ANON_KEY не заданы в окружении');
}

export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          cache: 'default',
        }),
    },
  }
);
