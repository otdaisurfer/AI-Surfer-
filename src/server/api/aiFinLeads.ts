import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const approvedProducts = [
  "AEO Wave Audit",
  "Wave Scout",
  "Sales Rider",
  "Content Creator",
  "Customer Care Cove",
  "Automation Architect",
  "Big Kahuna",
] as const;

const approvedPackages = [
  "Wave Starter",
  "Wave Builder",
  "Tsunami Growth",
  "Needs Human Review",
] as const;

export const aiFinLeadSchema = z.object({
  contactName: z.string().trim().min(1).max(120),
  businessName: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(50).optional().nullable(),
  website: z.string().trim().max(500).optional().nullable(),
  industry: z.string().trim().max(120).optional().nullable(),
  primaryProblem: z.string().trim().min(1).max(2000),
  secondaryProblem: z.string().trim().max(2000).optional().nullable(),
  currentProcess: z.string().trim().max(4000).optional().nullable(),
  desiredOutcome: z.string().trim().max(2000).optional().nullable(),
  recommendedProduct: z.enum(approvedProducts),
  recommendedPackage: z.enum(approvedPackages).optional().nullable(),
  leadStage: z.enum(["COLD", "WARM", "HOT", "SURF'S UP"]),
  urgency: z.enum(["Low", "Normal", "High", "Immediate"]),
  systemsUsed: z.array(z.string().trim().min(1).max(120)).max(30).default([]),
  conversationSummary: z.string().trim().min(1).max(8000),
  source: z.string().trim().min(1).max(120).default("ai-fin"),
  consentToFollowUp: z.literal(true),
});

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function aiFinLeadHandler(req: Request, res: Response) {
  const parsed = aiFinLeadSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: "INVALID_LEAD_PAYLOAD",
      message: "I need a few valid lead details before I can save this.",
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return res.status(500).json({
      ok: false,
      error: "SUPABASE_NOT_CONFIGURED",
      message: "Lead capture is not configured on the server yet.",
    });
  }

  const lead = parsed.data;
  const leadId = randomUUID();
  const nextAction =
    lead.leadStage === "SURF'S UP"
      ? "begin_onboarding"
      : lead.leadStage === "HOT"
        ? "human_review"
        : "follow_up";

  const { error } = await supabase.from("leads").insert({
    id: leadId,
    name: lead.contactName,
    company: lead.businessName,
    email: lead.email,
    phone: lead.phone ?? null,
    website: lead.website ?? null,
    industry: lead.industry ?? null,
    primary_problem: lead.primaryProblem,
    secondary_problem: lead.secondaryProblem ?? null,
    current_process: lead.currentProcess ?? null,
    desired_outcome: lead.desiredOutcome ?? null,
    recommended_product: lead.recommendedProduct,
    recommended_package: lead.recommendedPackage ?? null,
    lead_stage: lead.leadStage,
    urgency: lead.urgency,
    systems_used: lead.systemsUsed,
    conversation_summary: lead.conversationSummary,
    consent_to_follow_up: true,
    source: lead.source,
    next_action: nextAction,
    status: "new",
  });

  if (error) {
    console.error("AI Fin lead save failed", error);
    return res.status(500).json({
      ok: false,
      error: "LEAD_SAVE_FAILED",
      message: "That lead did not save successfully yet.",
    });
  }

  return res.status(201).json({
    ok: true,
    status: "saved",
    leadId,
    nextAction,
  });
}
