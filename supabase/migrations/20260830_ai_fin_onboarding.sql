create table if not exists public.ai_fin_onboarding (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid null,
  contact_name text not null,
  business_name text not null,
  email text not null,
  recommended_product text not null,
  recommended_package text not null,
  next_step_type text not null,
  status text not null default 'ready',
  checkout_status text not null default 'not_requested'
);

alter table public.ai_fin_onboarding enable row level security;

revoke all on table public.ai_fin_onboarding from anon, authenticated;
grant insert on table public.ai_fin_onboarding to anon, authenticated;

drop policy if exists "Allow AI Fin onboarding inserts" on public.ai_fin_onboarding;
create policy "Allow AI Fin onboarding inserts"
  on public.ai_fin_onboarding
  for insert
  to anon, authenticated
  with check (
    length(trim(contact_name)) > 0
    and length(trim(business_name)) > 0
    and length(trim(email)) > 3
    and recommended_package in ('Wave Starter','Wave Builder','Tsunami Growth')
    and next_step_type in ('checkout','booking','intake_form','human_review')
    and status in ('ready','waiting_configuration','routed')
    and checkout_status in ('not_requested','configuration_required','ready')
  );
