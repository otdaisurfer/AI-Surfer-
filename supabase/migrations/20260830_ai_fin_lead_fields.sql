alter table public.leads
  add column if not exists phone text,
  add column if not exists website text,
  add column if not exists industry text,
  add column if not exists primary_problem text,
  add column if not exists secondary_problem text,
  add column if not exists current_process text,
  add column if not exists desired_outcome text,
  add column if not exists recommended_product text,
  add column if not exists recommended_package text,
  add column if not exists lead_stage text,
  add column if not exists urgency text,
  add column if not exists systems_used jsonb not null default '[]'::jsonb,
  add column if not exists conversation_summary text,
  add column if not exists consent_to_follow_up boolean not null default false,
  add column if not exists next_action text,
  add column if not exists assigned_to text,
  add column if not exists follow_up_due_at timestamptz,
  add column if not exists status text not null default 'new';

create index if not exists leads_lead_stage_idx
  on public.leads (lead_stage);

create index if not exists leads_status_created_at_idx
  on public.leads (status, created_at desc);

create index if not exists leads_recommended_product_idx
  on public.leads (recommended_product);
