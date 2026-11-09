import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export const aiFinFollowUpSchema = z.object({
  leadId: z.string().uuid().optional().nullable(),
  contactName: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  recommendedProduct: z.string().trim().min(1).max(160),
  recommendedPackage: z.string().trim().max(160).optional().nullable(),
  conversationSummary: z.string().trim().min(1).max(8000),
  messageType: z.enum([
    "recommendation_summary",
    "next_steps",
    "human_review_confirmation",
  ]),
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

export async function aiFinFollowUpHandler(req: Request, res: Response) {
  const parsed = aiFinFollowUpSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: "INVALID_FOLLOW_UP_PAYLOAD",
      message: "I need valid follow-up details and permission before I can queue this.",
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
      message: "Follow-up messaging is not configured on the server yet.",
    });
  }

  const followUp = parsed.data;
  const messageId = randomUUID();

  const { error } = await supabase.from("ai_fin_follow_ups").insert({
    id: messageId,
    lead_id: followUp.leadId ?? null,
    contact_name: followUp.contactName,
    email: followUp.email,
    recommended_product: followUp.recommendedProduct,
    recommended_package: followUp.recommendedPackage ?? null,
    conversation_summary: followUp.conversationSummary,
    message_type: followUp.messageType,
    consent_to_follow_up: true,
    status: "queued",
  });

  if (error) {
    console.error("AI Fin follow-up queue failed", error);
    return res.status(500).json({
      ok: false,
      error: "FOLLOW_UP_QUEUE_FAILED",
      message: "That follow-up did not queue successfully yet.",
    });
  }

  return res.status(201).json({
    ok: true,
    status: "queued",
    messageId,
  });
}
