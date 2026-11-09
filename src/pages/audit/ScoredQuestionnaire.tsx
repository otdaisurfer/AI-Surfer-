import { AEO_AUDIT_QUESTIONS, AeoCategory } from "../../features/aeo-audit/scoring";

type Props = {
  answers: Record<string, number>;
  onChange: (questionId: string, score: number) => void;
};

const SECTIONS: Array<{ category: AeoCategory; title: string; subtitle: string }> = [
  { category: "conversational_intent", title: "Conversational Intent", subtitle: "How clearly your business answers real customer questions." },
  { category: "entity_authority", title: "Entity Authority", subtitle: "How confidently your business identity and credibility can be verified." },
  { category: "technical_readiness", title: "Technical AI Readiness", subtitle: "Whether your site structure gives search and AI systems a clean foundation." },
  { category: "content_authority", title: "Content Authority", subtitle: "How useful, complete, current, and experience-backed your content is." },
  { category: "ai_visibility", title: "AI Visibility", subtitle: "How much public evidence exists for AI systems to understand and mention you." },
  { category: "citation_opportunities", title: "Citation Opportunities", subtitle: "How cite-worthy and referenceable your business information is." },
];

function optionLabel(score: number, max: number) {
  if (score === 0) return "Not yet";
  if (max === 4) return ["", "Limited", "Partial", "Strong", "Excellent"][score];
  return ["", "A little", "Mostly", "Strong"][score];
}

export default function ScoredQuestionnaire({ answers, onChange }: Props) {
  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-cyan-300/25 bg-cyan-300/5 p-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">100-Point AEO Assessment</p>
        <h2 className="mt-2 text-2xl font-black text-white">Now Score Your AI Search Readiness</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">Choose the answer that best describes your business today. Your raw score is calculated consistently from these 30 answers. AI Fin interprets the results later, but does not change the score.</p>
      </div>

      {SECTIONS.map((section) => {
        const questions = AEO_AUDIT_QUESTIONS.filter((question) => question.category === section.category);
        return (
          <section key={section.category} className="rounded-3xl border border-white/10 bg-slate-950/45 p-5 md:p-6">
            <h3 className="text-xl font-black text-cyan-100">{section.title}</h3>
            <p className="mt-1 text-sm text-slate-400">{section.subtitle}</p>
            <div className="mt-5 space-y-6">
              {questions.map((question, index) => (
                <fieldset key={question.id} data-aeo-question={question.id} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                  <legend className="px-1 font-bold leading-6 text-slate-100">{index + 1}. {question.prompt}</legend>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                    {Array.from({ length: question.maxPoints + 1 }, (_, score) => (
                      <label key={score} className={`cursor-pointer rounded-xl border px-3 py-3 text-center text-sm font-bold transition ${answers[question.id] === score ? "border-cyan-300 bg-cyan-300/15 text-cyan-100" : "border-white/10 bg-slate-950/60 text-slate-300 hover:border-cyan-300/40"}`}>
                        <input
                          required
                          className="sr-only"
                          type="radio"
                          name={question.id}
                          value={score}
                          checked={answers[question.id] === score}
                          onChange={() => onChange(question.id, score)}
                        />
                        <span className="block">{optionLabel(score, question.maxPoints)}</span>
                        <span className="mt-1 block text-xs font-medium text-slate-500">{score}/{question.maxPoints}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
