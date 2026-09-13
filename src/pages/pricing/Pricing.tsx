import { useEffect } from "react";

const WAVE_STARTER_URL = "https://buy.stripe.com/aFa8wP7JN3500Uy1tt4gg0b";
const STRATEGY_URL = "https://calendly.com/oceantidedrop/new-meeting";
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
    title: "Wave Starter",
    price: "$497",
    priceValue: 497,
    text: "A focused implementation sprint to turn your clearest AI opportunity into a working business system.",
    cta: "Buy Wave Starter",
    href: WAVE_STARTER_URL,
    kind: "checkout" as const,
    featured: true,
  },
  {
    title: "Wave Builder",
    price: "$1,997",
    priceValue: 1997,
    text: "A larger build for businesses ready to connect AI visibility, lead flow, follow-up, and automation into one practical growth system.",
    cta: "Book a Strategy Call",
    href: STRATEGY_URL,
    kind: "strategy" as const,
  },
  {
    title: "Tsunami Growth",
    price: "$3,997",
    priceValue: 3997,
    text: "Strategy plus deeper implementation for businesses that need multiple AI systems working together across the customer journey.",
    cta: "Talk With AI Surfer",
    href: STRATEGY_URL,
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
            Start with one focused build or bring us in for a broader growth system. Every offer is designed to move from opportunity to implementation without a maze of stale tiers.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
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
