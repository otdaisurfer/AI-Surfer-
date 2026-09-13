import { Link } from "react-router-dom";

const SUPPORT_EMAIL = "oceantidedropservice@gmail.com";
const SUPPORT_HREF = `mailto:${SUPPORT_EMAIL}?subject=Wave%20Starter%20Handoff`;

export default function WaveStarterSuccess() {
  return (
    <main className="min-h-screen bg-slate-950 px-5 py-16 text-white">
      <section className="mx-auto max-w-2xl rounded-[2rem] border border-cyan-300/25 bg-slate-900/80 p-8 shadow-2xl">
        <div className="text-center">
          <div className="text-5xl" aria-hidden="true">🌊</div>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Payment complete</p>
          <h1 className="mt-3 text-4xl font-black">Wave Starter Payment Received</h1>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-300">
            Your $497 Wave Starter purchase is complete. Ocean Tide Drop AI SURFER will use the business details and checkout email you provided to prepare your handoff.
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-2xl font-black">What happens next</h2>
          <ol className="mt-4 space-y-3 leading-7 text-slate-300">
            <li><strong className="text-white">1.</strong> We review the goal and business details from your checkout.</li>
            <li><strong className="text-white">2.</strong> We contact you at your checkout email to confirm the Wave Starter scope and kickoff details.</li>
            <li><strong className="text-white">3.</strong> Your focused implementation sprint begins after the handoff details are confirmed.</li>
          </ol>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/" className="inline-flex justify-center rounded-full bg-gradient-to-r from-cyan-300 to-teal-300 px-7 py-4 font-black text-slate-950">
            Return to AI Surfer
          </Link>
          <a href={SUPPORT_HREF} className="inline-flex justify-center rounded-full border border-white/15 px-7 py-4 font-black text-cyan-300">
            Email {SUPPORT_EMAIL}
          </a>
        </div>
      </section>
    </main>
  );
}
