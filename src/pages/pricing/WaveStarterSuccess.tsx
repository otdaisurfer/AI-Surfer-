import { FormEvent, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const SUPPORT_EMAIL = "oceantidedropservice@gmail.com";
const SUPPORT_HREF = `mailto:${SUPPORT_EMAIL}?subject=Wave%20Starter%20Handoff`;

type VerificationState =
  | { status: "checking" }
  | { status: "verified"; amount: number; currency: string }
  | { status: "pending" }
  | { status: "error"; message: string };

type IntakeState = {
  contactName: string;
  email: string;
  businessName: string;
  website: string;
  primaryGoal: string;
  biggestBottleneck: string;
  systemsUsed: string;
  notes: string;
};

const EMPTY_INTAKE: IntakeState = {
  contactName: "",
  email: "",
  businessName: "",
  website: "",
  primaryGoal: "",
  biggestBottleneck: "",
  systemsUsed: "",
  notes: "",
};

export default function WaveStarterSuccess() {
  const [searchParams] = useSearchParams();
  const [verification, setVerification] = useState<VerificationState>({ status: "checking" });
  const [intake, setIntake] = useState<IntakeState>(EMPTY_INTAKE);
  const [submitting, setSubmitting] = useState(false);
  const [intakeStatus, setIntakeStatus] = useState<"idle" | "success" | "error">("idle");
  const [intakeMessage, setIntakeMessage] = useState("");
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

  async function submitIntake(event: FormEvent) {
    event.preventDefault();
    if (!sessionId || submitting) return;

    setSubmitting(true);
    setIntakeStatus("idle");
    setIntakeMessage("");

    try {
      const response = await fetch("/api/wave-starter-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          contactName: intake.contactName,
          email: intake.email,
          businessName: intake.businessName,
          website: intake.website || undefined,
          primaryGoal: intake.primaryGoal,
          biggestBottleneck: intake.biggestBottleneck,
          systemsUsed: intake.systemsUsed
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
          notes: intake.notes || undefined,
        }),
      });

      const body = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok || body.ok !== true) {
        throw new Error(body.error || "We could not save your kickoff intake yet.");
      }

      setIntakeStatus("success");
      setIntakeMessage("Kickoff intake received. Your Wave Starter handoff is ready for the AI SURFER team.");
    } catch (error) {
      setIntakeStatus("error");
      setIntakeMessage(
        error instanceof Error
          ? error.message
          : "We could not save your kickoff intake yet. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

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
          <h2 className="text-2xl font-black">Start your Wave Starter kickoff</h2>
          <p className="mt-2 leading-7 text-slate-300">
            Give us the essentials now so your paid project can move straight into handoff instead of waiting on another round of questions.
          </p>

          {intakeStatus === "success" ? (
            <div className="mt-6 rounded-2xl border border-emerald-300/25 bg-emerald-300/10 p-5">
              <p className="font-black text-emerald-200">Kickoff intake received 🌊</p>
              <p className="mt-2 text-slate-200">{intakeMessage}</p>
            </div>
          ) : (
            <form onSubmit={submitIntake} className="mt-6 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold">
                  Your name
                  <input
                    required
                    value={intake.contactName}
                    onChange={(event) => setIntake({ ...intake, contactName: event.target.value })}
                    className="rounded-xl border border-white/15 bg-slate-950/80 px-4 py-3 font-normal text-white"
                    placeholder="Taylor Reed"
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold">
                  Checkout email
                  <input
                    required
                    type="email"
                    value={intake.email}
                    onChange={(event) => setIntake({ ...intake, email: event.target.value })}
                    className="rounded-xl border border-white/15 bg-slate-950/80 px-4 py-3 font-normal text-white"
                    placeholder="you@business.com"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold">
                  Business name
                  <input
                    required
                    value={intake.businessName}
                    onChange={(event) => setIntake({ ...intake, businessName: event.target.value })}
                    className="rounded-xl border border-white/15 bg-slate-950/80 px-4 py-3 font-normal text-white"
                    placeholder="Your business"
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold">
                  Website
                  <input
                    type="url"
                    value={intake.website}
                    onChange={(event) => setIntake({ ...intake, website: event.target.value })}
                    className="rounded-xl border border-white/15 bg-slate-950/80 px-4 py-3 font-normal text-white"
                    placeholder="https://yourbusiness.com"
                  />
                </label>
              </div>

              <label className="grid gap-2 text-sm font-bold">
                Main goal for this build
                <textarea
                  required
                  value={intake.primaryGoal}
                  onChange={(event) => setIntake({ ...intake, primaryGoal: event.target.value })}
                  className="min-h-24 rounded-xl border border-white/15 bg-slate-950/80 px-4 py-3 font-normal text-white"
                  placeholder="What result matters most over the next 30 days?"
                />
              </label>

              <label className="grid gap-2 text-sm font-bold">
                Biggest bottleneck
                <textarea
                  required
                  value={intake.biggestBottleneck}
                  onChange={(event) => setIntake({ ...intake, biggestBottleneck: event.target.value })}
                  className="min-h-24 rounded-xl border border-white/15 bg-slate-950/80 px-4 py-3 font-normal text-white"
                  placeholder="What is slowing down leads, follow-up, support, content, or operations?"
                />
              </label>

              <label className="grid gap-2 text-sm font-bold">
                Systems you already use
                <input
                  value={intake.systemsUsed}
                  onChange={(event) => setIntake({ ...intake, systemsUsed: event.target.value })}
                  className="rounded-xl border border-white/15 bg-slate-950/80 px-4 py-3 font-normal text-white"
                  placeholder="Website, Gmail, HubSpot, Stripe..."
                />
                <span className="font-normal text-slate-400">Separate systems with commas.</span>
              </label>

              <label className="grid gap-2 text-sm font-bold">
                Anything else we should know?
                <textarea
                  value={intake.notes}
                  onChange={(event) => setIntake({ ...intake, notes: event.target.value })}
                  className="min-h-20 rounded-xl border border-white/15 bg-slate-950/80 px-4 py-3 font-normal text-white"
                  placeholder="Timing, constraints, preferences, or context."
                />
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex justify-center rounded-full bg-gradient-to-r from-cyan-300 to-teal-300 px-7 py-4 font-black text-slate-950 disabled:cursor-wait disabled:opacity-60"
              >
                {submitting ? "Sending kickoff intake..." : "Send kickoff intake"}
              </button>

              {intakeStatus === "error" && (
                <p className="rounded-xl border border-rose-300/25 bg-rose-300/10 p-3 text-sm text-rose-100" role="alert">
                  {intakeMessage}
                </p>
              )}
            </form>
          )}
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-2xl font-black">What happens next</h2>
          <ol className="mt-4 space-y-3 leading-7 text-slate-300">
            <li><strong className="text-white">1.</strong> Your payment is recorded and verified.</li>
            <li><strong className="text-white">2.</strong> Your kickoff intake is attached to the Wave Starter handoff.</li>
            <li><strong className="text-white">3.</strong> We review your goal, systems, and bottleneck.</li>
            <li><strong className="text-white">4.</strong> We contact you at your checkout email to confirm scope and kickoff details.</li>
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
