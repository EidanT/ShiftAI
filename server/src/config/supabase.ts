import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

let _client: SupabaseClient | null = null;
let _authClient: SupabaseClient | null = null;

/** Admin client (service role key). Bypasses RLS — use for server-side data access. */
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

/** Publishable-key client. Use for user auth flows (signIn/signOut), never for privileged data access. */
export function getSupabaseAuth(): SupabaseClient {
  if (_authClient) return _authClient;

  if (!env.SUPABASE_URL || !env.SUPABASE_PUBLISHABLE_KEY) {
    throw new Error(
      'Supabase credentials not configured. Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in .env',
    );
  }

  _authClient = createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _authClient;
}
