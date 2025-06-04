// src/lib/supabaseClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
// Если есть тип для вашей БД, импортируйте его, например:
import type { Database } from '../types/database.types';

export const supabase: SupabaseClient<Database> = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
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
