export type AeoCategory =
  | "conversational_intent"
  | "entity_authority"
  | "technical_readiness"
  | "content_authority"
  | "ai_visibility"
  | "citation_opportunities";

export type AeoAuditQuestion = {
  id: string;
  category: AeoCategory;
  prompt: string;
  maxPoints: 3 | 4;
};

export const CATEGORY_MAX: Record<AeoCategory, number> = {
  conversational_intent: 15,
  entity_authority: 20,
  technical_readiness: 15,
  content_authority: 15,
  ai_visibility: 20,
  citation_opportunities: 15,
};

export const AEO_AUDIT_QUESTIONS: AeoAuditQuestion[] = [
  { id: "q01", category: "conversational_intent", maxPoints: 3, prompt: "Does your website clearly explain what your business does in natural customer language?" },
  { id: "q02", category: "conversational_intent", maxPoints: 3, prompt: "Does your site clearly state who your ideal customer is?" },
  { id: "q03", category: "conversational_intent", maxPoints: 3, prompt: "Do your pages answer the common questions customers ask before contacting or buying from you?" },
  { id: "q04", category: "conversational_intent", maxPoints: 3, prompt: "Do you explain the problems your products or services solve, not just list what you sell?" },
  { id: "q05", category: "conversational_intent", maxPoints: 3, prompt: "Could someone understand your main value and next step without knowing your industry jargon?" },

  { id: "q06", category: "entity_authority", maxPoints: 4, prompt: "Is your business name, address or service area, phone, and website information consistent across the web?" },
  { id: "q07", category: "entity_authority", maxPoints: 4, prompt: "Does your website clearly show who owns, leads, or represents the business and why they are credible?" },
  { id: "q08", category: "entity_authority", maxPoints: 4, prompt: "Do you display trust signals such as reviews, testimonials, certifications, awards, memberships, or case studies?" },
  { id: "q09", category: "entity_authority", maxPoints: 4, prompt: "Are your core services, specialties, locations, and business relationships described consistently across important profiles?" },
  { id: "q10", category: "entity_authority", maxPoints: 4, prompt: "Can a visitor easily verify that your business is real, active, and experienced in the area you claim?" },

  { id: "q11", category: "technical_readiness", maxPoints: 3, prompt: "Is your website mobile-friendly, secure with HTTPS, and reasonably fast to load?" },
  { id: "q12", category: "technical_readiness", maxPoints: 3, prompt: "Can search engines access and index the important pages of your website without obvious blocking issues?" },
  { id: "q13", category: "technical_readiness", maxPoints: 3, prompt: "Do your important pages use clear titles, headings, and descriptive page structure?" },
  { id: "q14", category: "technical_readiness", maxPoints: 3, prompt: "Does your site use structured data or schema where appropriate for your business, services, products, FAQs, or organization?" },
  { id: "q15", category: "technical_readiness", maxPoints: 3, prompt: "Are your key pages easy to reach through internal navigation and links rather than being isolated?" },

  { id: "q16", category: "content_authority", maxPoints: 3, prompt: "Do you publish useful information that helps customers make decisions, not only sales copy?" },
  { id: "q17", category: "content_authority", maxPoints: 3, prompt: "Do you have substantial content for each important product, service, or problem you solve?" },
  { id: "q18", category: "content_authority", maxPoints: 3, prompt: "Does your content demonstrate first-hand knowledge, experience, examples, or original insight?" },
  { id: "q19", category: "content_authority", maxPoints: 3, prompt: "Is important content reviewed and updated when your services, market, or customer questions change?" },
  { id: "q20", category: "content_authority", maxPoints: 3, prompt: "Does your content connect related questions and topics so customers can explore a subject in depth?" },

  { id: "q21", category: "ai_visibility", maxPoints: 4, prompt: "When you ask major AI assistants about businesses like yours, does your company appear or get mentioned?" },
  { id: "q22", category: "ai_visibility", maxPoints: 4, prompt: "Can an AI assistant accurately summarize what your business does, who it serves, and where it operates?" },
  { id: "q23", category: "ai_visibility", maxPoints: 4, prompt: "Does your business appear on reputable third-party websites that AI systems may use to understand your category?" },
  { id: "q24", category: "ai_visibility", maxPoints: 4, prompt: "Do your most valuable services have enough clear public information for AI systems to distinguish them from competitors?" },
  { id: "q25", category: "ai_visibility", maxPoints: 4, prompt: "If a customer asked AI why they should choose you, would there be specific public evidence supporting a confident answer?" },

  { id: "q26", category: "citation_opportunities", maxPoints: 3, prompt: "Do you publish information that is specific, useful, and factual enough to be quoted or referenced by others?" },
  { id: "q27", category: "citation_opportunities", maxPoints: 3, prompt: "Do you have original examples, case studies, data, guides, comparisons, or expert explanations others could cite?" },
  { id: "q28", category: "citation_opportunities", maxPoints: 3, prompt: "Are there reputable websites, organizations, directories, or local sources that already mention or link to your business?" },
  { id: "q29", category: "citation_opportunities", maxPoints: 3, prompt: "Do you answer narrow, high-intent questions where your expertise could become a useful source for AI-generated answers?" },
  { id: "q30", category: "citation_opportunities", maxPoints: 3, prompt: "Does your website contain clear author, business, source, or evidence signals that make important claims easier to trust?" },
];

export type AeoAuditAnswers = Record<string, number>;

export type AeoAuditScore = Record<AeoCategory, number> & {
  total_score: number;
  score_level: "Below the Surface" | "Building the Wave" | "Catching the Wave" | "Riding the Wave" | "AI Surf Ready";
  lowest_category: AeoCategory;
  strongest_category: AeoCategory;
};

function scoreLevel(total: number): AeoAuditScore["score_level"] {
  if (total <= 39) return "Below the Surface";
  if (total <= 59) return "Building the Wave";
  if (total <= 74) return "Catching the Wave";
  if (total <= 89) return "Riding the Wave";
  return "AI Surf Ready";
}

export function scoreAeoAudit(answers: AeoAuditAnswers): AeoAuditScore {
  const categoryScores: Record<AeoCategory, number> = {
    conversational_intent: 0,
    entity_authority: 0,
    technical_readiness: 0,
    content_authority: 0,
    ai_visibility: 0,
    citation_opportunities: 0,
  };

  for (const question of AEO_AUDIT_QUESTIONS) {
    const raw = Number(answers[question.id] ?? 0);
    const safe = Number.isFinite(raw) ? Math.max(0, Math.min(question.maxPoints, Math.round(raw))) : 0;
    categoryScores[question.category] += safe;
  }

  const categories = Object.keys(categoryScores) as AeoCategory[];
  const byPercent = [...categories].sort((a, b) =>
    categoryScores[a] / CATEGORY_MAX[a] - categoryScores[b] / CATEGORY_MAX[b],
  );
  const total = categories.reduce((sum, category) => sum + categoryScores[category], 0);

  return {
    ...categoryScores,
    total_score: total,
    score_level: scoreLevel(total),
    lowest_category: byPercent[0],
    strongest_category: byPercent[byPercent.length - 1],
  };
}
