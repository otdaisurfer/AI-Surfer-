import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const wrangler = readFileSync('wrangler.toml', 'utf8');

describe('production Wrangler bindings', () => {
  it('declares the AI Fin Supabase URL for production', () => {
    expect(wrangler).toContain('[env.production.vars]');
    expect(wrangler).toContain('SUPABASE_URL = "https://mkgnyarwiscttobnytin.supabase.co"');
  });

  it('requires AI Fin secrets without committing their values', () => {
    expect(wrangler).toContain('[env.production.secrets]');
    expect(wrangler).toContain('required = [ "OPENAI_API_KEY", "SUPABASE_SERVICE_ROLE_KEY" ]');
    expect(wrangler).not.toMatch(/OPENAI_API_KEY\s*=\s*".+"/);
    expect(wrangler).not.toMatch(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*".+"/);
  });
});
