import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import OceanBackground from "../../components/landing/OceanBackground";
import SunriseGlow from "../../components/landing/SunriseGlow";
import BioluminescentParticles from "../../components/landing/BioluminescentParticles";
import Navbar from "../../components/landing/Navbar";
import { calculateWaveAuditResult } from "../../features/wave-audit/scoring";
import { saveWaveAuditLead } from "../../features/wave-audit/leadCapture";
import type { WaveAuditAnswers } from "../../features/wave-audit/types";
import FullWaveReport from "./FullWaveReport";

type Question = {
  key: keyof WaveAuditAnswers;
  question: string;
  options: { value: string; label: string; description: string }[];
};

const QUESTIONS: Question[] = [
  { key: "businessType", question: "What type of business do you run?", options: [
    { value: "service", label: "Service business", description: "Agencies, contractors, consulting, professional services" },
    { value: "local", label: "Local business", description: "Retail, restaurant, salon, home services and more" },
    { value: "ecommerce", label: "E-commerce", description: "Online store or product-based business" },
    { value: "multi-location", label: "Multi-location", description: "Several teams, branches, or locations" },
  ] },
  { key: "teamSize", question: "How big is your team?", options: [
    { value: "solo", label: "Just me", description: "Founder or solo operator" },
    { value: "2-10", label: "2–10 people", description: "Small team with multiple hats" },
    { value: "11-50", label: "11–50 people", description: "Growing operation" },
    { value: "51+", label: "51+ people", description: "Larger team or organization" },
  ] },
  { key: "timeDrain", question: "What takes up the most time every week?", options: [
    { value: "repetitive", label: "Repetitive admin", description: "Copying, updating, sorting, reporting, handoffs" },
    { value: "support", label: "Customer questions", description: "FAQs, support requests, status updates" },
    { value: "content", label: "Marketing content", description: "Posts, emails, campaigns, creative production" },
    { value: "multiple", label: "A little of everything", description: "Several recurring tasks are eating the week" },
  ] },
  { key: "lostOpportunity", question: "Where are you losing the most opportunities?", options: [
    { value: "leads", label: "Finding new leads", description: "Not enough qualified opportunities coming in" },
    { value: "followup", label: "Following up", description: "Good leads go quiet or wait too long" },
    { value: "operations", label: "Internal workflows", description: "Slow processes and manual bottlenecks" },
    { value: "multiple", label: "Several areas", description: "More than one major leak needs attention" },
  ] },
  { key: "aiPriority", question: "What would you most like AI to improve first?", options: [
    { value: "sales", label: "Sales & follow-up", description: "Respond faster and convert more opportunities" },
    { value: "automation", label: "Automation", description: "Remove repetitive work and connect systems" },
    { value: "marketing", label: "Marketing & content", description: "Create and distribute better content" },
    { value: "support", label: "Customer care", description: "Answer routine questions and improve service" },
    { value: "multiple", label: "A full AI makeover", description: "Several areas could benefit at once" },
  ] },
];

const EMPTY_ANSWERS: WaveAuditAnswers = { businessType: "", teamSize: "", timeDrain: "", lostOpportunity: "", aiPriority: "" };

export default function WaveAudit() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<WaveAuditAnswers>(EMPTY_ANSWERS);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState("");
  const [saveStatus, setSaveStatus] = useState<"saving" | "saved" | "uncertain">("saving");
  const [saveError, setSaveError] = useState("");

  const result = useMemo(() => Object.values(answers).every(Boolean) ? calculateWaveAuditResult(answers) : null, [answers]);
  const currentQuestion = QUESTIONS[step];
  const selectedValue = answers[currentQuestion.key];

  const choose = (value: string) => {
    setAnswers((current) => ({ ...current, [currentQuestion.key]: value }));
    if (step < QUESTIONS.length - 1) window.setTimeout(() => setStep((current) => current + 1), 180);
  };

  const persistLead = async (receipt: string) => {
    if (!result || !email.trim()) return false;
    setSaveStatus("saving");
    setSaveError("");
    try {
      const saved = await saveWaveAuditLead({ email, answers, result, source: "wave-audit", submissionId: receipt });
      setSaveStatus(saved.status);
      if (saved.status !== "saved") {
        setSaveError("We couldn't confirm your report was saved. Please try again so we don't lose your Wave Check.");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Wave Audit save failed:", error);
      setSaveStatus("uncertain");
      setSaveError("We couldn't save your report yet. Please try again.");
      return false;
    }
  };

  const submitLead = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!result || !email.trim() || submitting) return;
    setSubmitting(true);
    const receipt = submissionId || globalThis.crypto.randomUUID();
    setSubmissionId(receipt);

    const saved = await saveWaveAuditLead({ email, answers, result, source: "wave-audit", submissionId: receipt });
    setSaveStatus(saved.status);

    if (saved.status === "saved") {
      setSaveError("");
      setSubmitted(true);
    } else {
      setSaveError("We couldn't confirm your report was saved. Please try again so we don't lose your Wave Check.");
    }
    setSubmitting(false);
  };

  const retryLeadSave = async () => {
    if (!submissionId) return;
    setSubmitting(true);
    const saved = await persistLead(submissionId);
    if (saved) setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-slate-950 text-white">
      <OceanBackground />
      <SunriseGlow />
      <BioluminescentParticles />
      <Navbar />
      <div className="relative z-10 mx-auto max-w-6xl px-5 pb-20 pt-32 md:px-8">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-200 backdrop-blur"><Sparkles size={14} /> AI Wave Audit</div>
          <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-black tracking-tight md:text-6xl">See where your business can catch a bigger AI wave.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">Answer five quick business questions. Get an instant AI Opportunity Score™ and a practical first recommendation.</p>
        </div>

        {!result ? (
          <section className="relative z-20 isolate mx-auto max-w-3xl rounded-[2rem] border border-cyan-300/20 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-xl md:p-9" aria-labelledby="audit-question">
            <div className="mb-7 flex items-center justify-between gap-4 text-sm">
              <span className="font-semibold text-slate-300">Question {step + 1} of {QUESTIONS.length}</span>
              <div className="h-2 w-40 overflow-hidden rounded-full bg-slate-800" aria-hidden="true"><div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-teal-300 transition-all" style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} /></div>
            </div>
            <h2 id="audit-question" className="text-3xl font-black md:text-4xl">{currentQuestion.question}</h2>
            <div className="relative z-20 mt-7 grid gap-3">
              {currentQuestion.options.map((option) => {
                const active = selectedValue === option.value;
                return <button key={option.value} type="button" onClick={() => choose(option.value)} className={`relative z-20 w-full touch-manipulation cursor-pointer rounded-2xl border p-5 text-left transition ${active ? "border-cyan-300 bg-cyan-300/10 shadow-[0_0_24px_rgba(45,212,191,.14)]" : "border-white/10 bg-white/[0.03] hover:border-cyan-300/35 hover:bg-cyan-300/5"}`} aria-pressed={active}>
                  <div className="flex items-start gap-3"><div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${active ? "border-cyan-300 bg-cyan-300 text-slate-950" : "border-white/20"}`}>{active && <Check size={14} />}</div><div><div className="font-bold">{option.label}</div><div className="mt-1 text-sm leading-6 text-slate-400">{option.description}</div></div></div>
                </button>;
              })}
            </div>
            {step === QUESTIONS.length - 1 && selectedValue && <button type="button" onClick={() => setAnswers((current) => ({ ...current, aiPriority: selectedValue }))} className="relative z-20 mt-5 w-full touch-manipulation rounded-full bg-cyan-300 px-5 py-4 font-bold text-slate-950">See my AI Opportunity Score</button>}
            {step > 0 && <button type="button" onClick={() => setStep((current) => current - 1)} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white"><ArrowLeft size={16} /> Back</button>}
          </section>
        ) : submitted ? (
          <FullWaveReport email={email.trim().toLowerCase()} submissionId={submissionId} saveStatus={saveStatus} onRetrySave={() => void retryLeadSave()} answers={answers} result={result} />
        ) : (
          <section className="mx-auto max-w-4xl">
            <div className="grid gap-6 md:grid-cols-[.8fr_1.2fr]">
              <div className="rounded-[2rem] border border-cyan-300/20 bg-slate-900/75 p-7 shadow-2xl backdrop-blur-xl md:p-9">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">AI Opportunity Score™</div>
                <div className="mt-4 flex items-end gap-2"><div className="text-7xl font-black">{result.score}</div><div className="pb-2 text-slate-400">/100</div></div>
                <p className="mt-3 text-sm leading-6 text-slate-400">A practical estimate based on the answers you provided, not a scientific measurement.</p>
                <div className="mt-6 rounded-2xl border border-amber-200/20 bg-amber-100/5 p-4"><div className="text-xs uppercase tracking-wider text-amber-200">Opportunity level</div><div className="mt-1 text-lg font-bold">{result.confidenceLabel}</div></div>
              </div>
              <div className="rounded-[2rem] border border-cyan-300/20 bg-slate-900/75 p-7 shadow-2xl backdrop-blur-xl md:p-9">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Your teaser Wave Map</div>
                <h2 className="mt-3 text-3xl font-black">Your Biggest Wave: {result.topCategory}</h2>
                <div className="mt-6 space-y-3">{result.opportunities.map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-slate-200">{item}</div>)}</div>
                <div className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-5"><div className="text-xs uppercase tracking-wider text-cyan-200">Recommended AI Surfer Agent</div><div className="mt-1 text-2xl font-black">{result.recommendedAgent}</div></div>
              </div>
            </div>
            <div className="mt-6 rounded-[2rem] border border-white/10 bg-slate-900/80 p-7 shadow-2xl backdrop-blur-xl md:p-9">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">Unlock the full report</div>
              <h2 className="mt-2 text-3xl font-black">Open my full AI Wave Report</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Enter your email to open the complete report immediately, including your 30-day Wave Plan, practical first move, and the AI Surfer service that fits your biggest opportunity.</p>
              <form onSubmit={submitLead} className="mt-6 flex flex-col gap-3 sm:flex-row">
                <label className="sr-only" htmlFor="wave-audit-email">Email address</label>
                <input id="wave-audit-email" name="email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@yourbusiness.com" className="min-w-0 flex-1 rounded-full border border-white/15 bg-slate-950/70 px-5 py-4 text-white outline-none transition focus:border-cyan-300" />
                <button disabled={submitting} type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-300 to-teal-300 px-6 py-4 font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-70">{submitting ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}{submitting ? "Saving..." : "Open My Full AI Wave Report"}</button>
              </form>
              {saveError && <p role="alert" className="mt-4 rounded-2xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-sm font-semibold text-amber-100">{saveError}</p>}
              <p className="mt-4 text-xs text-slate-500">Your full report opens after we confirm your Wave Check is saved securely.</p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
