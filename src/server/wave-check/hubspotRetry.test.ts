// @vitest-environment node
import { drainHubSpotRetryQueue as drainLegacy, enqueueHubSpotRetry as enqueueLegacy } from './__fixtures__/hubspotRetry.v1';
import { DatabaseSync } from 'node:sqlite';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { drainHubSpotRetryQueue, enqueueHubSpotRetry, type D1Like } from './hubspotRetry';

const context = { submissionId: 'test-receipt', score: 93, topCategory: 'Lead follow-up', recommendedAgent: 'Sales Rider', confidenceLabel: 'High opportunity', opportunities: ['Respond faster'] };
function database() {
  const sqlite = new DatabaseSync(':memory:');
  const db: D1Like = {
    async batch(statements) {
      sqlite.exec('BEGIN');
      try {
        const results = [];
        for (const statement of statements) results.push(await statement.run());
        sqlite.exec('COMMIT');
        return results;
      } catch (error) {
        sqlite.exec('ROLLBACK');
        throw error;
      }
    },
    prepare(query) {
    const statement = sqlite.prepare(query);
    let values: any[] = [];
    const wrapper = {
      bind(...args: unknown[]) { values = args; return wrapper; },
      async run() { return statement.run(...values); },
      async first<T>() { return (statement.get(...values) ?? null) as T | null; },
      async all<T>() { return { results: statement.all(...values) as T[] }; },
    };
    return wrapper;
  } };
  return { db, sqlite };
}
afterEach(() => { vi.unstubAllGlobals(); });
describe('Wave Check CRM retries', () => {
  it('isolates v2 diagnostics from old Pages and Worker consumers during rollout', async () => {
    const { db, sqlite } = database();
    await enqueueLegacy(db, 'legacy@example.com', 'legacy');
    await enqueueHubSpotRetry(db, 'test@example.com', context.submissionId, context);
    sqlite.exec('UPDATE wave_check_hubspot_retry SET next_attempt_at = 0; UPDATE wave_check_hubspot_retry_v2 SET next_attempt_at = 0');
    const oldFetch = vi.fn().mockResolvedValue(Response.json({ results: [{ id: 'legacy-contact' }] }));
    vi.stubGlobal('fetch', oldFetch);
    await drainLegacy(db, 'test-token');
    await drainLegacy(db, 'test-token');
    expect(oldFetch).toHaveBeenCalledTimes(1);
    expect(sqlite.prepare('SELECT count(*) n FROM wave_check_hubspot_retry_v2').get()?.n).toBe(1);
    expect(sqlite.prepare('SELECT context_json FROM wave_check_hubspot_retry_v2_context').get()?.context_json).toBe(JSON.stringify(context));
    const newFetch = vi.fn().mockResolvedValueOnce(Response.json({ results: [{ id: 'new-contact' }] })).mockResolvedValueOnce(Response.json({ id: 'new-note' }));
    vi.stubGlobal('fetch', newFetch);
    await drainHubSpotRetryQueue(db, 'test-token');
    expect(newFetch).toHaveBeenCalledTimes(2);
    expect(sqlite.prepare('SELECT count(*) n FROM wave_check_hubspot_retry_v2').get()?.n).toBe(0);
    sqlite.close();
  });
  it('does not migrate or delete legacy rows when the new consumer runs first', async () => {
    const { db, sqlite } = database();
    await enqueueLegacy(db, 'legacy@example.com', 'legacy');
    sqlite.exec('UPDATE wave_check_hubspot_retry SET next_attempt_at = 0');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await drainHubSpotRetryQueue(db, 'test-token');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(sqlite.prepare('SELECT count(*) n FROM wave_check_hubspot_retry').get()?.n).toBe(1);
    sqlite.close();
  });
  it.each(['null', 'false', '0', '""', '', '[]', '{}', '{broken', JSON.stringify({ ...context, submissionId: 'wrong' }), JSON.stringify({ ...context, opportunities: [42] })])('retains invalid stored context %s without contacting HubSpot', async (invalid) => {
    const { db, sqlite } = database();
    await enqueueHubSpotRetry(db, 'test@example.com', context.submissionId, context);
    sqlite.prepare('UPDATE wave_check_hubspot_retry_v2_context SET context_json = ?').run(invalid);
    sqlite.exec('UPDATE wave_check_hubspot_retry_v2 SET next_attempt_at = 0');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await drainHubSpotRetryQueue(db, 'test-token');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(sqlite.prepare('SELECT attempts FROM wave_check_hubspot_retry_v2').get()?.attempts).toBe(1);
    expect(sqlite.prepare('SELECT context_json FROM wave_check_hubspot_retry_v2_context').get()?.context_json).toBe(invalid);
    sqlite.close();
  });
  it('rolls back context insertion when queue insertion fails', async () => {
    const { db, sqlite } = database();
    await enqueueHubSpotRetry(db, 'test@example.com', 'legacy');
    sqlite.exec("CREATE TRIGGER fail_enqueue BEFORE INSERT ON wave_check_hubspot_retry_v2 WHEN NEW.submission_id = 'test-receipt' BEGIN SELECT RAISE(ABORT, 'injected failure'); END");
    await expect(enqueueHubSpotRetry(db, 'test@example.com', context.submissionId, context)).rejects.toThrow('injected failure');
    expect(sqlite.prepare('SELECT count(*) n FROM wave_check_hubspot_retry_v2_context').get()?.n).toBe(0);
    expect(sqlite.prepare('SELECT count(*) n FROM wave_check_hubspot_retry_v2 WHERE submission_id = ?').get(context.submissionId)?.n).toBe(0);
    sqlite.close();
  });
  it('rolls back queue deletion when context deletion fails after successful sync', async () => {
    const { db, sqlite } = database();
    await enqueueHubSpotRetry(db, 'test@example.com', context.submissionId, context);
    sqlite.exec("UPDATE wave_check_hubspot_retry_v2 SET next_attempt_at = 0; CREATE TRIGGER fail_cleanup BEFORE DELETE ON wave_check_hubspot_retry_v2_context BEGIN SELECT RAISE(ABORT, 'injected failure'); END");
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(Response.json({ results: [{ id: 'contact-1' }] })).mockResolvedValueOnce(Response.json({ id: 'note-1' })));
    await expect(drainHubSpotRetryQueue(db, 'test-token')).rejects.toThrow('injected failure');
    expect(sqlite.prepare('SELECT count(*) n FROM wave_check_hubspot_retry_v2').get()?.n).toBe(1);
    expect(sqlite.prepare('SELECT context_json FROM wave_check_hubspot_retry_v2_context').get()?.context_json).toBe(JSON.stringify(context));
    sqlite.close();
  });
  it('supports a legacy queue row without stored diagnostic context', async () => {
    const { db, sqlite } = database();
    sqlite.exec('CREATE TABLE wave_check_hubspot_retry_v2 (submission_id TEXT PRIMARY KEY, email TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, next_attempt_at INTEGER NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)');
    await enqueueHubSpotRetry(db, 'test@example.com', 'legacy');
    sqlite.exec('UPDATE wave_check_hubspot_retry_v2 SET next_attempt_at = 0');
    const fetchMock = vi.fn().mockResolvedValueOnce(Response.json({ results: [{ id: 'contact-1' }] }));
    vi.stubGlobal('fetch', fetchMock);
    await drainHubSpotRetryQueue(db, 'test-token');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(sqlite.prepare('SELECT count(*) n FROM wave_check_hubspot_retry_v2').get()?.n).toBe(0);
    sqlite.close();
  });
  it('does not erase stored context when the same receipt is requeued without it', async () => {
    const { db, sqlite } = database();
    await enqueueHubSpotRetry(db, 'test@example.com', context.submissionId, context);
    await enqueueHubSpotRetry(db, 'test@example.com', context.submissionId);
    expect(sqlite.prepare('SELECT context_json FROM wave_check_hubspot_retry_v2_context').get()?.context_json).toBe(JSON.stringify(context));
    sqlite.close();
  });
  it('retains the diagnostic note through queue storage and retry', async () => {
    const { db, sqlite } = database();
    await enqueueHubSpotRetry(db, 'test@example.com', context.submissionId, context);
    sqlite.exec('UPDATE wave_check_hubspot_retry_v2 SET next_attempt_at = 0');
    const fetchMock = vi.fn().mockResolvedValueOnce(Response.json({ results: [{ id: 'contact-1' }] })).mockResolvedValueOnce(Response.json({ id: 'note-1' }));
    vi.stubGlobal('fetch', fetchMock);
    await drainHubSpotRetryQueue(db, 'test-token');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toBe('https://api.hubapi.com/crm/v3/objects/notes');
    expect(JSON.parse(init.body).properties.hs_note_body).toContain('Score: 93/100');
    expect(JSON.parse(init.body).properties.hs_note_body).toContain('Respond faster');
    expect(sqlite.prepare('SELECT count(*) n FROM wave_check_hubspot_retry_v2').get()?.n).toBe(0);
    sqlite.close();
  });
  it('keeps the queued diagnostic when note creation fails', async () => {
    const { db, sqlite } = database();
    await enqueueHubSpotRetry(db, 'test@example.com', context.submissionId, context);
    sqlite.exec('UPDATE wave_check_hubspot_retry_v2 SET next_attempt_at = 0');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(Response.json({ results: [{ id: 'contact-1' }] })).mockResolvedValueOnce(new Response('unavailable', {status: 503})));
    await drainHubSpotRetryQueue(db, 'test-token');
    expect(sqlite.prepare('SELECT attempts FROM wave_check_hubspot_retry_v2').get()?.attempts).toBe(1);
    expect(sqlite.prepare('SELECT context_json FROM wave_check_hubspot_retry_v2_context').get()?.context_json).toBe(JSON.stringify(context));
    sqlite.exec('UPDATE wave_check_hubspot_retry_v2 SET next_attempt_at = 0');
    const retryFetch = vi.fn().mockResolvedValueOnce(Response.json({ results: [{ id: 'contact-1' }] })).mockResolvedValueOnce(Response.json({ id: 'note-1' }));
    vi.stubGlobal('fetch', retryFetch);
    await drainHubSpotRetryQueue(db, 'test-token');
    expect(JSON.parse(retryFetch.mock.calls[1][1].body).properties.hs_note_body).toContain('Respond faster');
    expect(sqlite.prepare('SELECT count(*) n FROM wave_check_hubspot_retry_v2_context').get()?.n).toBe(0);
    sqlite.close();
  });
});
