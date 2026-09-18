import type { WaveAuditAnswers, WaveAuditResult } from "./types";

export interface WaveAuditReportPhase {
  window: string;
  title: string;
  action: string;
}

export interface WaveAuditReport {
  score: number;
  opportunityLevel: string;
  headline: string;
  businessSnapshot: string;
  diagnosis: string;
  priorityActions: string[];
  plan: WaveAuditReportPhase[];
  metrics: string[];
  agent: {
    name: string;
    fit: string;
  };
  firstRecommendation: string;
}

type ReportPlaybook = Pick<
  WaveAuditReport,
  "diagnosis" | "plan" | "metrics" | "firstRecommendation"
>;

const BUSINESS_LABELS: Record<string, string> = {
  service: "service business",
  local: "local business",
  ecommerce: "e-commerce business",
  "multi-location": "multi-location business",
};

const TEAM_LABELS: Record<string, string> = {
  solo: "solo",
  "2-10": "2–10 person",
  "11-50": "11–50 person",
  "51+": "51+ person",
};

const AGENT_FIT: Record<string, string> = {
  "Wave Scout": "Finds overlooked opportunities and turns scattered signals into a focused next move.",
  "Sales Rider": "Helps respond to leads faster, organize follow-up, and move more conversations toward a sale.",
  "Content Creator": "Builds a repeatable content current so marketing stays consistent without swallowing the week.",
  "Customer Care Cove": "Creates faster, more consistent answers for routine customer questions and service requests.",
  "Automation Architect": "Connects repetitive steps and handoffs into practical workflows that save time.",
  "Big Kahuna": "Coordinates a multi-area AI transformation when several major opportunities need one strategy.",
};

const PLAYBOOKS: Record<string, ReportPlaybook> = {
  "Lead & Sales Follow-Up": {
    diagnosis: "Interest is reaching the shoreline, but slow or inconsistent follow-up can let qualified buyers drift away before a real conversation begins.",
    firstRecommendation: "Start with an automatic first response that acknowledges every new lead, asks one qualifying question, and creates a clear human follow-up task.",
    plan: [
      { window: "Days 1–7", title: "Map the lead current", action: "List every place a lead arrives, who owns the response, and where conversations currently stall." },
      { window: "Days 8–14", title: "Launch the first-response wave", action: "Connect one lead source to an immediate reply, simple qualification, and a visible follow-up queue." },
      { window: "Days 15–30", title: "Tune for conversions", action: "Review response and conversion data weekly, then improve timing, questions, and handoffs." },
    ],
    metrics: ["Lead response time", "Qualified conversations started", "Follow-up conversion rate"],
  },
  "Workflow Automation": {
    diagnosis: "Repetitive work and manual handoffs are creating drag. The first win is one dependable workflow that returns time without disrupting the business.",
    firstRecommendation: "Choose the highest-frequency manual task and automate its intake, routing, and completion notice before expanding to a second workflow.",
    plan: [
      { window: "Days 1–7", title: "Find the time leak", action: "Track repeated tasks for one week and rank them by frequency, effort, and business impact." },
      { window: "Days 8–14", title: "Build one clean workflow", action: "Automate the safest high-value sequence with a clear owner and a manual fallback." },
      { window: "Days 15–30", title: "Measure and expand", action: "Confirm time saved and error reduction, then connect the next related handoff." },
    ],
    metrics: ["Hours of manual work removed", "Workflow completion time", "Handoff error rate"],
  },
  "Content & Marketing": {
    diagnosis: "Marketing demand is outrunning available time. A repeatable content system can turn one strong idea into consistent, channel-ready material.",
    firstRecommendation: "Create one weekly source piece and use AI to reshape it into an email, social posts, and a customer-question answer.",
    plan: [
      { window: "Days 1–7", title: "Choose the message current", action: "Collect the ten questions customers ask most and select one clear weekly theme." },
      { window: "Days 8–14", title: "Build the reuse system", action: "Create a reviewable workflow that turns each source idea into several channel-specific assets." },
      { window: "Days 15–30", title: "Publish and learn", action: "Ship consistently, track meaningful engagement, and strengthen the themes that create conversations." },
    ],
    metrics: ["Content pieces published", "Qualified engagement", "Content-assisted leads"],
  },
  "Customer Care": {
    diagnosis: "Routine questions are consuming attention that should stay available for complex customer needs and relationship-building.",
    firstRecommendation: "Start with the ten most common questions and create approved answers with a clear path to a human whenever confidence is low.",
    plan: [
      { window: "Days 1–7", title: "Chart common questions", action: "Group recent customer requests by topic, urgency, and the best approved response." },
      { window: "Days 8–14", title: "Open the care cove", action: "Launch guided answers for one channel with clear escalation rules and response ownership." },
      { window: "Days 15–30", title: "Improve the experience", action: "Review unresolved questions and customer feedback, then expand the approved answer library." },
    ],
    metrics: ["First-response time", "Questions resolved without handoff", "Customer satisfaction"],
  },
  "Multi-Area AI Transformation": {
    diagnosis: "Several high-impact areas are competing for attention. The opportunity is large, but sequencing matters more than adding disconnected tools.",
    firstRecommendation: "Select one revenue workflow and one time-saving workflow, define success for each, and connect them through a single 30-day operating plan.",
    plan: [
      { window: "Days 1–7", title: "Set the transformation map", action: "Rank opportunities by revenue impact, time savings, risk, and ease of implementation." },
      { window: "Days 8–14", title: "Launch the lead wave", action: "Deploy the highest-confidence workflow with ownership, safeguards, and a manual fallback." },
      { window: "Days 15–30", title: "Connect the system", action: "Measure the first workflow, document lessons, and connect the next priority without duplicating data." },
    ],
    metrics: ["Revenue opportunities advanced", "Hours returned to the team", "Workflow adoption rate"],
  },
  "Opportunity Discovery": {
    diagnosis: "The biggest constraint is visibility into where AI can create a measurable business win. A focused discovery sprint will prevent random tool adoption.",
    firstRecommendation: "Inventory customer questions, repeated internal work, and missed sales signals, then score each opportunity by value and feasibility.",
    plan: [
      { window: "Days 1–7", title: "Gather the signals", action: "Collect recurring customer questions, bottlenecks, and missed opportunities from the last month." },
      { window: "Days 8–14", title: "Rank the waves", action: "Score each use case for business impact, effort, data readiness, and operational risk." },
      { window: "Days 15–30", title: "Prove one use case", action: "Run a small measured pilot and use the evidence to choose the next investment." },
    ],
    metrics: ["Opportunities identified", "Pilot time to value", "Measured business impact"],
  },
};

const DEFAULT_PLAYBOOK = PLAYBOOKS["Opportunity Discovery"];

export function buildWaveAuditReport(
  answers: WaveAuditAnswers,
  result: WaveAuditResult,
): WaveAuditReport {
  const playbook = PLAYBOOKS[result.topCategory] ?? DEFAULT_PLAYBOOK;
  const business = BUSINESS_LABELS[answers.businessType] ?? "business";
  const team = TEAM_LABELS[answers.teamSize] ?? "growing";

  return {
    score: result.score,
    opportunityLevel: result.confidenceLabel,
    headline: `Your Biggest Wave: ${result.topCategory}`,
    businessSnapshot: `Your ${team} ${business} has a ${result.confidenceLabel.toLowerCase()} for practical AI improvement, led by ${result.topCategory.toLowerCase()}.`,
    diagnosis: playbook.diagnosis,
    priorityActions: [...result.opportunities, playbook.firstRecommendation].slice(0, 3),
    plan: playbook.plan,
    metrics: playbook.metrics,
    agent: {
      name: result.recommendedAgent,
      fit: AGENT_FIT[result.recommendedAgent] ?? AGENT_FIT["Wave Scout"],
    },
    firstRecommendation: playbook.firstRecommendation,
  };
}

export function formatWaveAuditReport(report: WaveAuditReport, submissionId: string, result?: WaveAuditResult): string {
  const priorities = report.priorityActions.map((action, index) => `${index + 1}. ${action}`).join("\n");
  const plan = report.plan
    .map((phase) => `${phase.window} — ${phase.title}\n${phase.action}`)
    .join("\n\n");
  const metrics = report.metrics.map((metric) => `• ${metric}`).join("\n");
  const revenueLeaks = (result?.revenueLeaks ?? [])
    .map((leak) => `• ${leak.title} — ${leak.impact} impact\n  Signal: ${leak.signal}\n  Fix: ${leak.recommendedFix}\n  ${leak.recommendedAgent} · ${leak.recommendedOffer}`)
    .join("\n\n");
  const revenueLeakSection = revenueLeaks ? `\n\nREVENUE LEAK CHECK\n${revenueLeaks}` : "";

  return `OCEAN TIDE DROP AI SURFER — AI WAVE REPORT

AI Opportunity Score: ${report.score}/100 (${report.opportunityLevel})
${report.headline}

BUSINESS SNAPSHOT
${report.businessSnapshot}

WHAT THIS MEANS
${report.diagnosis}

PRIORITY ACTIONS
${priorities}

30-DAY WAVE PLAN
${plan}

SIGNALS TO TRACK
${metrics}

RECOMMENDED AI SURFER AGENT
${report.agent.name}: ${report.agent.fit}

FIRST RECOMMENDATION
${report.firstRecommendation}

Receipt: ${submissionId}`;
}
