import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { getAiFinStripePriceId } from "../config/aiFinStripe";

export const aiFinOnboardingSchema = z.object({
  leadId: z.string().uuid().optional().nullable(),
  contactName: z.string().trim().min(1).max(120),
  businessName: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(254),
  recommendedProduct: z.string().trim().min(1).max(120),
  recommendedPackage: z.enum(["Wave Starter", "Wave Builder", "Tsunami Growth"]),
  nextStepType: z.enum(["checkout", "booking", "intake_form", "human_review"]),
});

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function aiFinOnboardingHandler(req: Request, res: Response) {
  const parsed = aiFinOnboardingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: "INVALID_ONBOARDING_PAYLOAD",
      message: "I need valid onboarding details before I can start this step.",
      issues: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
    });
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return res.status(500).json({ ok: false, error: "SUPABASE_NOT_CONFIGURED", message: "Onboarding is not configured on the server yet." });
  }

  const onboarding = parsed.data;
  const onboardingId = randomUUID();
  const checkoutRequested = onboarding.nextStepType === "checkout";
  const packagePrice = getAiFinStripePriceId(onboarding.recommendedPackage);
  const stripeSecretConfigured = Boolean(process.env.STRIPE_SECRET_KEY?.trim());
  const checkoutConfigured = checkoutRequested && packagePrice.configured && stripeSecretConfigured;
  const status = checkoutRequested && !checkoutConfigured ? "waiting_configuration" : "ready";
  const checkoutStatus = checkoutRequested
    ? checkoutConfigured ? "ready" : "configuration_required"
    : "not_requested";

  const { error } = await supabase.from("ai_fin_onboarding").insert({
    id: onboardingId,
    lead_id: onboarding.leadId ?? null,
    contact_name: onboarding.contactName,
    business_name: onboarding.businessName,
    email: onboarding.email,
    recommended_product: onboarding.recommendedProduct,
    recommended_package: onboarding.recommendedPackage,
    next_step_type: onboarding.nextStepType,
    status,
    checkout_status: checkoutStatus,
  });

  if (error) {
    console.error("AI Fin onboarding save failed", error);
    return res.status(500).json({ ok: false, error: "ONBOARDING_SAVE_FAILED", message: "That onboarding step did not save successfully yet." });
  }

  return res.status(201).json({
    ok: true,
    status,
    onboardingId,
    nextStepType: onboarding.nextStepType,
    checkoutStatus,
    url: null,
    requiresConfiguration: checkoutRequested && !checkoutConfigured,
    checkoutConfiguration: checkoutRequested
      ? {
          stripeSecretConfigured,
          packagePriceConfigured: packagePrice.configured,
          requiredPriceEnvironmentVariable: packagePrice.envName,
        }
      : null,
  });
}
