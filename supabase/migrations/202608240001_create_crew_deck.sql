begin;

create table if not exists public.crew_plan_entitlements (
  tier text primary key,
  allowed_agents text[] not null default '{}',
  monthly_runs integer not null default 0 check (monthly_runs >= 0),
  monthly_emails integer not null default 0 check (monthly_emails >= 0),
  enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.crew_plan_entitlements
  (tier, allowed_agents, monthly_runs, monthly_emails, enabled)
values
  ('Member', '{}', 0, 0, false),
  ('Starter Access', '{"wave-scout","sales-rider"}', 0, 0, false),
  ('Innovator Tier', '{"wave-scout","sales-rider","content-creator","customer-care-cove"}', 0, 0, false),
  ('Console Tier', '{"wave-scout","sales-rider","content-creator","customer-care-cove","automation-architect"}', 0, 0, false),
  ('Full Takeover', '{"wave-scout","sales-rider","content-creator","customer-care-cove","automation-architect","big-kahuna"}', 0, 0, false),
  ('Owner', '{"wave-scout","sales-rider","content-creator","customer-care-cove","automation-architect","big-kahuna"}', 1000, 1000, true)
on conflict (tier) do update set
  allowed_agents = excluded.allowed_agents,
  monthly_runs = excluded.monthly_runs,
  monthly_emails = excluded.monthly_emails,
  enabled = excluded.enabled,
  updated_at = now();

create table if not exists public.business_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid not null unique references auth.users(id) on delete cascade,
  business_name text not null check (char_length(business_name) between 2 and 160),
  website text not null check (website ~* '^https?://'),
  industry text not null check (char_length(industry) between 2 and 120),
  location text not null default '',
  products_services text not null default '',
  ideal_customer text not null default '',
  primary_offers text not null default '',
  brand_voice text not null default '',
  business_goals text not null default '',
  reply_to_email text not null check (position('@' in reply_to_email) > 1),
  facts jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crew_projects (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid not null references auth.users(id) on delete cascade,
  business_profile_id uuid not null references public.business_profiles(id) on delete cascade,
  agent_slug text not null check (agent_slug in ('wave-scout','sales-rider','content-creator','customer-care-cove','automation-architect','big-kahuna')),
  title text not null check (char_length(title) between 1 and 180),
  status text not null default 'active' check (status in ('active','complete','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.crew_projects(id) on delete cascade,
  agent_slug text not null check (agent_slug in ('wave-scout','sales-rider','content-creator','customer-care-cove','automation-architect','big-kahuna')),
  status text not null default 'reserved' check (status in ('reserved','running','complete','failed','cancelled')),
  request_id uuid not null unique default gen_random_uuid(),
  input_summary text not null default '',
  output jsonb,
  error_code text,
  usage_released boolean not null default false,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.agent_messages (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.crew_projects(id) on delete cascade,
  run_id uuid references public.agent_runs(id) on delete set null,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.research_sources (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.crew_projects(id) on delete cascade,
  run_id uuid not null references public.agent_runs(id) on delete cascade,
  url text not null check (url ~* '^https?://'),
  title text not null default '',
  claim_summary text not null default '',
  confidence text not null default 'unrated' check (confidence in ('high','medium','low','unrated')),
  retrieved_at timestamptz not null default now(),
  unique (run_id, url)
);

create table if not exists public.crew_leads (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.crew_projects(id) on delete set null,
  company_name text not null,
  contact_name text,
  public_email text,
  website text check (website is null or website ~* '^https?://'),
  qualification_score integer check (qualification_score between 0 and 100),
  qualification_reason text not null default '',
  source_url text not null check (source_url ~* '^https?://'),
  status text not null default 'new' check (status in ('new','qualified','contacted','replied','won','lost','suppressed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_assets (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.crew_projects(id) on delete cascade,
  run_id uuid references public.agent_runs(id) on delete set null,
  agent_slug text not null,
  asset_type text not null,
  title text not null,
  content text not null,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.crew_projects(id) on delete cascade,
  run_id uuid references public.agent_runs(id) on delete set null,
  action_type text not null check (action_type = 'send_email'),
  status text not null default 'pending' check (status in ('pending','approved','sending','sent','failed','cancelled')),
  version integer not null default 1 check (version > 0),
  draft jsonb not null,
  approved_snapshot jsonb,
  approved_at timestamptz,
  sent_at timestamptz,
  last_error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'pending' and approved_snapshot is null) or status <> 'pending')
);

create table if not exists public.outbound_messages (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid not null references auth.users(id) on delete cascade,
  approval_id uuid not null unique references public.approval_requests(id) on delete restrict,
  idempotency_key text not null unique,
  provider text not null default 'resend',
  provider_message_id text unique,
  status text not null default 'claimed' check (status in ('claimed','sent','failed')),
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid not null references auth.users(id) on delete cascade,
  run_id uuid references public.agent_runs(id) on delete set null,
  event_type text not null check (event_type in ('agent_run','email_send','release')),
  quantity integer not null default 1 check (quantity > 0),
  occurred_at timestamptz not null default now()
);

create index if not exists crew_projects_auth_created_idx on public.crew_projects (auth_id, created_at desc);
create index if not exists agent_runs_auth_created_idx on public.agent_runs (auth_id, created_at desc);
create index if not exists agent_messages_project_created_idx on public.agent_messages (project_id, created_at);
create index if not exists research_sources_run_idx on public.research_sources (run_id);
create index if not exists crew_leads_auth_status_idx on public.crew_leads (auth_id, status);
create index if not exists content_assets_project_idx on public.content_assets (project_id, created_at desc);
create index if not exists approval_requests_auth_status_idx on public.approval_requests (auth_id, status, created_at desc);
create index if not exists usage_events_auth_month_idx on public.usage_events (auth_id, occurred_at desc);

alter table public.crew_plan_entitlements enable row level security;
alter table public.business_profiles enable row level security;
alter table public.crew_projects enable row level security;
alter table public.agent_runs enable row level security;
alter table public.agent_messages enable row level security;
alter table public.research_sources enable row level security;
alter table public.crew_leads enable row level security;
alter table public.content_assets enable row level security;
alter table public.approval_requests enable row level security;
alter table public.outbound_messages enable row level security;
alter table public.usage_events enable row level security;

create policy "crew entitlements authenticated read"
on public.crew_plan_entitlements for select to authenticated using (true);

do $policies$
declare
  table_name text;
begin
  foreach table_name in array array[
    'business_profiles','crew_projects','agent_runs','agent_messages',
    'research_sources','crew_leads','content_assets','approval_requests',
    'outbound_messages','usage_events'
  ]
  loop
    execute format(
      'create policy %I on public.%I for select to authenticated using (auth.uid() = auth_id)',
      table_name || ' select own', table_name
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (auth.uid() = auth_id)',
      table_name || ' insert own', table_name
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using (auth.uid() = auth_id) with check (auth.uid() = auth_id)',
      table_name || ' update own', table_name
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using (auth.uid() = auth_id)',
      table_name || ' delete own', table_name
    );
  end loop;
end
$policies$;

create or replace function public.current_crew_tier()
returns text
language sql
stable
security definer
set search_path = public, auth
as $$
  select case
    when coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'owner' then 'Owner'
    else coalesce(
      (select u.tier from public.users u where u.auth_id = auth.uid()),
      'Member'
    )
  end
$$;

revoke all on function public.current_crew_tier() from public;
grant execute on function public.current_crew_tier() to authenticated;

create or replace function public.reserve_crew_run(
  requested_agent_slug text,
  requested_project_id uuid,
  requested_input_summary text default ''
)
returns public.agent_runs
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  caller uuid := auth.uid();
  entitlement public.crew_plan_entitlements;
  run_count integer;
  created_run public.agent_runs;
begin
  if caller is null then raise exception 'authentication_required'; end if;

  select * into entitlement
  from public.crew_plan_entitlements
  where tier = public.current_crew_tier();

  if entitlement.tier is null
     or not entitlement.enabled
     or not requested_agent_slug = any(entitlement.allowed_agents) then
    raise exception 'agent_locked';
  end if;

  if not exists (
    select 1 from public.crew_projects p
    where p.id = requested_project_id
      and p.auth_id = caller
      and p.agent_slug = requested_agent_slug
  ) then raise exception 'project_not_found'; end if;

  perform pg_advisory_xact_lock(hashtextextended(caller::text || date_trunc('month', now())::text, 0));

  select count(*) into run_count
  from public.usage_events e
  where e.auth_id = caller
    and e.event_type = 'agent_run'
    and e.occurred_at >= date_trunc('month', now());

  if run_count >= entitlement.monthly_runs then raise exception 'run_limit_reached'; end if;

  insert into public.agent_runs (auth_id, project_id, agent_slug, input_summary)
  values (caller, requested_project_id, requested_agent_slug, left(requested_input_summary, 500))
  returning * into created_run;

  insert into public.usage_events (auth_id, run_id, event_type)
  values (caller, created_run.id, 'agent_run');

  return created_run;
end
$$;

revoke all on function public.reserve_crew_run(text, uuid, text) from public;
grant execute on function public.reserve_crew_run(text, uuid, text) to authenticated;

create or replace function public.approve_crew_email(
  requested_approval_id uuid,
  expected_version integer
)
returns public.approval_requests
language plpgsql
security definer
set search_path = public, auth
as $$
declare approved public.approval_requests;
begin
  update public.approval_requests
  set status = 'approved',
      approved_snapshot = draft,
      approved_at = now(),
      updated_at = now()
  where id = requested_approval_id
    and auth_id = auth.uid()
    and status = 'pending'
    and version = expected_version
  returning * into approved;

  if approved.id is null then raise exception 'approval_conflict'; end if;
  return approved;
end
$$;

revoke all on function public.approve_crew_email(uuid, integer) from public;
grant execute on function public.approve_crew_email(uuid, integer) to authenticated;

create or replace function public.claim_approved_crew_email(
  requested_approval_id uuid,
  requested_idempotency_key text
)
returns public.outbound_messages
language plpgsql
security definer
set search_path = public, auth
as $$
declare claimed public.outbound_messages;
begin
  select * into claimed from public.outbound_messages
  where approval_id = requested_approval_id and auth_id = auth.uid();
  if claimed.id is not null then return claimed; end if;

  update public.approval_requests
  set status = 'sending', updated_at = now()
  where id = requested_approval_id
    and auth_id = auth.uid()
    and status = 'approved'
    and approved_snapshot is not null;

  if not found then raise exception 'email_not_approved'; end if;

  insert into public.outbound_messages (auth_id, approval_id, idempotency_key)
  values (auth.uid(), requested_approval_id, requested_idempotency_key)
  on conflict (approval_id) do update set updated_at = public.outbound_messages.updated_at
  returning * into claimed;

  return claimed;
end
$$;

revoke all on function public.claim_approved_crew_email(uuid, text) from public;
grant execute on function public.claim_approved_crew_email(uuid, text) to authenticated;

commit;
