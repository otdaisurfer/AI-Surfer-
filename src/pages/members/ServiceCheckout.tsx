import type { ServiceOffer } from "./serviceOffers";
import { SUPPORT_TERMS } from "./serviceOffers";

export default function ServiceCheckout({ offer }: { offer: ServiceOffer }) {
  return (
    <article className="rounded-3xl border border-cyan-300/30 bg-slate-950/90 p-6 text-white md:p-8">
      <h2 className="text-2xl font-black">{offer.name}</h2>
      <p className="mt-3 leading-7 text-slate-300">{offer.description}</p>
      <p className="mt-5 text-3xl font-black text-cyan-300">
        ${offer.price.toLocaleString("en-US")} <span className="text-sm font-normal text-slate-300">one-time service</span>
      </p>
      <a href={offer.checkoutUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex rounded-full bg-cyan-300 px-6 py-3 font-black text-slate-950">
        Buy {offer.name}
      </a>
      <div className="mt-7 border-t border-white/15 pt-5">
        <h3 className="font-bold text-pink-200">Optional monthly support</h3>
        <p className="mt-2 text-2xl font-black">${offer.support.price} <span className="text-sm font-normal text-slate-300">/ month</span></p>
        <p className="mt-3 leading-7 text-slate-300">{offer.support.scope}</p>
        {offer.support.minutes && <p className="mt-2 text-sm text-slate-300">Up to {offer.support.minutes} minutes per month. Unused time does not roll over.</p>}
        <a href={offer.support.checkoutUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-full border border-pink-200 px-5 py-3 font-bold text-pink-200">
          Subscribe to {offer.name} support
        </a>
        <p className="mt-3 text-xs leading-6 text-slate-400">{SUPPORT_TERMS}</p>
      </div>
      <p className="mt-4 text-xs text-slate-400">USD · Secure Stripe checkout · Membership and service purchases are separate.</p>
    </article>
  );
}
