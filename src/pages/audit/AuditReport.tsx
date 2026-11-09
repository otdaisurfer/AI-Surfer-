import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase, supabaseAnonKey, supabaseUrl } from "../../lib/supabase";
import { getReportSellRoute } from "./reportSellRoute";

type Finding = {
  what_we_found: string;
  why_it_matters: string;
  recommended_action: string;
};

type Gap = { title: string; why_it_matters: string; first_move: string };
type Question = { question: string; question_type: string; opportunity: string };
type PlanWeek = { week: number; theme: string; actions: string[] };

type Report = {
  executive_summary: string;
  biggest_wave: string;
  category_findings: Record<string, Finding>;
  top_gaps: Gap[];
  customer_question_map: Question[];
  wave_plan: PlanWeek[];
  primary_recommendation: string;
  secondary_recommendation: string;
  recommendation_reason: string;
  lead_temperature: string;
};

type Score = {
  conversational_intent: number;
  entity_authority: number;
  technical_readiness: number;
  content_authority: number;
  ai_visibility: number;
  citation_opportunities: number;
  total_score: number;
  score_level: string;
};

const CATEGORY_META: Array<{ key: keyof Omit<Score, "total_score" | "score_level">; label: string; max: number }> = [
  { key: "conversational_intent", label: "Conversational Intent", max: 15 },
  { key: "entity_authority", label: "Entity Authority", max: 20 },
  { key: "technical_readiness", label: "Technical AI Readiness", max: 15 },
  { key: "content_authority", label: "Content Authority", max: 15 },
  { key: "ai_visibility", label: "AI Visibility", max: 20 },
  { key: "citation_opportunities", label: "Citation Opportunities", max: 15 },
];

export default function AuditReport() {
  const { orderId = "" } = useParams();
  const { session } = useAuth();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [score, setScore] = useState<Score | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session?.access_token || !orderId) return;
    let cancelled = false;

    const load = async () => {
      try {
        const { data: scoreData, error: scoreError } = await supabase
          .from("aeo_audit_scores")
          .select("conversational_intent,entity_authority,technical_readiness,content_authority,ai_visibility,citation_opportunities,total_score,score_level")
          .eq("audit_order_id", orderId)
          .maybeSingle();
        if (scoreError || !scoreData) throw new Error("Your completed audit score could not be loaded.");

        const response = await fetch(`${supabaseUrl}/functions/v1/aeo-audit-report`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ audit_order_id: orderId }),
        });
        const payload = await response.json() as { ok?: boolean; error?: string; report?: Report };
        if (!response.ok || !payload.ok || !payload.report) throw new Error(payload.error || "AI Fin could not build your report yet.");

        if (cancelled) return;
        setScore(scoreData as Score);
        setReport(payload.report);
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Your AEO Wave Audit could not be loaded.");
        setStatus("error");
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [orderId, session?.access_token]);

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-slate-950 px-5 py-16 text-white">
        <section className="mx-auto max-w-3xl rounded-[2rem] border border-cyan-300/25 bg-slate-900/80 p-8 text-center shadow-2xl">
          <div className="text-6xl" aria-hidden="true">🐬</div>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-cyan-300">AI Fin Analysis</p>
          <h1 className="mt-3 text-4xl font-black">Building Your AEO Wave Audit</h1>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-300">AI Fin is turning your score into a practical plan, including your Biggest Wave, top gaps, Customer Question Map, and 30-Day Wave Plan.</p>
          <div className="mx-auto mt-8 h-2 max-w-md overflow-hidden rounded-full bg-slate-800"><div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-cyan-300 via-blue-300 to-pink-300" /></div>
        </section>
      </main>
    );
  }

  if (status === "error" || !score || !report) {
    return (
      <main className="min-h-screen bg-slate-950 px-5 py-16 text-white">
        <section className="mx-auto max-w-2xl rounded-[2rem] border border-rose-300/25 bg-slate-900/80 p-8 text-center">
          <div className="text-5xl">🌊</div>
          <h1 className="mt-4 text-3xl font-black">Your Report Hit a Rough Wave</h1>
          <p className="mt-4 text-rose-100">{error}</p>
          <button type="button" onClick={() => window.location.reload()} className="mt-7 rounded-full bg-white px-6 py-3 font-black text-slate-950">Try Again</button>
        </section>
      </main>
    );
  }

  const sellRoute = getReportSellRoute(report.primary_recommendation);

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-[2rem] border border-cyan-300/25 bg-gradient-to-br from-slate-900 to-slate-950 p-7 shadow-2xl md:p-10">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Your AEO Wave Audit</p>
            <div className="mx-auto mt-5 flex h-40 w-40 items-center justify-center rounded-full border-4 border-cyan-300/70 bg-cyan-300/10 shadow-[0_0_45px_rgba(103,232,249,0.15)]">
              <div><div className="text-5xl font-black">{score.total_score}</div><div className="text-sm text-cyan-100">/100</div></div>
            </div>
            <h1 className="mt-5 text-3xl font-black md:text-4xl">{score.score_level}</h1>
            <p className="mx-auto mt-4 max-w-3xl leading-7 text-slate-300">{report.executive_summary}</p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-pink-300/25 bg-pink-300/5 p-7 md:p-9">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-pink-200">Your Biggest Wave</p>
          <h2 className="mt-3 text-3xl font-black">🌊 {report.biggest_wave}</h2>
        </section>

        <section>
          <h2 className="text-2xl font-black">Your Six AEO Dimensions</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {CATEGORY_META.map(({ key, label, max }) => {
              const finding = report.category_findings[key];
              return (
                <article key={key} className="rounded-3xl border border-white/10 bg-slate-900/75 p-5">
                  <div className="flex items-start justify-between gap-3"><h3 className="font-black text-cyan-100">{label}</h3><span className="rounded-full bg-cyan-300/10 px-3 py-1 text-sm font-bold text-cyan-200">{score[key]}/{max}</span></div>
                  {finding && <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300"><p><strong className="text-white">What we found:</strong> {finding.what_we_found}</p><p><strong className="text-white">Why it matters:</strong> {finding.why_it_matters}</p><p><strong className="text-white">Next move:</strong> {finding.recommended_action}</p></div>}
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-7 md:p-9">
          <h2 className="text-2xl font-black">Your Top 3 Visibility Gaps</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {report.top_gaps.map((gap, index) => <article key={`${gap.title}-${index}`} className="rounded-2xl bg-slate-950/70 p-5"><div className="text-2xl font-black text-cyan-300">0{index + 1}</div><h3 className="mt-2 font-black">{gap.title}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{gap.why_it_matters}</p><p className="mt-3 text-sm leading-6 text-cyan-100"><strong>First move:</strong> {gap.first_move}</p></article>)}
          </div>
        </section>

        <section className="rounded-[2rem] border border-cyan-300/20 bg-cyan-300/5 p-7 md:p-9">
          <h2 className="text-2xl font-black">10-Question Customer Question Map</h2>
          <p className="mt-2 text-slate-400">Natural-language questions your business can use as AEO content opportunities.</p>
          <div className="mt-5 space-y-3">
            {report.customer_question_map.map((item, index) => <article key={`${item.question}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4"><div className="flex gap-4"><span className="font-black text-cyan-300">{index + 1}.</span><div><h3 className="font-bold">{item.question}</h3><p className="mt-2 text-sm text-slate-400">{item.opportunity}</p><span className="mt-2 inline-block rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-wider text-slate-400">{item.question_type}</span></div></div></article>)}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black">Your 30-Day Wave Plan</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {report.wave_plan.map((week) => <article key={week.week} className="rounded-3xl border border-white/10 bg-slate-900/75 p-5"><p className="text-xs font-black uppercase tracking-wider text-pink-200">Week {week.week}</p><h3 className="mt-2 text-xl font-black">{week.theme}</h3><ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">{week.actions.map((action) => <li key={action}>✓ {action}</li>)}</ul></article>)}
          </div>
        </section>

        <section className="rounded-[2rem] border border-emerald-300/25 bg-emerald-300/5 p-7 text-center md:p-10">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-200">Recommended Next Solution</p>
          <h2 className="mt-3 text-3xl font-black">{report.primary_recommendation}</h2>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-300">{report.recommendation_reason}</p>
          {report.secondary_recommendation && <p className="mt-3 text-sm text-slate-400">Also worth exploring: <strong className="text-white">{report.secondary_recommendation}</strong></p>}
          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-emerald-100/80">AI Fin picked this as your strongest next move based on the audit. Start here instead of trying to fix everything at once.</p>
          <Link to={sellRoute.path} className="mt-7 inline-flex rounded-full bg-gradient-to-r from-cyan-300 via-blue-300 to-pink-300 px-7 py-4 font-black text-slate-950">{sellRoute.cta} 🌊</Link>
        </section>
      </div>
    </main>
  );
}
