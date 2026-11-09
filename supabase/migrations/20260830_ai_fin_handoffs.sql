create table if not exists public.ai_fin_handoffs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid null references public.leads(id) on delete set null,
  contact_name text not null,
  business_name text not null,
  email text not null,
  phone text null,
  website text null,
  reason text not null check (reason in (
    'custom_pricing',
    'complex_scope',
    'enterprise',
    'regulated_industry',
    'legal_or_contract_question',
    'uncertain_scope',
    'visitor_requested_person',
    'other'
  )),
  recommended_product text null,
  conversation_summary text not null,
  priority text not null check (priority in ('Normal', 'High', 'Immediate')),
  consent_to_follow_up boolean not null default false check (consent_to_follow_up = true),
  status text not null default 'queued' check (status in ('queued', 'assigned', 'completed')),
  assigned_to text null
);

create index if not exists ai_fin_handoffs_created_at_idx
  on public.ai_fin_handoffs (created_at desc);

create index if not exists ai_fin_handoffs_lead_id_idx
  on public.ai_fin_handoffs (lead_id)
  where lead_id is not null;

create index if not exists ai_fin_handoffs_status_priority_idx
  on public.ai_fin_handoffs (status, priority, created_at desc);

alter table public.ai_fin_handoffs enable row level security;

revoke all on table public.ai_fin_handoffs from anon, authenticated;
grant insert on table public.ai_fin_handoffs to anon, authenticated;

drop policy if exists "Allow AI Fin handoff inserts" on public.ai_fin_handoffs;
create policy "Allow AI Fin handoff inserts"
  on public.ai_fin_handoffs
  for insert
  to anon, authenticated
  with check (
    consent_to_follow_up = true
    and status = 'queued'
    and length(trim(contact_name)) > 0
    and length(trim(business_name)) > 0
    and length(trim(email)) > 3
    and length(trim(conversation_summary)) > 0
  );
