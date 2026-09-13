-- AI Fin / Agent Coral protected business knowledge foundation
-- Approved design date: 2026-08-28

create extension if not exists pgcrypto;

alter table public.profiles
  add column if not exists role text not null default 'member';

alter table public.profiles
  drop constraint if exists profiles_role_check,
  add constraint profiles_role_check check (role in ('member', 'owner'));

create or replace function public.is_ai_fin_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'owner'
  );
$$;

revoke all on function public.is_ai_fin_owner() from public;
grant execute on function public.is_ai_fin_owner() to anon, authenticated, service_role;

create table if not exists public.ai_fin_knowledge (
  id uuid primary key default gen_random_uuid(),
  knowledge_key text not null unique,
  category text not null,
  title text not null,
  visibility text not null,
  status text not null default 'draft',
  body jsonb not null default '{}'::jsonb,
  version_no integer not null default 1 check (version_no > 0),
  effective_date date,
  last_reviewed_date date,
  approval_source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_fin_knowledge_visibility_check check (visibility in ('public', 'owner')),
  constraint ai_fin_knowledge_status_check check (status in ('draft', 'active', 'retired'))
);

create table if not exists public.ai_fin_knowledge_versions (
  id uuid primary key default gen_random_uuid(),
  knowledge_id uuid not null references public.ai_fin_knowledge(id) on delete cascade,
  version_no integer not null check (version_no > 0),
  visibility text not null,
  status text not null,
  body jsonb not null,
  effective_date date,
  last_reviewed_date date,
  approval_source text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint ai_fin_knowledge_versions_visibility_check check (visibility in ('public', 'owner')),
  constraint ai_fin_knowledge_versions_status_check check (status in ('draft', 'active', 'retired')),
  constraint ai_fin_knowledge_versions_unique unique (knowledge_id, version_no)
);

create table if not exists public.ai_fin_approvals (
  id uuid primary key default gen_random_uuid(),
  knowledge_id uuid not null references public.ai_fin_knowledge(id) on delete cascade,
  version_id uuid not null references public.ai_fin_knowledge_versions(id) on delete cascade,
  action text not null check (action in ('approved', 'rejected', 'retired', 'rollback')),
  approver_id uuid references auth.users(id) on delete set null,
  approver_name text not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_fin_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  website text,
  problem text not null,
  budget_range text,
  preferred_contact_method text,
  summary text,
  source text not null default 'agent-coral',
  consent_at timestamptz not null,
  notification_status text not null default 'pending' check (notification_status in ('pending', 'sent', 'failed')),
  created_at timestamptz not null default now()
);

create index if not exists ai_fin_knowledge_lookup_idx
  on public.ai_fin_knowledge (visibility, status, category, knowledge_key);
create index if not exists ai_fin_knowledge_versions_lookup_idx
  on public.ai_fin_knowledge_versions (knowledge_id, version_no desc);
create index if not exists ai_fin_leads_created_at_idx
  on public.ai_fin_leads (created_at desc);

alter table public.ai_fin_knowledge enable row level security;
alter table public.ai_fin_knowledge_versions enable row level security;
alter table public.ai_fin_approvals enable row level security;
alter table public.ai_fin_leads enable row level security;

revoke all on table public.ai_fin_knowledge from anon, authenticated;
revoke all on table public.ai_fin_knowledge_versions from anon, authenticated;
revoke all on table public.ai_fin_approvals from anon, authenticated;
revoke all on table public.ai_fin_leads from anon, authenticated;

grant select on table public.ai_fin_knowledge to anon, authenticated;
grant select on table public.ai_fin_knowledge_versions to anon, authenticated;

-- Public visitors and ordinary authenticated members can read only active public knowledge.
drop policy if exists ai_fin_public_knowledge_read on public.ai_fin_knowledge;
create policy ai_fin_public_knowledge_read
on public.ai_fin_knowledge
for select
to anon, authenticated
using (visibility = 'public' and status = 'active');

-- Verified owners can also read owner knowledge. Owner identity is derived from auth.uid()
-- and the server-managed profiles.role column, never a browser-supplied mode flag.
drop policy if exists ai_fin_owner_knowledge_read on public.ai_fin_knowledge;
create policy ai_fin_owner_knowledge_read
on public.ai_fin_knowledge
for select
to authenticated
using (public.is_ai_fin_owner() and visibility in ('public', 'owner'));

-- Versions inherit the same public/private boundary. Public callers see only active
-- versions tied to active public entries; owners may inspect all versions.
drop policy if exists ai_fin_public_versions_read on public.ai_fin_knowledge_versions;
create policy ai_fin_public_versions_read
on public.ai_fin_knowledge_versions
for select
to anon, authenticated
using (
  visibility = 'public'
  and status = 'active'
  and exists (
    select 1 from public.ai_fin_knowledge k
    where k.id = ai_fin_knowledge_versions.knowledge_id
      and k.visibility = 'public'
      and k.status = 'active'
  )
);

drop policy if exists ai_fin_owner_versions_read on public.ai_fin_knowledge_versions;
create policy ai_fin_owner_versions_read
on public.ai_fin_knowledge_versions
for select
to authenticated
using (public.is_ai_fin_owner() and visibility in ('public', 'owner'));

-- No anon/authenticated INSERT/UPDATE/DELETE grants are provided for knowledge,
-- versions, approvals, or leads. State changes and lead persistence are performed
-- server-side with validated requests. This prevents a browser client from directly
-- activating a draft knowledge version.

insert into public.ai_fin_knowledge (
  knowledge_key,
  category,
  title,
  visibility,
  status,
  body,
  version_no,
  effective_date,
  last_reviewed_date,
  approval_source
)
values
  ('product.free-wave-check', 'product', 'Free AI Wave Check', 'public', 'active', '{"productId":"free-wave-check","setupPriceCents":0,"monthlyPriceCents":null,"notes":"Lead-in assessment; no promise of a complete paid audit."}'::jsonb, 1, '2026-08-28', '2026-08-28', 'Shannon'),
  ('product.aeo-wave-audit', 'product', 'AEO Wave Audit', 'public', 'active', '{"productId":"aeo-wave-audit","setupPriceCents":99700,"monthlyPriceCents":null,"notes":"One-time audit."}'::jsonb, 1, '2026-08-28', '2026-08-28', 'Shannon'),
  ('product.wave-scout', 'product', 'Wave Scout', 'public', 'active', '{"productId":"wave-scout","setupPriceCents":199700,"monthlyPriceCents":99700,"notes":"Opportunity and lead intelligence."}'::jsonb, 1, '2026-08-28', '2026-08-28', 'Shannon'),
  ('product.sales-rider', 'product', 'Sales Rider', 'public', 'active', '{"productId":"sales-rider","setupPriceCents":299700,"monthlyPriceCents":149700,"notes":"Lead capture and follow-up system."}'::jsonb, 1, '2026-08-28', '2026-08-28', 'Shannon'),
  ('product.content-creator', 'product', 'Content Creator', 'public', 'active', '{"productId":"content-creator","setupPriceCents":199700,"monthlyPriceCents":149700,"notes":"Managed content system."}'::jsonb, 1, '2026-08-28', '2026-08-28', 'Shannon'),
  ('product.customer-care-cove', 'product', 'Customer Care Cove', 'public', 'active', '{"productId":"customer-care-cove","setupPriceCents":299700,"monthlyPriceCents":79700,"notes":"Customer-support agent; usage fees may be additional."}'::jsonb, 1, '2026-08-28', '2026-08-28', 'Shannon'),
  ('product.automation-architect', 'product', 'Automation Architect', 'public', 'active', '{"productId":"automation-architect","setupPriceCents":499700,"monthlyPriceCents":149700,"notes":"Workflow automation design and implementation."}'::jsonb, 1, '2026-08-28', '2026-08-28', 'Shannon'),
  ('product.big-kahuna', 'product', 'Big Kahuna', 'public', 'active', '{"productId":"big-kahuna","setupPriceCents":999700,"monthlyPriceCents":399700,"notes":"Strategy and comprehensive implementation."}'::jsonb, 1, '2026-08-28', '2026-08-28', 'Shannon'),
  ('policy.third-party-fees', 'policy', 'Third-party fees', 'public', 'active', '{"rule":"Software, advertising, message-volume, and third-party platform fees are separate unless an offer explicitly includes them."}'::jsonb, 1, '2026-08-28', '2026-08-28', 'Shannon')
on conflict (knowledge_key) do nothing;

insert into public.ai_fin_knowledge_versions (
  knowledge_id,
  version_no,
  visibility,
  status,
  body,
  effective_date,
  last_reviewed_date,
  approval_source
)
select
  k.id,
  k.version_no,
  k.visibility,
  k.status,
  k.body,
  k.effective_date,
  k.last_reviewed_date,
  k.approval_source
from public.ai_fin_knowledge k
where k.knowledge_key like 'product.%' or k.knowledge_key = 'policy.third-party-fees'
on conflict (knowledge_id, version_no) do nothing;
