import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const appSource = readFileSync(resolve(here, 'App.tsx'), 'utf8');

describe('homepage conversion copy', () => {
  it('leads with a clear business outcome and keeps the Wave Check primary', () => {
    expect(appSource).toContain('Ride the AI wave.');
    expect(appSource).toContain('Get My Free AI Wave Check™');
    expect(appSource).toContain('automate repetitive work');
  });

  it('describes membership tiers in business-outcome language', () => {
    expect(appSource).toContain('Ready-to-use AI tools for everyday business tasks');
    expect(appSource).toContain('Custom automations built around your workflow');
    expect(appSource).toContain('A tailored AI system for your business');
  });
});
