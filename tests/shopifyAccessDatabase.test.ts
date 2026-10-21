// @vitest-environment node
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { createHmac } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { handleShopifyWebhook } from '../functions/api/shopify-webhook';
import { handleShopifyAccess } from '../functions/api/shopify-access';

const db = new PGlite();
const userId = '11111111-1111-4111-8111-111111111111';
const otherId = '22222222-2222-4222-8222-222222222222';
beforeAll(async () => {
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key);
    insert into auth.users values ('${userId}'), ('${otherId}');`);
  await db.exec(readFileSync(new URL('../supabase/migrations/20261020035805_shopify_product_access.sql', import.meta.url), 'utf8'));
}, 20000);
afterAll(async () => db.close());
async function paid(order: string, slug = 'content-creator') {
  await db.query('select public.record_shopify_access_order($1,$2,$3,false,$4::jsonb)', ['nrctqw-pi.myshopify.com', order, 'buyer@example.com', JSON.stringify([{ line_item_id: order, product_slug: slug }])]);
}
async function revoke(order: string) {
  await db.query('select public.record_shopify_access_order($1,$2,null,true,\'[]\'::jsonb)', ['nrctqw-pi.myshopify.com', order]);
}
async function access(slug: string | null = null, user = userId, email = 'buyer@example.com') {
  return (await db.query<{ product_slug: string; status: string; activated_at: string; expires_at: string }>('select * from public.resolve_shopify_member_access($1::uuid,$2,$3)', [user, email, slug])).rows;
}
describe('Shopify access SQL using Postgres', () => {
  it('keeps the clock stopped until activation, scopes access, and starts exactly 30 days', async () => {
    await paid('101');
    expect((await access())[0]).toMatchObject({ product_slug: 'content-creator', status: 'pending', activated_at: null, expires_at: null });
    expect(await access(null, otherId, 'different@example.com')).toEqual([]);
    const [grant] = await access('content-creator');
    expect(grant.status).toBe('active');
    expect(Date.parse(grant.expires_at) - Date.parse(grant.activated_at)).toBe(30 * 24 * 60 * 60 * 1000);
    await paid('101'); // webhook replay must not reset activation
    expect((await access('content-creator'))[0].expires_at).toEqual(grant.expires_at);
    expect(await access(null, otherId)).toEqual([]);
    expect((await access()).some((row) => row.product_slug === 'big-kahuna')).toBe(false);
  });
  it('does not consume a second purchase while one period is active', async () => {
    await paid('102');
    await access('content-creator');
    expect((await access()).filter((row) => row.status === 'active')).toHaveLength(1);
    expect((await access()).filter((row) => row.status === 'pending')).toHaveLength(1);
  });
  it('preserves revocation when notifications are reordered or replayed', async () => {
    await revoke('103'); await paid('103', 'big-kahuna');
    expect((await access()).some((row) => row.product_slug === 'big-kahuna')).toBe(false);
    await revoke('101'); await paid('101');
    expect((await access()).some((row) => row.status === 'revoked')).toBe(true);
  });
  it('expires a period instead of extending it during a read or retry', async () => {
    await paid('104', 'sales-rider'); await access('sales-rider');
    await db.exec(`update public.shopify_product_access set activated_at = now() - interval '31 days', expires_at = now() - interval '1 day' where order_id = '104'`);
    expect((await access('sales-rider')).find((row) => row.product_slug === 'sales-rider')?.status).toBe('expired');
  });
  it('denies direct client reads and activation RPC calls', async () => {
    await db.exec('set role authenticated');
    try {
      await expect(db.query('select * from public.shopify_product_access')).rejects.toThrow(/permission denied/);
      await expect(access('content-creator')).rejects.toThrow(/permission denied/);
    } finally { await db.exec('reset role'); }
  });
  it('allows only the server role to record and resolve orders', async () => {
    await db.exec('set role service_role');
    try { await paid('105', 'automation-architect'); expect((await access()).some((row) => row.product_slug === 'automation-architect')).toBe(true); }
    finally { await db.exec('reset role'); }
  });
  it('runs paid receipt, verified activation, duplicate delivery, and refund through the HTTP handlers', async () => {
    const env = { SHOPIFY_WEBHOOK_SECRET: 'flow-test-secret', SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'test-key' };
    const rpc = async (name: string, args: Record<string, unknown>) => {
      try {
        const result = name === 'record_shopify_access_order'
          ? await db.query('select public.record_shopify_access_order($1,$2,$3,$4,$5::jsonb)', [args.p_shop, args.p_order_id, args.p_email, args.p_revoke, JSON.stringify(args.p_items)])
          : await db.query('select * from public.resolve_shopify_member_access($1::uuid,$2,$3)', [args.p_user_id, args.p_email, args.p_activate_slug]);
        return { data: result.rows, error: null };
      } catch (error) { return { data: null, error }; }
    };
    const auth = { getUser: async () => ({ data: { user: { id: userId, email: 'buyer@example.com', email_confirmed_at: '2026-10-20' } }, error: null }) };
    const webhook = async (payload: unknown, topic = 'orders/paid') => {
      const body = JSON.stringify(payload);
      const signature = createHmac('sha256', env.SHOPIFY_WEBHOOK_SECRET).update(body).digest('base64');
      return handleShopifyWebhook(new Request('https://example.com/api/shopify-webhook', { method: 'POST', body, headers: { 'X-Shopify-Shop-Domain': 'nrctqw-pi.myshopify.com', 'X-Shopify-Topic': topic, 'X-Shopify-Hmac-Sha256': signature } }), env, { rpc });
    };
    const order = { id: 106, email: 'buyer@example.com', financial_status: 'paid', currency: 'USD', total_price: '997.00', test: false, line_items: [{ id: 106, product_id: 8045514096699, quantity: 1, price: '997.00' }] };
    expect((await webhook(order)).status).toBe(200);
    const activate = () => handleShopifyAccess(new Request('https://example.com/api/shopify-access', { method: 'POST', headers: { Authorization: 'Bearer server-verified-token' }, body: JSON.stringify({ productSlug: 'big-kahuna' }) }), env, { rpc, auth });
    const first = await (await activate()).json();
    const grant = first.grants.find((row: { product_slug: string }) => row.product_slug === 'big-kahuna');
    expect(grant.status).toBe('active');
    expect(Date.parse(grant.expires_at) - Date.parse(grant.activated_at)).toBe(2_592_000_000);
    expect((await webhook(order)).status).toBe(200);
    const repeated = await (await activate()).json();
    expect(repeated.grants.find((row: { product_slug: string }) => row.product_slug === 'big-kahuna').expires_at).toBe(grant.expires_at);
    expect((await webhook({ id: 1060, order_id: 106 }, 'refunds/create')).status).toBe(200);
    const refunded = await (await activate()).json();
    expect(refunded.grants.find((row: { product_slug: string }) => row.product_slug === 'big-kahuna').status).toBe('revoked');
  });
});
