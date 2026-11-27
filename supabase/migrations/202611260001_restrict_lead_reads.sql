-- Match the owner role used by the website's members dashboard.
-- Replace the existing SELECT policy in place so insert policies stay intact.
alter policy "Authenticated users can view leads" on public.leads
  to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'owner');

alter policy "Authenticated users can view leads" on public.leads
  rename to "Owners can view leads";
