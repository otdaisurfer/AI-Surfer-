import { isShopifyWorkspace } from '../../src/features/shopify-access/catalog';
import { accessAdmin, accessConfigured, accessJson, readAccessBody, type AccessRpc, type ShopifyAccessEnv } from '../lib/shopify-access';

interface AccessStorage extends AccessRpc {
  auth: { getUser: (token: string) => PromiseLike<{ data: { user: { id: string; email?: string; email_confirmed_at?: string | null; is_anonymous?: boolean } | null }; error: unknown }> };
}
export async function handleShopifyAccess(request: Request, env: ShopifyAccessEnv, storage?: AccessStorage) {
  if (!['GET', 'POST'].includes(request.method)) return accessJson({ error: 'Method not allowed.' }, 405);
  if (!accessConfigured(env)) return accessJson({ error: 'Shopify purchase access is not available yet. Please contact us.' }, 503);
  const token = request.headers.get('authorization')?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!token) return accessJson({ error: 'Sign in to view your purchases.' }, 401);
  if (Number(request.headers.get('content-length')) > 1024) return accessJson({ error: 'Payload too large.' }, 413);
  let activateSlug: string | null = null;
  if (request.method === 'POST') {
    try {
      const raw = await readAccessBody(request, 1024);
      if (!raw) return accessJson({ error: 'Payload too large.' }, 413);
      const body = JSON.parse(new TextDecoder().decode(raw));
      if (!isShopifyWorkspace(body?.productSlug)) return accessJson({ error: 'Unknown product.' }, 400);
      activateSlug = body.productSlug;
    } catch { return accessJson({ error: 'Invalid request.' }, 400); }
  }
  try {
    const admin = storage ?? accessAdmin(env);
    const { data, error } = await admin.auth.getUser(token);
    const user = data.user;
    if (error || !user) return accessJson({ error: 'Please sign in again.' }, 401);
    if (!user.email || !user.email_confirmed_at || user.is_anonymous) return accessJson({ error: 'Confirm your checkout email before activating access.' }, 403);
    const result = await admin.rpc('resolve_shopify_member_access', {
      p_user_id: user.id, p_email: user.email.trim().toLowerCase(), p_activate_slug: activateSlug,
    });
    if (result.error || !Array.isArray(result.data)) return accessJson({ error: 'Purchase access could not be checked. Please try again.' }, 503);
    return accessJson({ grants: result.data });
  } catch { return accessJson({ error: 'Purchase access could not be checked. Please try again.' }, 503); }
}

export const onRequest = (context: { request: Request; env: ShopifyAccessEnv }) => handleShopifyAccess(context.request, context.env);
