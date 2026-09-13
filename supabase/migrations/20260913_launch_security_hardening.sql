revoke execute on function public.approve_crew_email(uuid, integer) from anon;
revoke execute on function public.claim_approved_crew_email(uuid, text) from anon;
revoke execute on function public.finalize_crew_email(uuid, text, boolean, text) from anon;
revoke execute on function public.reserve_crew_run(text, uuid, text) from anon;
revoke execute on function public.current_crew_tier() from anon;

revoke execute on function public.handle_new_auth_user() from public, anon, authenticated;
revoke execute on function public.sync_aeo_intake_business_identity_to_order() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

alter function public.handle_updated_at() set search_path = public, pg_temp;
