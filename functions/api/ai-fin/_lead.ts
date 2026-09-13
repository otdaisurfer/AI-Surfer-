import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { LeadDraft } from '../../../src/features/ai-fin/contracts';

const LeadSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  company: z.string().trim().max(160).optional(),
  website: z.string().trim().url().max(500).optional(),
  problem: z.string().trim().min(1).max(1200),
  budgetRange: z.string().trim().max(120).optional(),
  preferredContactMethod: z.string().trim().max(120).optional(),
  consent: z.literal(true),
  consentAt: z.string().datetime(),
});

function rejectMarkup(value: string | undefined, field: string): void {
  if (value && /[<>]/.test(value)) {
    throw new Error(`Invalid ${field}`);
  }
}

export function validateLeadDraft(input: LeadDraft): LeadDraft {
  const parsed = LeadSchema.parse(input);

  rejectMarkup(parsed.name, 'name');
  rejectMarkup(parsed.company, 'company');
  rejectMarkup(parsed.problem, 'problem');
  rejectMarkup(parsed.budgetRange, 'budget range');
  rejectMarkup(parsed.preferredContactMethod, 'preferred contact method');

  return {
    ...parsed,
    email: parsed.email.toLowerCase(),
  };
}

export async function saveLead(
  supabase: SupabaseClient,
  draft: LeadDraft,
): Promise<{ id: string }> {
  const lead = validateLeadDraft(draft);

  const { data, error } = await supabase
    .from('ai_fin_leads')
    .insert({
      name: lead.name,
      email: lead.email,
      company: lead.company ?? null,
      website: lead.website ?? null,
      problem: lead.problem,
      budget_range: lead.budgetRange ?? null,
      preferred_contact_method: lead.preferredContactMethod ?? null,
      source: 'ai-fin',
      consent_at: lead.consentAt,
      notification_status: 'pending',
    })
    .select('id')
    .single();

  if (error || !data?.id) {
    throw new Error('AI Fin could not save this lead');
  }

  return { id: String(data.id) };
}
