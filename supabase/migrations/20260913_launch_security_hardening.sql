revoke execute on function public.approve_crew_email(uuid, integer) from anon;
revoke execute on function public.claim_approved_crew_email(uuid, text) from anon;
revoke execute on function public.finalize_crew_email(uuid, text, boolean, text) from anon;
revoke execute on function public.reserve_crew_run(text, uuid, text) from anon;
revoke execute on function public.current_crew_tier() from anon;

revoke execute on function public.handle_new_auth_user() from public, anon, authenticated;
revoke execute on function public.sync_aeo_intake_business_identity_to_order() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

alter function public.handle_updated_at() set search_path = public, pg_temp;

revoke select on table public.agent_messages from anon;
revoke select on table public.agent_runs from anon;
revoke select on table public.agents from anon;
revoke select on table public.approval_requests from anon;
revoke select on table public.business_profiles from anon;
revoke select on table public.businesses from anon;
revoke select on table public.content_assets from anon;
revoke select on table public.conversations from anon;
revoke select on table public.crew_leads from anon;
revoke select on table public.crew_plan_entitlements from anon;
revoke select on table public.crew_projects from anon;
revoke select on table public.founding_members from anon;
revoke select on table public.leads from anon;
revoke select on table public.members from anon;
revoke select on table public.messages from anon;
revoke select on table public.outbound_messages from anon;
revoke select on table public.payments from anon;
revoke select on table public.profiles from anon;
revoke select on table public.research_sources from anon;
revoke select on table public.subscriptions from anon;
revoke select on table public.todos from anon;
revoke select on table public.usage_events from anon;
revoke select on table public.users from anon;
revoke select on table public.workflow_runs from anon;
revoke select on table public.workflow_triggers from anon;
revoke select on table public.workflows from anon;
