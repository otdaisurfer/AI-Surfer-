create table if not exists public.wave_starter_intakes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  stripe_checkout_session_id text not null unique,
  contact_name text not null,
  email text not null,
  business_name text not null,
  website text null,
  primary_goal text not null,
  biggest_bottleneck text not null,
  systems_used text[] not null default '{}',
  notes text null,
  status text not null default 'new'
);

alter table public.wave_starter_intakes enable row level security;

revoke all on table public.wave_starter_intakes from anon, authenticated;

create index if not exists wave_starter_intakes_email_idx
  on public.wave_starter_intakes (lower(email));

create index if not exists wave_starter_intakes_status_idx
  on public.wave_starter_intakes (status);
