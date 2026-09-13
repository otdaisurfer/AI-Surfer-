const WAVE_STARTER_URL = "https://buy.stripe.com/aFa8wP7JN3500Uy1tt4gg0b";
const STRATEGY_EMAIL = "mailto:oceantidedropservice@gmail.com?subject=AI%20Surfer%20Strategy%20Call";

const offers = [
  {
    title: "Wave Starter",
    price: "$497",
    text: "A focused implementation sprint to turn your clearest AI opportunity into a working business system.",
    cta: "Buy Wave Starter",
    href: WAVE_STARTER_URL,
    featured: true,
  },
  {
    title: "Wave Builder",
    price: "$1,997",
    text: "A larger build for businesses ready to connect AI visibility, lead flow, follow-up, and automation into one practical growth system.",
    cta: "Book a Strategy Call",
    href: STRATEGY_EMAIL,
  },
  {
    title: "Tsunami Growth",
    price: "$3,997",
    text: "Strategy plus deeper implementation for businesses that need multiple AI systems working together across the customer journey.",
    cta: "Talk With AI Surfer",
    href: STRATEGY_EMAIL,
  },
];

export default function Pricing() {
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
              <a href={offer.href} target={offer.href.startsWith("http") ? "_blank" : undefined} rel={offer.href.startsWith("http") ? "noopener noreferrer" : undefined} className="mt-7 inline-flex rounded-full bg-cyan-300 px-6 py-3 font-black text-slate-950">
                {offer.cta}
              </a>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] p-7 text-slate-300">
          <h2 className="text-2xl font-black text-white">Not sure which wave fits?</h2>
          <p className="mt-3 leading-7">Use the free AI Wave Check first, then choose the smallest implementation that solves the clearest business problem.</p>
          <a href="/wave-check" className="mt-5 inline-flex font-black text-cyan-300">Start the free AI Wave Check →</a>
        </div>
      </section>
    </main>
  );
}
