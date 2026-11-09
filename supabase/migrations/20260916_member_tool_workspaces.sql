create table if not exists public.member_tool_workspaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_id text not null,
  business text not null default '',
  audience text not null default '',
  goal text not null default '',
  offer text not null default '',
  monthly_revenue_goal text not null default '',
  average_sale text not null default '',
  recurring_price text not null default '',
  qualified_conversations text not null default '',
  leads text not null default '',
  one_time_sales text not null default '',
  recurring_customers text not null default '',
  weekly_revenue text not null default '',
  generated_result text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, tool_id)
);

alter table public.member_tool_workspaces enable row level security;

drop policy if exists "members can read own tool workspaces" on public.member_tool_workspaces;
create policy "members can read own tool workspaces"
on public.member_tool_workspaces for select
using (auth.uid() = user_id);

drop policy if exists "members can insert own tool workspaces" on public.member_tool_workspaces;
create policy "members can insert own tool workspaces"
on public.member_tool_workspaces for insert
with check (auth.uid() = user_id);

drop policy if exists "members can update own tool workspaces" on public.member_tool_workspaces;
create policy "members can update own tool workspaces"
on public.member_tool_workspaces for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "members can delete own tool workspaces" on public.member_tool_workspaces;
create policy "members can delete own tool workspaces"
on public.member_tool_workspaces for delete
using (auth.uid() = user_id);