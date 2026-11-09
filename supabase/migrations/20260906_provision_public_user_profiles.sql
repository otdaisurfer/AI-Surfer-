drop trigger if exists "my first webhook" on auth.users;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is null then
    return new;
  end if;

  insert into public.users (auth_id, email, name, tier, status)
  values (
    new.id,
    lower(new.email),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    'free',
    'active'
  )  on conflict (email) do update
    set auth_id = excluded.auth_id,
        name = coalesce(public.users.name, excluded.name),
        updated_at = now();

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

insert into public.users (auth_id, email, name, tier, status)
select
  au.id,
  lower(au.email),
  coalesce(au.raw_user_meta_data ->> 'full_name', au.raw_user_meta_data ->> 'name'),
  'free',
  'active'from auth.users au
where au.email is not null
on conflict (email) do update
  set auth_id = excluded.auth_id,
      name = coalesce(public.users.name, excluded.name),
      updated_at = now();