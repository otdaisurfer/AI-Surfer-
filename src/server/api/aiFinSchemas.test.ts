import { describe, expect, it } from "vitest";
import { aiFinAuditStartSchema } from "./aiFinAudits";
import { aiFinHandoffSchema } from "./aiFinHandoffs";
import { aiFinLeadSchema } from "./aiFinLeads";
import { aiFinFollowUpSchema } from "./aiFinFollowUps";
import { aiFinOnboardingSchema } from "./aiFinOnboarding";

describe("AI Fin request schemas", () => {
  it("accepts an audit start with a website", () => {
    const result = aiFinAuditStartSchema.safeParse({ businessName: "Ocean Test Co", website: "https://example.com", source: "homepage_chat" });
    expect(result.success).toBe(true);
  });

  it("accepts an audit start without a website when a business identifier is provided", () => {
    const result = aiFinAuditStartSchema.safeParse({ businessName: "Ocean Test Co", businessIdentifier: "Ocean Test Co, Charleston SC", source: "ai-fin" });
    expect(result.success).toBe(true);
  });

  it("rejects an audit start with no lookup target", () => {
    const result = aiFinAuditStartSchema.safeParse({ businessName: "Ocean Test Co", source: "aeo_page" });
    expect(result.success).toBe(false);
  });

  it("requires explicit consent for lead capture", () => {
    const baseLead = { contactName: "Test Surfer", businessName: "Ocean Test Co", email: "test@example.com", primaryProblem: "We lose leads after hours.", recommendedProduct: "Sales Rider", recommendedPackage: "Wave Starter", leadStage: "HOT", urgency: "High", conversationSummary: "Needs faster lead follow-up.", source: "ai-fin" };
    expect(aiFinLeadSchema.safeParse(baseLead).success).toBe(false);
    expect(aiFinLeadSchema.safeParse({ ...baseLead, consentToFollowUp: true }).success).toBe(true);
  });

  it("requires explicit consent for human handoff", () => {
    const baseHandoff = { contactName: "Test Surfer", businessName: "Ocean Test Co", email: "test@example.com", reason: "complex_scope", recommendedProduct: "Big Kahuna", conversationSummary: "Needs several connected AI workflows.", urgency: "High" };
    expect(aiFinHandoffSchema.safeParse(baseHandoff).success).toBe(false);
    expect(aiFinHandoffSchema.safeParse({ ...baseHandoff, consentToFollowUp: true }).success).toBe(true);
  });

  it("requires explicit consent before queuing follow-up", () => {
    const baseFollowUp = { contactName: "Test Surfer", email: "test@example.com", recommendedProduct: "Sales Rider", recommendedPackage: "Wave Starter", conversationSummary: "Needs a recommendation summary and next steps.", messageType: "next_steps" };
    expect(aiFinFollowUpSchema.safeParse(baseFollowUp).success).toBe(false);
    expect(aiFinFollowUpSchema.safeParse({ ...baseFollowUp, consentToFollowUp: true }).success).toBe(true);
  });

  it("accepts a valid onboarding request", () => {
    const result = aiFinOnboardingSchema.safeParse({ contactName: "Test Surfer", businessName: "Ocean Test Co", email: "test@example.com", recommendedProduct: "Sales Rider", recommendedPackage: "Wave Starter", nextStepType: "checkout" });
    expect(result.success).toBe(true);
  });

  it("rejects an unapproved onboarding package", () => {
    const result = aiFinOnboardingSchema.safeParse({ contactName: "Test Surfer", businessName: "Ocean Test Co", email: "test@example.com", recommendedProduct: "Sales Rider", recommendedPackage: "Mystery Package", nextStepType: "checkout" });
    expect(result.success).toBe(false);
  });
});
