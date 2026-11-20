// @vitest-environment node
import { webcrypto } from 'node:crypto';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { handleShopifyWebhook } from './shopify-webhook';

beforeAll(() => vi.stubGlobal('crypto', webcrypto));
const env = { SHOPIFY_WEBHOOK_SECRET: 'test-secret', SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'test-key' };
const paidOrder = { id: 123, email: 'Buyer@Example.com', financial_status: 'paid', currency: 'USD', total_price: '797.00', test: false, line_items: [{ id: 456, product_id: 8045510688827, quantity: 1, price: '797.00', total_discount: '0.00' }] };
async function request(payload: unknown = paidOrder, topic = 'orders/paid', changes: Record<string, string> = {}) {
  const body = JSON.stringify(payload);
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.SHOPIFY_WEBHOOK_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = Buffer.from(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))).toString('base64');
  return new Request('https://example.com/api/shopify-webhook', { method: 'POST', body, headers: { 'X-Shopify-Hmac-Sha256': signature, 'X-Shopify-Shop-Domain': 'nrctqw-pi.myshopify.com', 'X-Shopify-Topic': topic, ...changes } });
}
describe('Shopify paid-order receipt', () => {
  it('records only the exact purchased workspace and normalizes the buyer email', async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    expect((await handleShopifyWebhook(await request(), env, { rpc })).status).toBe(200);
    expect(rpc).toHaveBeenCalledWith('record_shopify_access_order', { p_shop: 'nrctqw-pi.myshopify.com', p_order_id: '123', p_email: 'buyer@example.com', p_revoke: false, p_items: [{ line_item_id: '456', product_slug: 'content-creator' }] });
  });
  it.each([{ 'X-Shopify-Hmac-Sha256': 'wrong' }, { 'X-Shopify-Shop-Domain': 'other.myshopify.com' }])('rejects invalid origin or signature before touching storage', async (changes) => {
    const rpc = vi.fn();
    expect((await handleShopifyWebhook(await request(paidOrder, 'orders/paid', changes), env, { rpc })).status).toBe(401);
    expect(rpc).not.toHaveBeenCalled();
  });
  it.each([
    { ...paidOrder, test: true }, { ...paidOrder, financial_status: 'pending' },
    { ...paidOrder, total_price: '0.00' }, { ...paidOrder, currency: 'EUR' },
    { ...paidOrder, line_items: [{ ...paidOrder.line_items[0], product_id: 8045518094395 }] },
    { ...paidOrder, line_items: [{ ...paidOrder.line_items[0], total_discount: '797.00' }] },
  ])('does not grant for test, unpaid, free, or unmapped purchases', async (payload) => {
    const rpc = vi.fn();
    expect((await handleShopifyWebhook(await request(payload), env, { rpc })).status).toBe(200);
    expect(rpc).not.toHaveBeenCalled();
  });
  it('records revocation even when a refund arrives before the paid notification', async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    expect((await handleShopifyWebhook(await request({ id: 999, order_id: 123 }, 'refunds/create'), env, { rpc })).status).toBe(200);
    expect(rpc).toHaveBeenCalledWith('record_shopify_access_order', expect.objectContaining({ p_order_id: '123', p_revoke: true, p_items: [] }));
  });
  it('asks Shopify to retry a failed durable write', async () => {
    const rpc = vi.fn().mockResolvedValue({ error: { message: 'database down' } });
    const response = await handleShopifyWebhook(await request(), env, { rpc });
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain('database down');
  });
});
