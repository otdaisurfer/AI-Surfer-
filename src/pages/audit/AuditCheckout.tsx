import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const AEO_WAVE_AUDIT_PAYMENT_LINK = "https://buy.stripe.com/eVq4gzaVZ350cDg5JJ4gg0a";

export default function AuditCheckout() {
  const { session } = useAuth();

  useEffect(() => {
    if (!session?.access_token) return;
    window.location.assign(AEO_WAVE_AUDIT_PAYMENT_LINK);
  }, [session?.access_token]);

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-16 text-white">
      <section className="mx-auto max-w-xl rounded-[2rem] border border-cyan-300/25 bg-slate-900/80 p-8 text-center shadow-2xl">
        <div className="text-5xl" aria-hidden="true">🌊</div>
        <h1 className="mt-4 text-3xl font-black">Opening Secure Checkout</h1>
        <p className="mt-3 text-slate-300">Connecting your $97 AEO Wave Audit to Stripe securely.</p>
        <p className="mt-4 text-sm text-slate-400">If Stripe does not open automatically, use the secure checkout button below.</p>
        <a href={AEO_WAVE_AUDIT_PAYMENT_LINK} className="mt-6 inline-flex rounded-full bg-gradient-to-r from-cyan-300 to-teal-300 px-7 py-4 font-black text-slate-950">
          Open Secure $97 Checkout
        </a>
      </section>
    </main>
  );
}
