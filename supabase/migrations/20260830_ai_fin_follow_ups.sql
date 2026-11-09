create table if not exists public.ai_fin_follow_ups (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid null references public.leads(id) on delete set null,
  contact_name text not null,
  email text not null,
  recommended_product text not null,
  recommended_package text null,
  conversation_summary text not null,
  message_type text not null check (message_type in ('recommendation_summary','next_steps','human_review_confirmation')),
  consent_to_follow_up boolean not null default false,
  status text not null default 'queued' check (status in ('queued','sending','sent','failed','cancelled')),
  provider_message_id text null,
  last_error text null,
  created_at timestamptz not null default now(),
  sent_at timestamptz null
);

create index if not exists ai_fin_follow_ups_created_at_idx on public.ai_fin_follow_ups (created_at desc);
create index if not exists ai_fin_follow_ups_lead_id_idx on public.ai_fin_follow_ups (lead_id);
create index if not exists ai_fin_follow_ups_status_idx on public.ai_fin_follow_ups (status);

alter table public.ai_fin_follow_ups enable row level security;
revoke all on table public.ai_fin_follow_ups from anon, authenticated;
grant insert on table public.ai_fin_follow_ups to anon, authenticated;

drop policy if exists "Allow consented AI Fin follow-up queue inserts" on public.ai_fin_follow_ups;
create policy "Allow consented AI Fin follow-up queue inserts"
  on public.ai_fin_follow_ups
  for insert
  to anon, authenticated
  with check (
    consent_to_follow_up = true
    and status = 'queued'
    and length(trim(email)) > 3
    and length(trim(contact_name)) > 0
    and length(trim(recommended_product)) > 0
  );
