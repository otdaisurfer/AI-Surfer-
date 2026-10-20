// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { handleShopifyAccess } from './shopify-access';
const env = { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'key', SHOPIFY_WEBHOOK_SECRET: 'secret' };
function admin(verified = true) {
  return { auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'verified-user', email: 'BUYER@example.com', email_confirmed_at: verified ? '2026-10-20' : null } }, error: null }) }, rpc: vi.fn().mockResolvedValue({ data: [], error: null }) };
}
const req = (body?: unknown) => new Request('https://example.com/api/shopify-access', { method: body ? 'POST' : 'GET', headers: { Authorization: 'Bearer valid-token' }, ...(body ? { body: JSON.stringify(body) } : {}) });
describe('Shopify member access', () => {
  it('uses the verified account identity, never an email supplied by the browser', async () => {
    const db = admin();
    const response = await handleShopifyAccess(req({ productSlug: 'content-creator', email: 'victim@example.com' }), env, db);
    expect(response.status).toBe(200);
    expect(db.rpc).toHaveBeenCalledWith('resolve_shopify_member_access', { p_user_id: 'verified-user', p_email: 'buyer@example.com', p_activate_slug: 'content-creator' });
    expect(response.headers.get('cache-control')).toBe('no-store');
  });
  it('requires authentication before reading purchases', async () => {
    const db = admin();
    expect((await handleShopifyAccess(new Request('https://example.com/api/shopify-access'), env, db)).status).toBe(401);
    expect(db.rpc).not.toHaveBeenCalled();
  });
  it('requires confirmed email ownership to claim a purchase', async () => {
    const db = admin(false);
    expect((await handleShopifyAccess(req({ productSlug: 'content-creator' }), env, db)).status).toBe(403);
    expect(db.rpc).not.toHaveBeenCalled();
  });
  it('rejects arbitrary tool or tier requests', async () => {
    const db = admin();
    expect((await handleShopifyAccess(req({ productSlug: 'enterprise' }), env, db)).status).toBe(400);
    expect(db.rpc).not.toHaveBeenCalled();
  });
  it('returns an error, not an unlock, when storage fails', async () => {
    const db = admin(); db.rpc.mockResolvedValue({ data: null, error: { message: 'private error' } });
    const response = await handleShopifyAccess(req(), env, db);
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain('private error');
  });
});
