import { describe, expect, it, vi } from 'vitest';
import { loadKnowledge } from './_knowledge';

function makeClient(rows: any[] = []) {
  const calls: Array<[string, ...unknown[]]> = [];
  const response = Promise.resolve({ data: rows, error: null });

  const builder: any = {
    select: vi.fn((...args: unknown[]) => {
      calls.push(['select', ...args]);
      return builder;
    }),
    order: vi.fn((...args: unknown[]) => {
      calls.push(['order', ...args]);
      return builder;
    }),
    limit: vi.fn((...args: unknown[]) => {
      calls.push(['limit', ...args]);
      return builder;
    }),
    eq: vi.fn((...args: unknown[]) => {
      calls.push(['eq', ...args]);
      return builder;
    }),
    in: vi.fn((...args: unknown[]) => {
      calls.push(['in', ...args]);
      return builder;
    }),
    then: response.then.bind(response),
  };

  return {
    client: { from: vi.fn(() => builder) } as any,
    calls,
  };
}

describe('loadKnowledge', () => {
  it('filters public mode to active public knowledge in the database query', async () => {
    const { client, calls } = makeClient();
    await loadKnowledge(client, 'public');
    expect(calls).toContainEqual(['eq', 'visibility', 'public']);
    expect(calls).toContainEqual(['eq', 'status', 'active']);
    expect(calls.some(([name, field, values]) => name === 'in' && field === 'visibility' && Array.isArray(values) && values.includes('owner'))).toBe(false);
  });

  it('allows owner mode to include public and owner active knowledge', async () => {
    const { client, calls } = makeClient();
    await loadKnowledge(client, 'owner');
    expect(calls).toContainEqual(['in', 'visibility', ['public', 'owner']]);
    expect(calls).toContainEqual(['eq', 'status', 'active']);
  });

  it('includes drafts only for owner preview mode', async () => {
    const ownerPreview = makeClient();
    await loadKnowledge(ownerPreview.client, 'owner', { preview: true });
    expect(ownerPreview.calls).toContainEqual(['in', 'status', ['draft', 'active']]);

    const publicPreview = makeClient();
    await loadKnowledge(publicPreview.client, 'public', { preview: true });
    expect(publicPreview.calls).toContainEqual(['eq', 'status', 'active']);
    expect(publicPreview.calls).not.toContainEqual(['in', 'status', ['draft', 'active']]);
  });

  it('returns version and review metadata', async () => {
    const { client } = makeClient([
      {
        id: 'k1',
        knowledge_key: 'product.wave-scout',
        category: 'product',
        title: 'Wave Scout',
        visibility: 'public',
        status: 'active',
        body: { setupPriceCents: 199700 },
        version_no: 3,
        effective_date: '2026-08-28',
        last_reviewed_date: '2026-08-28',
        approval_source: 'Shannon',
      },
    ]);

    await expect(loadKnowledge(client, 'public')).resolves.toEqual([
      expect.objectContaining({
        knowledgeKey: 'product.wave-scout',
        versionNo: 3,
        lastReviewedDate: '2026-08-28',
      }),
    ]);
  });
});
