import { SHOPIFY_STORE, SHOPIFY_PRODUCT_TO_WORKSPACE } from '../../src/features/shopify-access/catalog';
import { accessAdmin, accessConfigured, accessJson, readAccessBody, type AccessRpc, type ShopifyAccessEnv } from '../lib/shopify-access';

function id(value: unknown): string | null {
  if (typeof value === 'number' && !Number.isSafeInteger(value)) return null;
  const candidate = String(value ?? '');
  return /^[1-9]\d{0,19}$/.test(candidate) ? candidate : null;
}
function money(value: unknown): number {
  return typeof value === 'string' && /^\d+(\.\d{1,2})?$/.test(value) ? Number(value) : NaN;
}
async function authentic(body: Uint8Array, signature: string | null, secret: string) {
  if (!signature || !/^[A-Za-z0-9+/]{43}=$/.test(signature)) return false;
  try {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const digest = Uint8Array.from(atob(signature), (char) => char.charCodeAt(0));
    return await crypto.subtle.verify('HMAC', key, digest, new Uint8Array(body));
  } catch { return false; }
}

export async function handleShopifyWebhook(request: Request, env: ShopifyAccessEnv, storage?: AccessRpc) {
  if (request.method !== 'POST') return accessJson({ error: 'Method not allowed.' }, 405);
  if (!accessConfigured(env)) return accessJson({ error: 'Shopify access is not configured.' }, 503);
  if (request.headers.get('X-Shopify-Shop-Domain') !== SHOPIFY_STORE) return accessJson({ error: 'Invalid webhook.' }, 401);
  if (Number(request.headers.get('content-length')) > 1_048_576) return accessJson({ error: 'Payload too large.' }, 413);
  let body: Uint8Array | null;
  try { body = await readAccessBody(request, 1_048_576); }
  catch { return accessJson({ error: 'Invalid request body.' }, 400); }
  if (!body) return accessJson({ error: 'Payload too large.' }, 413);
  if (!await authentic(body, request.headers.get('X-Shopify-Hmac-Sha256'), env.SHOPIFY_WEBHOOK_SECRET!)) {
    return accessJson({ error: 'Invalid webhook.' }, 401);
  }
  const topic = request.headers.get('X-Shopify-Topic');
  if (!['orders/paid', 'orders/cancelled', 'refunds/create'].includes(topic ?? '')) return accessJson({ ok: true });

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(new TextDecoder().decode(body));
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error();
  } catch { return accessJson({ error: 'Invalid payload.' }, 400); }
  if (payload.test === true) return accessJson({ ok: true });
  const revoke = topic !== 'orders/paid';
  const orderId = id(topic === 'refunds/create' ? payload.order_id : payload.id);
  if (!orderId) return accessJson({ error: 'Invalid order.' }, 400);
  if (topic === 'orders/cancelled' && !payload.cancelled_at) return accessJson({ error: 'Invalid cancellation.' }, 400);
  const items: { line_item_id: string; product_slug: string }[] = [];
  let email: string | null = null;
  if (!revoke) {
    if (payload.financial_status !== 'paid' || payload.currency !== 'USD' || !(money(payload.total_price) > 0) || payload.cancelled_at) {
      return accessJson({ ok: true });
    }
    email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : null;
    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return accessJson({ error: 'Missing buyer email.' }, 400);
    if (!Array.isArray(payload.line_items)) return accessJson({ error: 'Missing line items.' }, 400);
    for (const line of payload.line_items) {
      if (!line || typeof line !== 'object') return accessJson({ error: 'Invalid line item.' }, 400);
      const productId = id(line.product_id);
      const slug = productId ? SHOPIFY_PRODUCT_TO_WORKSPACE[productId] : undefined;
      if (!slug) continue;
      const lineId = id(line.id);
      if (!lineId || !Number.isSafeInteger(line.quantity) || line.quantity <= 0) return accessJson({ error: 'Invalid line item.' }, 400);
      const discount = money(line.total_discount ?? '0.00');
      if (!(money(line.price) * line.quantity - discount > 0)) continue;
      items.push({ line_item_id: lineId, product_slug: slug });
    }
    if (!items.length) return accessJson({ ok: true });
  }
  try {
    const { error } = await (storage ?? accessAdmin(env)).rpc('record_shopify_access_order', {
      p_shop: SHOPIFY_STORE, p_order_id: orderId, p_email: email, p_revoke: revoke, p_items: items,
    });
    if (error) return accessJson({ error: 'Please retry delivery.' }, 503);
    return accessJson({ ok: true });
  } catch { return accessJson({ error: 'Please retry delivery.' }, 503); }
}

export const onRequest = (context: { request: Request; env: ShopifyAccessEnv }) => handleShopifyWebhook(context.request, context.env);
