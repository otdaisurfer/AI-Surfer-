import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const wrangler = readFileSync('wrangler.toml', 'utf8');

describe('production Wrangler bindings', () => {
  it('declares the AI Fin Supabase URL for production', () => {
    expect(wrangler).toContain('[env.production.vars]');
    expect(wrangler).toContain('SUPABASE_URL = "https://mkgnyarwiscttobnytin.supabase.co"');
  });

  it('requires launch-critical server secrets without committing their values', () => {
    expect(wrangler).toContain('[env.production.secrets]');
    for (const secret of [
      'OPENAI_API_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'STRIPE_SECRET_KEY',
      'HUBSPOT_ACCESS_TOKEN',
      'SITE_HEALTH_API_KEY',
    ]) {
      expect(wrangler).toContain(`"${secret}"`);
      expect(wrangler).not.toMatch(new RegExp(`${secret}\\s*=\\s*".+"`));
    }
  });

  it('does not ship the retired Supabase deployment override', () => {
    expect(wrangler).not.toContain('dbpoyuwgmfmrefxwzfnh');
  });
});
