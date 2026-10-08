import ProductVisualCatalog from "../../components/ProductVisualCatalog";
import WaveHandlerVisual from "../../components/WaveHandlerVisual";
import { useEffect } from "react";
import { MEMBERSHIP } from "../members/serviceOffers";

const AEO_GEO_AUDIT_URL = "https://buy.stripe.com/eVq4gzaVZ350cDg5JJ4gg0a";
const WAVE_STARTER_URL = "https://buy.stripe.com/aFa8wP7JN3500Uy1tt4gg0b";
const STRATEGY_CALL_URL = "https://calendly.com/oceantidedrop/new-meeting";
const STRATEGY_EMAIL = "mailto:oceantidedropservice@gmail.com?subject=AI%20Surfer%20Strategy%20Call";

type FunnelEvent = {
  event: "pricing_view" | "offer_click" | "checkout_start" | "strategy_call_click" | "wave_check_start";
  offer?: string;
  price?: number;
};

function trackFunnelEvent(detail: FunnelEvent) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent("ai-surfer:funnel", { detail }));

  const dataLayer = (window as Window & { dataLayer?: Array<Record<string, unknown>> }).dataLayer;
  dataLayer?.push(detail);
}

const offers = [
  {
    title: "AEO + GEO Wave Audit",
    price: "$97",
    priceValue: 97,
    text: "See how your business appears across AI answers, generative search, and traditional search—and get the clearest visibility fixes to make first.",
    cta: "Get My AEO + GEO Audit",
    href: AEO_GEO_AUDIT_URL,
    kind: "checkout" as const,
    featured: true,
  },
  {
    title: "Wave Starter",
    price: "$497",
    priceValue: 497,
    text: "A focused implementation sprint to turn your clearest AI opportunity into a working business system.",
    cta: "Buy Wave Starter",
    href: WAVE_STARTER_URL,
    kind: "checkout" as const,
  },
  {
    title: "Wave Builder",
    price: "$1,997",
    priceValue: 1997,
    text: "A larger build for businesses ready to connect AI visibility, lead flow, follow-up, and automation into one practical growth system.",
    cta: "Request a Strategy Call",
    href: STRATEGY_CALL_URL,
    kind: "strategy" as const,
  },
  {
    title: "Tsunami Growth",
    price: "$3,997",
    priceValue: 3997,
    text: "Strategy plus deeper implementation for businesses that need multiple AI systems working together across the customer journey.",
    cta: "Talk With AI Surfer",
    href: STRATEGY_CALL_URL,
    kind: "strategy" as const,
  },
];

export default function Pricing() {
  useEffect(() => {
    trackFunnelEvent({ event: "pricing_view" });
  }, []);

  const handleOfferClick = (offer: (typeof offers)[number]) => {
    trackFunnelEvent({ event: "offer_click", offer: offer.title, price: offer.priceValue });

    if (offer.kind === "checkout") {
      trackFunnelEvent({ event: "checkout_start", offer: offer.title, price: offer.priceValue });
      return;
    }

    trackFunnelEvent({ event: "strategy_call_click", offer: offer.title, price: offer.priceValue });
  };

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-16 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Ocean Tide Drop AI SURFER</p>
          <h1 className="mt-3 text-5xl font-black md:text-6xl">Choose Your AI Wave 🌊</h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            Start with the $97 AEO + GEO Wave Audit to see where your business is missing from AI answers, then choose the implementation wave that fits the opportunity.
          </p>
        </div>

      <WaveHandlerVisual />

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {offers.map((offer) => (
            <article key={offer.title} className={`rounded-3xl border p-7 ${offer.featured ? "border-cyan-300 bg-cyan-300/10" : "border-white/10 bg-white/[0.04]"}`}>
              <h2 className="text-2xl font-black">{offer.title}</h2>
              <div className="mt-3 text-4xl font-black text-cyan-300">{offer.price}</div>
              <p className="mt-4 leading-7 text-slate-300">{offer.text}</p>
              <a
                href={offer.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleOfferClick(offer)}
                className="mt-7 inline-flex rounded-full bg-cyan-300 px-6 py-3 font-black text-slate-950"
              >
                {offer.cta}
              </a>
            </article>
          ))}
        </div>

        <section id="packages" className="mt-12 scroll-mt-8">
          <h2 className="text-3xl font-black">Explore every AI SURFER product</h2>
          <p className="mt-3 text-slate-300">Your Wave Handler and AI Fin show each product in action. Choose a product to explore its next step.</p>
          <ProductVisualCatalog />
        </section>

        <section className="mt-10 rounded-3xl border border-pink-200/40 bg-white/[0.04] p-7">
          <h2 className="text-2xl font-black">AI SURFER Membership — ${MEMBERSHIP.price}/month</h2>
          <p className="mt-3 leading-7 text-slate-300">Bronze membership includes Builder Access to the member workspaces assigned to that tier. Done-for-you services and optional monthly support are purchased separately.</p>
          <a href={MEMBERSHIP.checkoutUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex rounded-full bg-cyan-300 px-6 py-3 font-black text-slate-950">Join AI SURFER — $17/month</a>
          <p className="mt-4 text-sm text-slate-300">Use your member account email at checkout. Renews monthly until cancelled.</p>
          <a href="/members/pricing" className="mt-4 inline-flex font-bold text-pink-200">View all Members pricing & optional support →</a>
        </section>

        <div className="mx-auto mt-12 max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] p-7 text-slate-300">
          <h2 className="text-2xl font-black text-white">Not sure which wave fits?</h2>
          <p className="mt-3 leading-7">Use the free AI Wave Check first, then choose the smallest implementation that solves the clearest business problem.</p>
          <a
            href="/wave-check"
            onClick={() => trackFunnelEvent({ event: "wave_check_start" })}
            className="mt-5 inline-flex font-black text-cyan-300"
          >
            Start the free AI Wave Check →
          </a>
          <p className="mt-5 text-sm text-slate-400">
            Prefer email? <a href={STRATEGY_EMAIL} className="font-semibold text-cyan-300">Contact Ocean Tide Drop AI SURFER</a>.
          </p>
        </div>
      </section>
    </main>
  );
}
