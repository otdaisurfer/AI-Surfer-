-- AI Fin is accessed through the server-side Pages Function using the service role.
-- Keep sensitive tables/functions out of the public Supabase API surface.

revoke select on table public.ai_fin_knowledge from anon, authenticated;
revoke select on table public.ai_fin_knowledge_versions from anon, authenticated;

revoke all on function public.handle_ai_fin_profile() from public, anon, authenticated;
revoke all on function public.is_ai_fin_owner() from public, anon, authenticated;
grant execute on function public.is_ai_fin_owner() to service_role;
