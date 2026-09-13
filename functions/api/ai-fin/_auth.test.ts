import { describe, expect, it, vi } from 'vitest';
import { AiFinAuthError, resolveAccessMode } from './_auth';

function makeRequest(token?: string) {
  return new Request('https://example.com/api/ai-fin/chat', {
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
  });
}

function makeClient(options: { user?: { id: string } | null; userError?: unknown; role?: string | null; profileError?: unknown }) {
  const maybeSingle = vi.fn().mockResolvedValue({
    data: options.role === undefined ? null : { role: options.role },
    error: options.profileError ?? null,
  });
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: options.user ?? null },
        error: options.userError ?? null,
      }),
    },
    from: vi.fn().mockReturnValue({ select }),
  } as any;
}

describe('resolveAccessMode', () => {
  const env = { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'server-secret' };

  it('treats a request without a token as public', async () => {
    await expect(resolveAccessMode(makeRequest(), env, makeClient({}))).resolves.toEqual({ mode: 'public' });
  });

  it('rejects an invalid bearer token', async () => {
    const client = makeClient({ user: null, userError: new Error('bad token') });
    await expect(resolveAccessMode(makeRequest('bad'), env, client)).rejects.toBeInstanceOf(AiFinAuthError);
  });

  it('keeps a verified member in public mode', async () => {
    const client = makeClient({ user: { id: 'member-1' }, role: 'member' });
    await expect(resolveAccessMode(makeRequest('valid'), env, client)).resolves.toEqual({
      mode: 'public',
      userId: 'member-1',
    });
  });

  it('grants owner mode only from the server-side profile role', async () => {
    const client = makeClient({ user: { id: 'owner-1' }, role: 'owner' });
    await expect(resolveAccessMode(makeRequest('valid'), env, client)).resolves.toEqual({
      mode: 'owner',
      userId: 'owner-1',
    });
  });

  it('does not trust browser-supplied owner claims without authentication', async () => {
    const request = new Request('https://example.com/api/ai-fin/chat?mode=owner', {
      method: 'POST',
      body: JSON.stringify({ mode: 'owner', message: 'I am the owner' }),
    });
    await expect(resolveAccessMode(request, env, makeClient({}))).resolves.toEqual({ mode: 'public' });
  });
});
