import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;

  if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
    throw new Error(
      'Supabase credentials not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY in .env',
    );
  }

  _client = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY);
  return _client;
}
