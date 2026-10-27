import { Link } from 'react-router-dom';
import { activeShopifyAccess, SHOPIFY_WORKSPACE_NAMES, type ShopifyAccess } from './catalog';
import { useShopifyPurchases } from './useShopifyPurchases';

export function PurchaseAccessCard({ grant, activate, activating, now }: { grant: ShopifyAccess; activate: (slug: string) => void; activating: boolean; now: number }) {
  const active = Boolean(activeShopifyAccess([grant], grant.product_slug, now));
  const label = SHOPIFY_WORKSPACE_NAMES[grant.product_slug] ?? 'Member workspace';
  return <section className="my-5 rounded-2xl border border-cyan-300/40 bg-slate-950 p-6 text-white">
    <h2 className="text-xl font-bold">{label} purchase access</h2>
    {grant.status === 'pending' ? <>
      <p className="my-3">Your purchase includes 30 days of access to this workspace. The clock starts when you activate it. No automatic renewal or recurring charge.</p>
      <button type="button" disabled={activating} onClick={() => activate(grant.product_slug)} className="rounded-full bg-cyan-300 px-5 py-3 font-bold text-slate-950 disabled:opacity-50">{activating ? 'Activating…' : 'Activate my 30 days'}</button>
    </> : active ? <>
      <p className="my-3">Access ends {new Date(grant.expires_at!).toLocaleString()}. No automatic renewal.</p>
      <Link className="underline" to={`/members/products/${grant.product_slug}`}>Open {label}</Link>
    </> : <p className="my-3">{grant.status === 'revoked' ? 'Bonus access for this order is no longer available following a refund or cancellation.' : 'Your 30-day purchase access has ended. You can choose a membership separately.'}</p>}
  </section>;
}

export default function ShopifyPurchases() {
  const { grants, now, loading, error, activate, activating } = useShopifyPurchases();
  return <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 text-white">
    <Link to="/members" className="underline">Back to Command Center</Link>
    <h1 className="my-5 text-3xl font-bold">Your Shopify purchases</h1>
    <p>Sign in with the same email you used at checkout and confirm that email to see eligible workspace access. Each qualifying purchase includes 30 days from activation. It does not change your membership tier.</p>
    {loading ? <p role="status" className="my-5">Checking your purchases…</p> : error ? <p role="alert" className="my-5">{error}</p> : !grants.length ? <p className="my-5">No eligible workspace purchases are available for this account yet. A paid order may take a moment to appear. For a different checkout email or help with a service order, <a className="underline" href="https://wa.me/18438704590">contact us</a>.</p> : grants.map((grant, index) => <PurchaseAccessCard key={`${grant.product_slug}-${index}`} {...{ grant, now, activate, activating }} />)}
    <p className="mt-6 text-slate-300">Wave Audit and Lead Leak Finder remain manually delivered services. Free resources do not grant a paid workspace. Bonus access ends if its order is refunded or cancelled. Service delivery and optional support are arranged separately.</p>
  </main>;
}
