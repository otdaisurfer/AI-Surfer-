import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { ShopifyAccess } from './catalog';

export function useShopifyPurchases() {
  const { session } = useAuth();
  const token = session?.access_token;
  const currentToken = useRef(token);
  currentToken.current = token;
  const [state, setState] = useState<{ token?: string; grants: ShopifyAccess[]; error: string; loading: boolean }>({ grants: [], error: '', loading: Boolean(token) });
  const [activating, setActivating] = useState(false);
  const [now, setNow] = useState(Date.now());
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  const load = useCallback(async (productSlug?: string, signal?: AbortSignal) => {
    if (!token) return;
    try {
      const response = await fetch('/api/shopify-access', {
        method: productSlug ? 'POST' : 'GET',
        headers: { Authorization: `Bearer ${token}`, ...(productSlug ? { 'Content-Type': 'application/json' } : {}) },
        ...(productSlug ? { body: JSON.stringify({ productSlug }) } : {}), signal,
      });
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.grants)) throw new Error(data.error || 'Purchase access could not be checked.');
      if (mounted.current && currentToken.current === token && !signal?.aborted) {
        setState({ token, grants: data.grants, error: '', loading: false });
      }
    } catch (error) {
      if (mounted.current && currentToken.current === token && !signal?.aborted) {
        setState({ token, grants: [], error: error instanceof Error ? error.message : 'Purchase access could not be checked.', loading: false });
      }
    }
  }, [token]);

  useEffect(() => {
    const controller = new AbortController();
    if (token) {
      setState({ token, grants: [], error: '', loading: true });
      void load(undefined, controller.signal);
    }
    return () => controller.abort();
  }, [token, load]);
  // Re-render at the exact expiry boundary, including while the page stays open.
  const grants = state.token === token && token ? state.grants : [];
  useEffect(() => {
    const future = grants.map((grant) => Date.parse(grant.expires_at ?? '')).filter((time) => time > now);
    if (!future.length) return;
    const timer = window.setTimeout(() => setNow(Date.now()), Math.max(1, Math.min(2_147_483_647, Math.min(...future) - Date.now() + 1)));
    return () => window.clearTimeout(timer);
  }, [grants, now]);

  const activate = async (slug: string) => {
    if (!token || activating) return;
    setActivating(true);
    try { await load(slug); setNow(Date.now()); }
    finally { if (mounted.current) setActivating(false); }
  };
  return { grants, now, loading: Boolean(token) && (state.token !== token || state.loading), error: state.token === token ? state.error : '', activating, activate };
}
