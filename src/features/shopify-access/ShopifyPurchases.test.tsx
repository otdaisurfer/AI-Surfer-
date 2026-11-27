import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MemberProduct from '../../pages/members/MemberProduct';
import { activeShopifyAccess } from './catalog';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const state = vi.hoisted(() => ({ user: { id: 'buyer', app_metadata: {} }, session: { access_token: 'buyer-token' } }));
vi.mock('../../context/AuthContext', () => ({ useAuth: () => state }));
vi.mock('../../lib/supabase', () => ({ supabase: { from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { tier: 'free' }, error: null }) }) }) }) } }));
let root: Root | undefined;
afterEach(async () => { if (root) await act(async () => root?.unmount()); root = undefined; vi.useRealTimers(); vi.unstubAllGlobals(); document.body.replaceChildren(); });
async function renderProduct(slug = 'content-creator') {
  const container = document.createElement('div'); document.body.append(container); root = createRoot(container);
  await act(async () => root!.render(<MemoryRouter initialEntries={[`/members/products/${slug}`]}><Routes><Route path="/members/products/:slug" element={<MemberProduct />} /></Routes></MemoryRouter>));
  return container;
}
const grant = { product_slug: 'content-creator', status: 'pending', activated_at: null, expires_at: null };
const response = (grants: unknown[]) => new Response(JSON.stringify({ grants }), { status: 200 });
describe('purchase-based workspace access', () => {
  it('starts the period only after the customer clicks activation', async () => {
    const request = vi.fn().mockResolvedValueOnce(response([grant])).mockResolvedValueOnce(response([{ ...grant, status: 'active', activated_at: '2026-10-20T00:00:00Z', expires_at: '2026-11-19T00:00:00Z' }]));
    vi.stubGlobal('fetch', request); vi.setSystemTime(new Date('2026-10-20T00:00:00Z'));
    const container = await renderProduct();
    expect(container.textContent).not.toContain('Your Content Creator workspace is ready.');
    expect(request).toHaveBeenCalledTimes(1);
    const activate = [...container.querySelectorAll('button')].find((button) => button.textContent === 'Activate my 30 days')!;
    await act(async () => activate.click());
    expect(request.mock.calls[1][1]).toMatchObject({ method: 'POST', body: JSON.stringify({ productSlug: 'content-creator' }) });
    expect(container.textContent).toContain('Your Content Creator workspace is ready.');
    expect(container.textContent).toContain('Your membership tier stays unchanged.');
  });
  it('does not unlock a different product from a purchased grant', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response([{ ...grant, status: 'active', expires_at: '2099-01-01T00:00:00Z' }])));
    const container = await renderProduct('big-kahuna');
    expect(container.textContent).not.toContain('Your Big Kahuna workspace is ready.');
    expect(container.textContent).toContain('Unlock the ongoing Big Kahuna workspace');
  });
  it('removes bonus access when it expires while the page remains open', async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-20T00:00:00Z'));
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response([{ ...grant, status: 'active', expires_at: '2026-10-20T00:00:01Z' }])));
    const container = await renderProduct();
    expect(container.textContent).toContain('Your Content Creator workspace is ready.');
    await act(async () => vi.advanceTimersByTime(1001));
    expect(container.textContent).not.toContain('Your Content Creator workspace is ready.');
  });
  it('handles a full 30-day timer without overflowing the browser timeout', async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-20T00:00:00Z'));
    const timer = vi.spyOn(window, 'setTimeout');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response([{ ...grant, status: 'active', expires_at: '2026-11-19T00:00:00Z' }])));
    await renderProduct();
    expect(timer.mock.calls.some((call) => call[1] === 2_147_483_647)).toBe(true);
    timer.mockRestore();
  });
  it('never accepts expired, revoked, or pending grants as active', () => {
    for (const status of ['expired', 'revoked', 'pending'] as const) {
      expect(activeShopifyAccess([{ ...grant, status, expires_at: '2099-01-01T00:00:00Z' }], 'content-creator')).toBeUndefined();
    }
  });
});
