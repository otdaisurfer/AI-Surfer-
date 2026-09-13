import { describe, expect, it } from 'vitest';
import { validateLeadDraft } from './_lead';

describe('AI Fin lead validation', () => {
  it('normalizes a consented lead', () => {
    const lead = validateLeadDraft({
      name: '  Jane Wave  ',
      email: 'JANE@EXAMPLE.COM',
      company: 'Wave Works',
      website: 'https://example.com',
      problem: 'Needs faster lead follow-up',
      budgetRange: '$1k-$3k',
      preferredContactMethod: 'email',
      consent: true,
      consentAt: '2026-08-29T21:00:00.000Z',
    });

    expect(lead.name).toBe('Jane Wave');
    expect(lead.email).toBe('jane@example.com');
    expect(lead.consent).toBe(true);
  });

  it('rejects markup injection in stored text fields', () => {
    expect(() =>
      validateLeadDraft({
        name: '<script>alert(1)</script>',
        email: 'jane@example.com',
        problem: 'Need help',
        consent: true,
        consentAt: '2026-08-29T21:00:00.000Z',
      }),
    ).toThrow(/Invalid name/);
  });

  it('rejects malformed email addresses', () => {
    expect(() =>
      validateLeadDraft({
        name: 'Jane',
        email: 'not-an-email',
        problem: 'Need help',
        consent: true,
        consentAt: '2026-08-29T21:00:00.000Z',
      }),
    ).toThrow();
  });
});
