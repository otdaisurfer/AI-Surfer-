import { Link } from "react-router-dom";
import { MEMBERSHIP, SERVICE_OFFERS } from "./serviceOffers";
import ServiceCheckout from "./ServiceCheckout";

export default function MembersPricing() {
  return (
    <main className="mx-auto max-w-6xl px-2 py-8 text-white md:px-6">
      <Link to="/members" className="font-bold text-cyan-200">← Command Center</Link>
      <header className="mb-8 mt-7">
        <p className="text-xs font-black uppercase tracking-widest text-cyan-300">Ocean Tide Drop AI SURFER</p>
        <h1 className="mt-3 text-4xl font-black md:text-5xl">Members Pricing & Payments</h1>
        <p className="mt-4 max-w-3xl leading-8 text-slate-200">Choose membership, a focused service, or optional monthly support. Each option has its own Stripe checkout.</p>
      </header>
      <section className="mb-10 rounded-3xl border border-pink-200/40 bg-slate-950/90 p-7">
        <h2 className="text-2xl font-black">{MEMBERSHIP.name}</h2>
        <p className="mt-3 text-4xl font-black text-cyan-300">${MEMBERSHIP.price}<span className="text-base font-normal text-slate-300"> / month</span></p>
        <p className="mt-4 leading-7 text-slate-300">Bronze membership provides Builder Access to the member workspaces assigned to that tier. Done-for-you services and monthly support are purchased separately; they do not change your workspace tier.</p>
        <a href={MEMBERSHIP.checkoutUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex rounded-full bg-cyan-300 px-6 py-3 font-black text-slate-950">Join AI SURFER — $17/month</a>
        <p className="mt-4 text-sm leading-7 text-slate-300">Use the same email as your member account at checkout. Membership renews monthly until cancelled. If you already subscribe, keep your existing membership.</p>
      </section>
      <h2 className="mb-3 text-3xl font-black">Services & Optional Support</h2>
      <p className="mb-6 leading-7 text-slate-200">Confirm the service scope with AI SURFER before purchasing. Reports and blueprints include recommendations; implementation is separate. Support starts with the separately selected subscription.</p>
      <div className="grid gap-6 xl:grid-cols-2">
        {SERVICE_OFFERS.map((offer) => <ServiceCheckout key={offer.slug} offer={offer} />)}
      </div>
      <section className="mt-8 rounded-3xl border border-white/20 bg-slate-950/90 p-7">
        <h2 className="text-2xl font-black">Free AI Wave Check — $0</h2>
        <p className="mt-3 text-slate-300">Discover your first AI opportunity before choosing a service.</p>
        <Link to="/wave-check" className="mt-4 inline-flex font-bold text-cyan-300">Start the free AI Wave Check →</Link>
      </section>
    </main>
  );
}
