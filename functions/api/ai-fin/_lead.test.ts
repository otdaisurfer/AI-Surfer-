import { afterEach, describe, expect, it, vi } from 'vitest';
import { saveLead, validateLeadDraft } from './_lead';

afterEach(() => {
  vi.unstubAllGlobals();
});

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

  it('syncs a newly saved AI Fin lead to HubSpot', async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: 'lead-123' }, error: null });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    const supabase = { from: vi.fn().mockReturnValue({ insert }) } as any;
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ results: [] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'hubspot-456' }), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await saveLead(
      supabase,
      {
        name: 'Jane Wave',
        email: 'JANE@EXAMPLE.COM',
        problem: 'Needs faster lead follow-up',
        consent: true,
        consentAt: '2026-08-29T21:00:00.000Z',
      },
      'hubspot-token',
    );

    expect(result).toEqual({ id: 'lead-123', hubspotStatus: 'synced' });
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://api.hubapi.com/crm/v3/objects/contacts/search',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://api.hubapi.com/crm/v3/objects/contacts',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
