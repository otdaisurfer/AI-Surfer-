import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const SUPPORT_EMAIL = "oceantidedropservice@gmail.com";
const SUPPORT_HREF = `mailto:${SUPPORT_EMAIL}?subject=Wave%20Starter%20Handoff`;

type VerificationState =
  | { status: "checking" }
  | { status: "verified"; amount: number; currency: string }
  | { status: "pending" }
  | { status: "error"; message: string };

export default function WaveStarterSuccess() {
  const [searchParams] = useSearchParams();
  const [verification, setVerification] = useState<VerificationState>({ status: "checking" });
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    let active = true;

    async function verify() {
      if (!sessionId) {
        setVerification({
          status: "error",
          message: "This page is missing its Stripe checkout session. Use the link Stripe sent after payment or contact us for help.",
        });
        return;
      }

      try {
        const response = await fetch(
          `/api/wave-starter-session?session_id=${encodeURIComponent(sessionId)}`,
          { headers: { Accept: "application/json" } },
        );
        const body = await response.json() as {
          verified?: boolean;
          amount?: number;
          currency?: string;
          error?: string;
        };

        if (!active) return;

        if (!response.ok) {
          setVerification({
            status: "error",
            message: body.error || "We could not verify this checkout session yet.",
          });
          return;
        }

        if (body.verified === true) {
          setVerification({
            status: "verified",
            amount: body.amount ?? 497,
            currency: body.currency ?? "USD",
          });
          return;
        }

        setVerification({ status: "pending" });
      } catch {
        if (active) {
          setVerification({
            status: "error",
            message: "We could not reach Stripe verification right now. Your payment may still be complete, so please use your Stripe receipt or contact us before paying again.",
          });
        }
      }
    }

    void verify();
    return () => {
      active = false;
    };
  }, [sessionId]);

  if (verification.status === "checking") {
    return (
      <main className="min-h-screen bg-slate-950 px-5 py-16 text-white">
        <section className="mx-auto max-w-2xl rounded-[2rem] border border-cyan-300/25 bg-slate-900/80 p-8 text-center shadow-2xl">
          <div className="text-5xl" aria-hidden="true">🌊</div>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Checking Stripe</p>
          <h1 className="mt-3 text-4xl font-black">Verifying your Wave Starter payment…</h1>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-300">
            We’re confirming the checkout session before we mark your purchase complete.
          </p>
        </section>
      </main>
    );
  }

  if (verification.status === "pending" || verification.status === "error") {
    const isPending = verification.status === "pending";
    return (
      <main className="min-h-screen bg-slate-950 px-5 py-16 text-white">
        <section className="mx-auto max-w-2xl rounded-[2rem] border border-amber-300/25 bg-slate-900/80 p-8 text-center shadow-2xl">
          <div className="text-5xl" aria-hidden="true">{isPending ? "⏳" : "🌊"}</div>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-amber-300">
            {isPending ? "Payment still processing" : "Verification needed"}
          </p>
          <h1 className="mt-3 text-4xl font-black">
            {isPending ? "Stripe has not marked this payment complete yet." : "We could not confirm this payment automatically."}
          </h1>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-300">
            {isPending
              ? "Please wait a moment and refresh this page. Do not submit a second payment while Stripe is processing the first one."
              : verification.message}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/pricing" className="inline-flex justify-center rounded-full bg-gradient-to-r from-cyan-300 to-teal-300 px-7 py-4 font-black text-slate-950">
              Back to pricing
            </Link>
            <a href={SUPPORT_HREF} className="inline-flex justify-center rounded-full border border-white/15 px-7 py-4 font-black text-cyan-300">
              Email {SUPPORT_EMAIL}
            </a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-16 text-white">
      <section className="mx-auto max-w-2xl rounded-[2rem] border border-cyan-300/25 bg-slate-900/80 p-8 shadow-2xl">
        <div className="text-center">
          <div className="text-5xl" aria-hidden="true">🌊</div>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Payment verified</p>
          <h1 className="mt-3 text-4xl font-black">Wave Starter Payment Received</h1>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-300">
            Stripe confirmed your {verification.currency} ${verification.amount} Wave Starter purchase. Ocean Tide Drop AI SURFER will use the business details and checkout email you provided to prepare your handoff.
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-2xl font-black">What happens next</h2>
          <ol className="mt-4 space-y-3 leading-7 text-slate-300">
            <li><strong className="text-white">1.</strong> Your payment is recorded and queued for the Wave Starter handoff.</li>
            <li><strong className="text-white">2.</strong> We review the goal and business details from your checkout.</li>
            <li><strong className="text-white">3.</strong> We contact you at your checkout email to confirm scope and kickoff details.</li>
            <li><strong className="text-white">4.</strong> Your focused implementation sprint begins after the handoff details are confirmed.</li>
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
