import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const auditSources = [
  "homepage_chat",
  "aeo_page",
  "pricing_page",
  "product_page",
  "other",
  "ai-fin",
] as const;

export const aiFinAuditStartSchema = z
  .object({
    businessName: z.string().trim().min(1).max(160),
    website: z.string().trim().max(500).optional().nullable(),
    businessIdentifier: z.string().trim().max(500).optional().nullable(),
    contactName: z.string().trim().max(120).optional().nullable(),
    email: z.string().trim().email().max(254).optional().nullable(),
    source: z.enum(auditSources).default("ai-fin"),
  })
  .refine(
    (value) => Boolean(value.website?.trim() || value.businessIdentifier?.trim()),
    {
      message: "A website or business identifier is required.",
      path: ["website"],
    },
  );

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function aiFinAuditStartHandler(req: Request, res: Response) {
  const parsed = aiFinAuditStartSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: "INVALID_AUDIT_PAYLOAD",
      message: "I need a business name plus a website or business identifier to start the audit.",
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
      message: "The AEO audit service is not configured on the server yet.",
    });
  }

  const audit = parsed.data;
  const auditId = randomUUID();

  const { error } = await supabase.from("ai_fin_audits").insert({
    id: auditId,
    business_name: audit.businessName,
    website: audit.website?.trim() || null,
    business_identifier: audit.businessIdentifier?.trim() || null,
    contact_name: audit.contactName?.trim() || null,
    email: audit.email?.trim() || null,
    source: audit.source,
    status: "queued",
  });

  if (error) {
    console.error("AI Fin audit start failed", error);
    return res.status(500).json({
      ok: false,
      error: "AUDIT_START_FAILED",
      message: "That audit did not start successfully yet.",
    });
  }

  return res.status(201).json({
    ok: true,
    status: "started",
    auditId,
    nextStep: "complete_aeo_audit",
  });
}
