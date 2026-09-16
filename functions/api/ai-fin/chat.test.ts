import { describe, expect, it } from 'vitest';
import { handleAiFinChat } from './chat';

describe('AI Fin runtime bindings', () => {
  it('reports only the names of missing required bindings', async () => {
    const request = new Request('https://otdaisurfer.surf/api/ai-fin/chat', {
      method: 'POST',
      headers: { origin: 'https://otdaisurfer.surf', 'content-type': 'application/json' },
      body: JSON.stringify({ mode: 'public', message: 'hello' }),
    });
    const env = { OPENAI_API_KEY: 'set', SUPABASE_URL: 'https://example.supabase.co' } as any;

    const response = await handleAiFinChat(request, env);
    const body = await response.json() as any;

    expect(response.status).toBe(503);
    expect(body.error).toBe('AI Fin is temporarily unavailable');
    expect(body.missingBindings).toEqual(['SUPABASE_SERVICE_ROLE_KEY']);
    expect(JSON.stringify(body)).not.toContain('example.supabase.co');
  });
});
