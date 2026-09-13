-- AI Fin profile lifecycle. Every auth user gets a server-managed profile.
-- Owner access is never inferred from browser claims or auth metadata.

create or replace function public.handle_ai_fin_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'member')
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

revoke all on function public.handle_ai_fin_profile() from public;

drop trigger if exists on_auth_user_created_ai_fin_profile on auth.users;
create trigger on_auth_user_created_ai_fin_profile
after insert or update of email on auth.users
for each row execute procedure public.handle_ai_fin_profile();

-- Safely backfill existing auth identities as members. Promotion to owner is a
-- separate explicit administrative action for the approved owner account only.
insert into public.profiles (id, email, role)
select id, email, 'member'
from auth.users
on conflict (id) do update
  set email = excluded.email;
