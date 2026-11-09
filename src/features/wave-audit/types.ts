export type AuditAgent =
  | "Wave Scout"
  | "Sales Rider"
  | "Content Creator"
  | "Customer Care Cove"
  | "Automation Architect"
  | "Big Kahuna";

export type RevenueLeakId =
  | "missed-leads"
  | "slow-followup"
  | "stalled-deals"
  | "payment-followup"
  | "dormant-customers";

export type RevenueLeakImpact = "High" | "Medium";

export interface RevenueLeakFinding {
  id: RevenueLeakId;
  title: string;
  impact: RevenueLeakImpact;
  signal: string;
  recommendedFix: string;
  recommendedAgent: AuditAgent;
  recommendedOffer: "Wave Starter" | "Wave Builder" | "Tsunami Growth";
}

export interface WaveAuditAnswers {
  businessType: string;
  teamSize: string;
  timeDrain: string;
  lostOpportunity: string;
  aiPriority: string;
}

export interface WaveAuditResult {
  score: number;
  topCategory: string;
  opportunities: string[];
  recommendedAgent: AuditAgent;
  confidenceLabel: string;
  revenueLeaks: RevenueLeakFinding[];
}
