import type { AuditAgent, RevenueLeakFinding, WaveAuditAnswers, WaveAuditResult } from "./types";

const CATEGORY_LABELS: Record<string, string> = {
  leads: "Lead & Sales Follow-Up",
  operations: "Workflow Automation",
  content: "Content & Marketing",
  support: "Customer Care",
  visibility: "Opportunity Discovery",
};

const AGENT_BY_CATEGORY: Record<string, AuditAgent> = {
  leads: "Sales Rider",
  operations: "Automation Architect",
  content: "Content Creator",
  support: "Customer Care Cove",
  visibility: "Wave Scout",
};

const SCORE_BONUSES: Record<keyof WaveAuditAnswers, Record<string, number>> = {
  businessType: {
    "multi-location": 14,
    ecommerce: 10,
    service: 8,
    professional: 8,
    local: 7,
  },
  teamSize: {
    "51+": 16,
    "11-50": 12,
    "2-10": 8,
    solo: 5,
  },
  timeDrain: {
    multiple: 16,
    repetitive: 14,
    admin: 11,
    content: 10,
    support: 10,
  },
  lostOpportunity: {
    multiple: 20,
    leads: 17,
    followup: 15,
    operations: 13,
    content: 11,
    support: 10,
  },
  aiPriority: {
    multiple: 20,
    sales: 17,
    automation: 16,
    marketing: 13,
    support: 12,
    leads: 14,
  },
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function addCategoryPoints(buckets: Record<string, number>, answer: string, points: number): void {
  if (answer === "multiple") {
    Object.keys(buckets).forEach((category) => {
      buckets[category] += points;
    });
    return;
  }

  const category = answer === "followup" || answer === "sales" ? "leads" : answer;
  if (category in buckets) buckets[category] += points;
}

export function calculateWaveAuditResult(answers: WaveAuditAnswers): WaveAuditResult {
  const categories: Record<string, number> = {
    leads: 0,
    operations: 0,
    content: 0,
    support: 0,
    visibility: 0,
  };

  let score = 28;

  (Object.keys(SCORE_BONUSES) as Array<keyof WaveAuditAnswers>).forEach((key) => {
    const answer = answers[key];
    score += SCORE_BONUSES[key][answer] ?? 0;
  });

  addCategoryPoints(categories, answers.timeDrain, 8);
  addCategoryPoints(categories, answers.lostOpportunity, 12);
  addCategoryPoints(categories, answers.aiPriority, 12);

  if (answers.businessType === "multi-location") score += 4;
  if (answers.teamSize === "51+") score += 4;

  const ranked = Object.entries(categories).sort((a, b) => b[1] - a[1]);
  const [topCategoryKey, topScore] = ranked[0];
  const secondCategoryKey = ranked[1]?.[0];

  const multipleHighImpact =
    [answers.timeDrain, answers.lostOpportunity, answers.aiPriority].filter(
      (answer) => answer === "multiple",
    ).length >= 2;

  const recommendedAgent: AuditAgent = multipleHighImpact ? "Big Kahuna" : AGENT_BY_CATEGORY[topCategoryKey];
  const topCategory = multipleHighImpact ? "Multi-Area AI Transformation" : CATEGORY_LABELS[topCategoryKey];

  const opportunities = multipleHighImpact
    ? [
        "Connect multiple high-friction areas into one AI operating system.",
        "Prioritize the workflows with the clearest revenue or time-saving impact.",
      ]
    : [
        opportunityFor(topCategoryKey, answers),
        secondCategoryKey && secondCategoryKey !== topCategoryKey
          ? opportunityFor(secondCategoryKey, answers)
          : "Build a practical first automation around your highest-friction task.",
      ];

  const normalizedTop = Math.min(1, topScore / 40);
  const finalScore = clamp(Math.round(score + normalizedTop * 7));
  const confidenceLabel = finalScore >= 82 ? "High opportunity" : finalScore >= 65 ? "Strong opportunity" : "Emerging opportunity";

  return {
    score: finalScore,
    topCategory,
    opportunities: opportunities.filter(Boolean).slice(0, 2),
    recommendedAgent,
    confidenceLabel,
    revenueLeaks: detectRevenueLeaks(answers),
  };
}

function opportunityFor(category: string, answers: WaveAuditAnswers): string {
  switch (category) {
    case "leads":
      return answers.lostOpportunity === "followup"
        ? "Recover more revenue with faster, more consistent lead follow-up."
        : "Turn more incoming interest into qualified conversations and sales.\n";
    case "operations":
      return "Automate repetitive handoffs, admin, and workflow steps that drain team time.";
    case "content":
      return "Create more consistent marketing content without adding another full-time workload.";
    case "support":
      return "Reduce repetitive customer questions with faster answers and better self-service.";
    default:
      return "Spot missed opportunities and turn scattered business data into clearer next actions.";
  }
}


export function detectRevenueLeaks(answers: WaveAuditAnswers): RevenueLeakFinding[] {
  const leaks: RevenueLeakFinding[] = [];

  if (answers.lostOpportunity === "leads" || answers.lostOpportunity === "multiple") {
    leaks.push({
      id: "missed-leads",
      title: "Missed or unworked leads",
      impact: "High",
      signal: "Your answers suggest qualified opportunities may not be entering a consistent sales process.",
      recommendedFix: "Capture, qualify, and route every new lead into one follow-up workflow.",
      recommendedAgent: "Sales Rider",
      recommendedOffer: "Wave Starter",
    });
  }

  if (answers.lostOpportunity === "followup" || answers.lostOpportunity === "multiple" || answers.aiPriority === "sales") {
    leaks.push({
      id: "slow-followup",
      title: "Slow lead follow-up",
      impact: "High",
      signal: "Sales follow-up is a priority or a stated opportunity leak.",
      recommendedFix: "Trigger immediate acknowledgement, timed follow-ups, and an owner alert when a lead goes quiet.",
      recommendedAgent: "Sales Rider",
      recommendedOffer: "Wave Starter",
    });
  }

  if (answers.lostOpportunity === "operations" || answers.lostOpportunity === "multiple" || answers.aiPriority === "automation") {
    leaks.push({
      id: "stalled-deals",
      title: "Deals or quotes stuck in the pipeline",
      impact: "High",
      signal: "Manual workflows can leave opportunities waiting between stages.",
      recommendedFix: "Add stage-age alerts, automatic next-step tasks, and escalation for stalled opportunities.",
      recommendedAgent: "Automation Architect",
      recommendedOffer: "Wave Builder",
    });
  }

  if (answers.timeDrain === "repetitive" || answers.timeDrain === "multiple") {
    leaks.push({
      id: "payment-followup",
      title: "Completed work without payment follow-up",
      impact: "Medium",
      signal: "Repetitive admin can include invoice, payment, and completion follow-up that slips through the cracks.",
      recommendedFix: "Automate completion-to-invoice reminders and overdue-payment follow-up while keeping human approval for exceptions.",
      recommendedAgent: "Automation Architect",
      recommendedOffer: "Wave Builder",
    });
  }

  if (answers.aiPriority === "marketing" || answers.aiPriority === "multiple") {
    leaks.push({
      id: "dormant-customers",
      title: "Dormant customers with no reactivation",
      impact: "Medium",
      signal: "Existing customers may be an underused source of repeat business when reactivation is inconsistent.",
      recommendedFix: "Segment past customers and trigger useful, permission-aware reactivation campaigns.",
      recommendedAgent: "Content Creator",
      recommendedOffer: answers.aiPriority === "multiple" ? "Tsunami Growth" : "Wave Builder",
    });
  }

  return leaks.slice(0, 5);
}
