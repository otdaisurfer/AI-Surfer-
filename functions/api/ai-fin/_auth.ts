import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AccessMode } from '../../../src/features/ai-fin/contracts';

export interface AiFinEnv {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

export interface AccessResolution {
  mode: AccessMode;
  userId?: string;
}

export class AiFinAuthError extends Error {
  status = 401;

  constructor(message = 'Authentication failed') {
    super(message);
    this.name = 'AiFinAuthError';
  }
}

export function createServerSupabase(env: AiFinEnv): SupabaseClient {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('AI Fin server authentication is not configured');
  }

  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function getBearerToken(request: Request): string | null {
  const header = request.headers.get('authorization');
  if (!header) return null;

  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export async function resolveAccessMode(
  request: Request,
  env: AiFinEnv,
  supabase: SupabaseClient = createServerSupabase(env),
): Promise<AccessResolution> {
  const token = getBearerToken(request);
  if (!token) return { mode: 'public' };

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    throw new AiFinAuthError();
  }

  const userId = userData.user.id;
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) {
    throw new AiFinAuthError();
  }

  return {
    mode: profile?.role === 'owner' ? 'owner' : 'public',
    userId,
  };
}
