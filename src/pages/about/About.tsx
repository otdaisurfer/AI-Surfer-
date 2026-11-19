export default function About() {
  return (
    <main className="min-h-screen bg-slate-950 px-5 py-16 text-white">
      <section className="mx-auto max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Ocean Tide Drop AI SURFER</p>
        <h1 className="mt-3 text-5xl font-black md:text-6xl">About AI Surfer 🌊</h1>
        <p className="mt-6 text-lg leading-8 text-slate-300">
          Ocean Tide Drop AI SURFER helps small businesses catch a bigger AI wave. Based in Charleston,
          South Carolina, we work with businesses that want practical AI — not hype: systems that find
          leads, follow up faster, and take repetitive work off the team&rsquo;s plate.
        </p>
        <p className="mt-5 text-lg leading-8 text-slate-300">
          It starts with the free AI Wave Check. Answer five quick questions about your business and get
          an AI Opportunity Score™ plus a recommended AI Surfer agent — the practical first step for
          your biggest opportunity, whether that is finding new leads, following up, creating content,
          customer care, or automation.
        </p>
        <p className="mt-5 text-lg leading-8 text-slate-300">
          From there, businesses can choose the implementation wave that fits: the AEO + GEO Wave Audit
          ($97), Wave Starter ($497), Wave Builder ($1,997), or Tsunami Growth ($3,997) — covering AI
          visibility, lead flow, follow-up, content, and automation.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <a
            href="/wave-check"
            className="rounded-3xl border border-cyan-300/25 bg-cyan-300/10 p-6 font-black text-cyan-100 transition hover:bg-cyan-300/20"
          >
            Start the free AI Wave Check →
          </a>
          <a
            href="/pricing"
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 font-black text-white transition hover:bg-white/10"
          >
            See the packages →
          </a>
          <a
            href="/services"
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 font-black text-white transition hover:bg-white/10"
          >
            Explore the services →
          </a>
          <a
            href="/contact"
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 font-black text-white transition hover:bg-white/10"
          >
            Get in touch →
          </a>
        </div>
      </section>
    </main>
  );
}
