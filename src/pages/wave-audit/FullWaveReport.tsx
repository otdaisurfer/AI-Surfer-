import { useMemo, useState } from "react";
import { AlertTriangle, Check, Clipboard, Download, Gauge, Target, Waves } from "lucide-react";
import { buildWaveAuditReport, formatWaveAuditReport } from "../../features/wave-audit/report";
import type { WaveAuditAnswers, WaveAuditResult } from "../../features/wave-audit/types";

interface FullWaveReportProps {
  email: string;
  submissionId: string;
  saveStatus: "saving" | "saved" | "uncertain";
  onRetrySave: () => void;
  answers: WaveAuditAnswers;
  result: WaveAuditResult;
}

type OfferId = "wave-starter" | "wave-builder" | "tsunami-growth";

type Offer = {
  id: OfferId;
  name: string;
  price: string;
  description: string;
  cta: string;
  href: string;
};

const OFFERS: Offer[] = [
  {
    id: "wave-starter",
    name: "Wave Starter",
    price: "$497",
    description: "A focused implementation sprint for one clear AI opportunity, lead leak, or repeatable workflow.",
    cta: "Buy Wave Starter",
    href: "https://buy.stripe.com/aFa8wP7JN3500Uy1tt4gg0b",
  },
  {
    id: "wave-builder",
    name: "Wave Builder",
    price: "$1,997",
    description: "Connect AI visibility, lead flow, follow-up, content, or automation into a broader growth system.",
    cta: "Book Wave Builder Strategy Call",
    href: "mailto:oceantidedropservice@gmail.com?subject=Wave%20Builder%20Strategy%20Call",
  },
  {
    id: "tsunami-growth",
    name: "Tsunami Growth",
    price: "$3,997",
    description: "Strategy plus deeper implementation when several AI systems need to work together across the customer journey.",
    cta: "Book Tsunami Growth Strategy Call",
    href: "mailto:oceantidedropservice@gmail.com?subject=Tsunami%20Growth%20Strategy%20Call",
  },
];

function recommendOffer(answers: WaveAuditAnswers): OfferId {
  if (answers.aiPriority === "multiple" || (answers.timeDrain === "multiple" && answers.lostOpportunity === "multiple")) {
    return "tsunami-growth";
  }

  if (
    answers.timeDrain === "multiple" ||
    answers.lostOpportunity === "operations" ||
    answers.aiPriority === "automation" ||
    answers.aiPriority === "marketing" ||
    answers.aiPriority === "support"
  ) {
    return "wave-builder";
  }

  return "wave-starter";
}

export default function FullWaveReport({ email, submissionId, saveStatus, onRetrySave, answers, result }: FullWaveReportProps) {
  const [copied, setCopied] = useState(false);
  const report = useMemo(() => buildWaveAuditReport(answers, result), [answers, result]);
  const reportText = useMemo(() => formatWaveAuditReport(report, submissionId, result), [report, submissionId, result]);
  const recommendedOfferId = useMemo(() => recommendOffer(answers), [answers]);

  const copyReport = async () => {
    await navigator.clipboard.writeText(reportText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const downloadReport = () => {
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ai-wave-report-${submissionId.slice(0, 8)}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const rememberOfferContext = (offer: Offer) => {
    window.sessionStorage.setItem("ai-surfer:offer-context", JSON.stringify({
      email,
      submissionId,
      offerId: offer.id,
      recommendedAgent: result.recommendedAgent,
    }));

    window.dispatchEvent(new CustomEvent("ai-surfer:funnel", {
      detail: { event: offer.id === "wave-starter" ? "checkout_start" : "strategy_call_click", offer: offer.name },
    }));
  };

  return (
    <section className="mx-auto max-w-5xl" aria-labelledby="full-wave-report-title">
      <div className="rounded-[2rem] border border-cyan-300/25 bg-slate-900/80 p-7 shadow-2xl backdrop-blur-xl md:p-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div>
            <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-cyan-300"><Waves size={18} /> Your Full AI Wave Report</div>
            <h2 id="full-wave-report-title" className="mt-3 text-4xl font-black md:text-5xl">{report.headline}</h2>
            <p className="mt-4 max-w-3xl leading-7 text-slate-300">{report.businessSnapshot}</p>
          </div>
          <div className="shrink-0 rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-5 text-center">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-200">Opportunity Score</div>
            <div className="mt-1 text-5xl font-black">{report.score}<span className="text-lg text-slate-400">/100</span></div>
            <div className="mt-1 text-sm text-slate-300">{report.opportunityLevel}</div>
          </div>
        </div>
        <div className={`mt-6 flex items-start gap-3 rounded-2xl border p-4 text-sm ${saveStatus === "saved" ? "border-emerald-300/20 bg-emerald-300/5 text-emerald-100" : "border-amber-300/25 bg-amber-300/5 text-amber-100"}`} role="status">
          {saveStatus === "saved" ? <Check className="mt-0.5 shrink-0" size={17} /> : saveStatus === "saving" ? <Waves className="mt-0.5 shrink-0 animate-pulse" size={17} /> : <AlertTriangle className="mt-0.5 shrink-0" size={17} />}
          <div>
            <div className="font-bold">{saveStatus === "saved" ? "Saved securely" : saveStatus === "saving" ? "Saving securely" : "Report unlocked—save confirmation pending"}</div>
            <div className="mt-1 opacity-80">{saveStatus === "saved" ? `Your audit is saved for ${email}.` : saveStatus === "saving" ? "Your report is already open while the receipt is confirmed in the background." : "Keep the receipt below. Your full report remains available on this screen."}</div>
            {saveStatus === "uncertain" && <button type="button" onClick={onRetrySave} className="mt-3 rounded-full border border-amber-200/40 bg-amber-100/10 px-4 py-2 font-bold text-amber-50 transition hover:bg-amber-100/20">Retry Save</button>}
          </div>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-200"><Gauge size={17} /> What this means</div><p className="mt-4 leading-7 text-slate-200">{report.diagnosis}</p></article>
          <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-200"><Target size={17} /> Priority actions</div><ol className="mt-4 space-y-3 text-sm leading-6 text-slate-200">{report.priorityActions.map((action, index) => <li key={action} className="flex gap-3"><span className="font-black text-cyan-300">{index + 1}</span><span>{action}</span></li>)}</ol></article>
        </div>
        <div className="mt-8"><div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">🌊 30-Day Wave Plan</div><div className="mt-4 grid gap-4 md:grid-cols-3">{report.plan.map((phase) => <article key={phase.window} className="rounded-3xl border border-cyan-300/15 bg-slate-950/45 p-5"><div className="text-sm font-black text-cyan-200">{phase.window}</div><h3 className="mt-2 text-xl font-black">{phase.title}</h3><p className="mt-3 text-sm leading-6 text-slate-300">{phase.action}</p></article>)}</div></div>
        {(result.revenueLeaks?.length ?? 0) > 0 && (
          <div className="mt-8">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">💰 Revenue Leak Check</div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">These are opportunity signals based on your answers. Impact is shown as High or Medium until real business data is available, so we do not invent dollar-loss estimates.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {result.revenueLeaks?.map((leak) => (
                <article key={leak.id} className="rounded-3xl border border-amber-200/15 bg-amber-100/[0.04] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-black">{leak.title}</h3>
                    <span className="rounded-full border border-amber-200/25 bg-amber-100/10 px-3 py-1 text-xs font-black text-amber-100">{leak.impact} impact</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{leak.signal}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-200"><span className="font-bold text-cyan-200">Fix:</span> {leak.recommendedFix}</p>
                  <div className="mt-4 text-xs font-bold uppercase tracking-wider text-cyan-300">{leak.recommendedAgent} · {leak.recommendedOffer}</div>
                </article>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"><div className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">📈 Signals to track</div><ul className="mt-4 space-y-3 text-sm text-slate-200">{report.metrics.map((metric) => <li key={metric} className="flex gap-2"><span aria-hidden="true">🏄</span>{metric}</li>)}</ul></article>
          <article className="rounded-3xl border border-fuchsia-300/20 bg-fuchsia-300/5 p-6"><div className="text-xs font-bold uppercase tracking-[0.16em] text-fuchsia-200">Recommended AI Surfer Agent</div><h3 className="mt-2 text-3xl font-black">{report.agent.name}</h3><p className="mt-3 text-sm leading-6 text-slate-200">{report.agent.fit}</p></article>
        </div>
        <div className="mt-8 rounded-3xl border border-amber-200/20 bg-amber-100/5 p-6"><div className="text-xs font-bold uppercase tracking-[0.16em] text-amber-200">🐚 Your practical first move</div><p className="mt-3 text-lg font-semibold leading-8">{report.firstRecommendation}</p></div>

        <div className="mt-10 rounded-[2rem] border border-cyan-300/25 bg-slate-950/55 p-6 md:p-8">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Catch Your Next Wave</div>
          <h3 className="mt-2 text-3xl font-black">Turn this report into a working AI system.</h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">Based on your answers, we highlighted the implementation level that best matches the size of the opportunity. You can still choose any option.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {OFFERS.map((offer) => {
              const recommended = offer.id === recommendedOfferId;
              return (
                <article key={offer.id} className={`relative rounded-3xl border p-5 ${recommended ? "border-cyan-300 bg-cyan-300/10 shadow-[0_0_30px_rgba(45,212,191,.12)]" : "border-white/10 bg-white/[0.03]"}`}>
                  {recommended && <div className="mb-3 inline-flex rounded-full bg-cyan-300 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-slate-950">Recommended for you</div>}
                  <h4 className="text-2xl font-black">{offer.name}</h4>
                  <div className="mt-2 text-3xl font-black text-cyan-300">{offer.price}</div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{offer.description}</p>
                  <a
                    href={offer.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => rememberOfferContext(offer)}
                    className={`mt-5 inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-center text-sm font-black ${recommended ? "bg-gradient-to-r from-cyan-300 to-teal-300 text-slate-950" : "border border-cyan-300/30 bg-cyan-300/10 text-cyan-100"}`}
                  >
                    {offer.cta}
                  </a>
                </article>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button type="button" onClick={copyReport} className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-6 py-3 font-bold text-cyan-100 hover:bg-cyan-300/15">{copied ? <Check size={17} /> : <Clipboard size={17} />}{copied ? "Copied" : "Copy Report"}</button>
          <button type="button" onClick={downloadReport} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 font-bold text-white hover:bg-white/10"><Download size={17} /> Download Report</button>
        </div>
        <p className="mt-5 break-all text-xs text-slate-500">Report receipt: {submissionId}</p>
      </div>
    </section>
  );
}
