export type AiFinProduct =
  | "AEO Wave Audit"
  | "Wave Scout"
  | "Sales Rider"
  | "Content Creator"
  | "Customer Care Cove"
  | "Automation Architect"
  | "Big Kahuna";

export type AiFinPackage =
  | "Wave Starter"
  | "Wave Builder"
  | "Tsunami Growth"
  | "Needs Human Review";

export type LeadStage = "COLD" | "WARM" | "HOT" | "SURF'S UP";
export type LeadUrgency = "Low" | "Normal" | "High" | "Immediate";

export interface AiFinLeadInput {
  contactName: string;
  businessName: string;
  email: string;
  phone?: string | null;
  website?: string | null;
  industry?: string | null;
  primaryProblem: string;
  secondaryProblem?: string | null;
  currentProcess?: string | null;
  desiredOutcome?: string | null;
  recommendedProduct: AiFinProduct;
  recommendedPackage?: AiFinPackage | null;
  leadStage: LeadStage;
  urgency: LeadUrgency;
  systemsUsed?: string[];
  conversationSummary: string;
  source?: string;
  consentToFollowUp: true;
}

export interface AiFinAuditStartInput {
  businessName: string;
  website?: string | null;
  businessIdentifier?: string | null;
  contactName?: string | null;
  email?: string | null;
  source?:
    | "homepage_chat"
    | "aeo_page"
    | "pricing_page"
    | "product_page"
    | "other"
    | "ai-fin";
}

export interface AiFinHandoffInput {
  leadId?: string | null;
  contactName: string;
  businessName: string;
  email: string;
  phone?: string | null;
  website?: string | null;
  reason:
    | "custom_pricing"
    | "complex_scope"
    | "enterprise"
    | "regulated_industry"
    | "legal_or_contract_question"
    | "uncertain_scope"
    | "visitor_requested_person"
    | "other";
  recommendedProduct?: string | null;
  conversationSummary: string;
  urgency: "Normal" | "High" | "Immediate";
  consentToFollowUp: true;
}

export interface AiFinFollowUpInput {
  leadId?: string | null;
  contactName: string;
  email: string;
  recommendedProduct: string;
  recommendedPackage?: string | null;
  conversationSummary: string;
  messageType:
    | "recommendation_summary"
    | "next_steps"
    | "human_review_confirmation";
  consentToFollowUp: true;
}

export interface AiFinOnboardingInput {
  leadId?: string | null;
  contactName: string;
  businessName: string;
  email: string;
  recommendedProduct: string;
  recommendedPackage: "Wave Starter" | "Wave Builder" | "Tsunami Growth";
  nextStepType: "checkout" | "booking" | "intake_form" | "human_review";
}

export interface LaunchBrief {
  productBrief: string;
  audience: string;
  launchDate: string;
  constraints?: string;
  assets?: string;
  channels: string[];
}

type ApiClientOptions = {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
};

export class AiSurferApiClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? "").replace(/\/$/, "");
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  private async json<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        body && typeof body === "object" && "message" in body
          ? String((body as { message?: unknown }).message)
          : `AI SURFER API request failed with status ${response.status}`;
      throw new Error(message);
    }

    return body as T;
  }

  health() {
    return this.json<{
      status: string;
      service: string;
      openaiConfigured: boolean;
      supabaseConfigured: boolean;
    }>("/health");
  }

  saveLead(input: AiFinLeadInput) {
    return this.json<{
      ok: true;
      status: "saved";
      leadId: string;
      nextAction: "begin_onboarding" | "human_review" | "follow_up";
    }>("/api/ai-fin/leads", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  startAudit(input: AiFinAuditStartInput) {
    return this.json<{
      ok: true;
      status: "started";
      auditId: string;
      nextStep: "complete_aeo_audit";
    }>("/api/ai-fin/audit/start", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  requestHandoff(input: AiFinHandoffInput) {
    return this.json<{
      ok: true;
      status: "queued";
      reviewId: string;
      priority: "Normal" | "High" | "Immediate";
    }>("/api/ai-fin/handoff", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  queueFollowUp(input: AiFinFollowUpInput) {
    return this.json<{
      ok: true;
      status: "queued";
      messageId: string;
    }>("/api/ai-fin/follow-up", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  startOnboarding(input: AiFinOnboardingInput) {
    return this.json<{
      ok: true;
      status: "ready" | "waiting_configuration";
      onboardingId: string;
      nextStepType: AiFinOnboardingInput["nextStepType"];
      checkoutStatus: "ready" | "configuration_required" | "not_requested";
      url: null;
      requiresConfiguration: boolean;
      checkoutConfiguration:
        | {
            stripeSecretConfigured: boolean;
            packagePriceConfigured: boolean;
            requiredPriceEnvironmentVariable: string;
          }
        | null;
    }>("/api/ai-fin/onboarding", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async *streamLaunchPlan(input: LaunchBrief): AsyncGenerator<unknown, void, void> {
    const response = await this.fetchImpl(`${this.baseUrl}/api/launch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Launch Desk request failed with status ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";

      for (const frame of frames) {
        const line = frame
          .split("\n")
          .find((part) => part.startsWith("data: "));
        if (!line) continue;

        yield JSON.parse(line.slice(6));
      }
    }
  }
}

export const aiSurferApi = new AiSurferApiClient();
