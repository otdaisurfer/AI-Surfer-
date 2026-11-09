import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const handoffReasons = [
  "custom_pricing",
  "complex_scope",
  "enterprise",
  "regulated_industry",
  "legal_or_contract_question",
  "uncertain_scope",
  "visitor_requested_person",
  "other",
] as const;

export const aiFinHandoffSchema = z.object({
  leadId: z.string().uuid().optional().nullable(),
  contactName: z.string().trim().min(1).max(120),
  businessName: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(50).optional().nullable(),
  website: z.string().trim().max(500).optional().nullable(),
  reason: z.enum(handoffReasons),
  recommendedProduct: z.string().trim().max(160).optional().nullable(),
  conversationSummary: z.string().trim().min(1).max(8000),
  urgency: z.enum(["Normal", "High", "Immediate"]),
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

export async function aiFinHandoffHandler(req: Request, res: Response) {
  const parsed = aiFinHandoffSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: "INVALID_HANDOFF_PAYLOAD",
      message: "I need valid contact details and permission before I can request a human review.",
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
      message: "Human handoff is not configured on the server yet.",
    });
  }

  const handoff = parsed.data;
  const reviewId = randomUUID();

  const { error } = await supabase.from("ai_fin_handoffs").insert({
    id: reviewId,
    lead_id: handoff.leadId ?? null,
    contact_name: handoff.contactName,
    business_name: handoff.businessName,
    email: handoff.email,
    phone: handoff.phone ?? null,
    website: handoff.website ?? null,
    reason: handoff.reason,
    recommended_product: handoff.recommendedProduct ?? null,
    conversation_summary: handoff.conversationSummary,
    priority: handoff.urgency,
    consent_to_follow_up: true,
    status: "queued",
  });

  if (error) {
    console.error("AI Fin handoff queue failed", error);
    return res.status(500).json({
      ok: false,
      error: "HANDOFF_QUEUE_FAILED",
      message: "The human review request did not queue successfully yet.",
    });
  }

  return res.status(201).json({
    ok: true,
    status: "queued",
    reviewId,
    priority: handoff.urgency,
  });
}
