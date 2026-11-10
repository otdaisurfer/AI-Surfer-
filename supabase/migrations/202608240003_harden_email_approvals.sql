begin;

drop policy if exists "approval_requests update own" on public.approval_requests;
drop policy if exists "outbound_messages insert own" on public.outbound_messages;
drop policy if exists "outbound_messages update own" on public.outbound_messages;
drop policy if exists "outbound_messages delete own" on public.outbound_messages;

create or replace function public.finalize_crew_email(
  requested_approval_id uuid,
  requested_provider_message_id text,
  succeeded boolean,
  requested_error_code text default null
)
returns public.approval_requests
language plpgsql
security definer
set search_path = public, auth
as $$
declare finalized public.approval_requests;
begin
  if auth.uid() is null then raise exception 'authentication_required'; end if;

  if not exists (
    select 1
    from public.outbound_messages om
    where om.approval_id = requested_approval_id
      and om.auth_id = auth.uid()
      and om.status in ('claimed','failed')
  ) then raise exception 'email_claim_not_found'; end if;

  if succeeded then
    if requested_provider_message_id is null or length(trim(requested_provider_message_id)) = 0 then
      raise exception 'provider_message_id_required';
    end if;

    update public.outbound_messages
    set status = 'sent',
        provider_message_id = requested_provider_message_id,
        error_code = null,
        updated_at = now()
    where approval_id = requested_approval_id
      and auth_id = auth.uid();

    update public.approval_requests
    set status = 'sent',
        sent_at = now(),
        last_error_code = null,
        updated_at = now()
    where id = requested_approval_id
      and auth_id = auth.uid()
      and status = 'sending'
    returning * into finalized;
  else
    update public.outbound_messages
    set status = 'failed',
        error_code = coalesce(nullif(requested_error_code, ''), 'provider_rejected'),
        updated_at = now()
    where approval_id = requested_approval_id
      and auth_id = auth.uid();

    update public.approval_requests
    set status = 'failed',
        last_error_code = coalesce(nullif(requested_error_code, ''), 'provider_rejected'),
        updated_at = now()
    where id = requested_approval_id
      and auth_id = auth.uid()
      and status = 'sending'
    returning * into finalized;
  end if;

  if finalized.id is null then raise exception 'email_finalize_conflict'; end if;
  return finalized;
end
$$;

revoke all on function public.finalize_crew_email(uuid, text, boolean, text) from public;
grant execute on function public.finalize_crew_email(uuid, text, boolean, text) to authenticated;

commit;
