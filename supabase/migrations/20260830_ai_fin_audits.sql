create table if not exists public.ai_fin_audits (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  website text,
  business_identifier text,
  contact_name text,
  email text,
  source text not null default 'ai-fin',
  status text not null default 'queued',
  score integer,
  result_summary jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_fin_audits_business_lookup_check
    check (coalesce(nullif(trim(website), ''), nullif(trim(business_identifier), '')) is not null),
  constraint ai_fin_audits_status_check
    check (status in ('queued', 'running', 'complete', 'failed')),
  constraint ai_fin_audits_score_check
    check (score is null or score between 0 and 100)
);

create index if not exists ai_fin_audits_created_at_idx
  on public.ai_fin_audits (created_at desc);

create index if not exists ai_fin_audits_status_idx
  on public.ai_fin_audits (status, created_at desc);

alter table public.ai_fin_audits enable row level security;

revoke all on table public.ai_fin_audits from anon, authenticated;
grant insert on table public.ai_fin_audits to anon, authenticated;

drop policy if exists "Allow public AI Fin audit starts" on public.ai_fin_audits;
create policy "Allow public AI Fin audit starts"
  on public.ai_fin_audits
  for insert
  to anon, authenticated
  with check (
    status = 'queued'
    and length(trim(business_name)) > 0
    and source in ('homepage_chat', 'aeo_page', 'pricing_page', 'product_page', 'other', 'ai-fin')
  );
