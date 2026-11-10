begin;

alter table public.usage_events
  add column if not exists approval_id uuid references public.approval_requests(id) on delete set null;

create unique index if not exists usage_events_email_approval_unique
  on public.usage_events (approval_id)
  where event_type = 'email_send' and approval_id is not null;

create or replace function public.claim_approved_crew_email(
  requested_approval_id uuid,
  requested_idempotency_key text
)
returns public.outbound_messages
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  claimed public.outbound_messages;
  entitlement public.crew_plan_entitlements;
  email_count integer;
begin
  if auth.uid() is null then raise exception 'authentication_required'; end if;

  select * into claimed
  from public.outbound_messages
  where approval_id = requested_approval_id
    and auth_id = auth.uid();

  if claimed.id is not null then return claimed; end if;

  select * into entitlement
  from public.crew_plan_entitlements
  where tier = public.current_crew_tier();

  if entitlement.tier is null or not entitlement.enabled then
    raise exception 'email_plan_locked';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(auth.uid()::text || date_trunc('month', now())::text || ':email', 0)
  );

  select count(*) into email_count
  from public.usage_events e
  where e.auth_id = auth.uid()
    and e.event_type = 'email_send'
    and e.occurred_at >= date_trunc('month', now());

  if email_count >= entitlement.monthly_emails then
    raise exception 'email_limit_reached';
  end if;

  update public.approval_requests
  set status = 'sending', updated_at = now()
  where id = requested_approval_id
    and auth_id = auth.uid()
    and status = 'approved'
    and approved_snapshot is not null;

  if not found then raise exception 'email_not_approved'; end if;

  insert into public.outbound_messages (auth_id, approval_id, idempotency_key)
  values (auth.uid(), requested_approval_id, requested_idempotency_key)
  returning * into claimed;

  insert into public.usage_events (auth_id, approval_id, event_type)
  values (auth.uid(), requested_approval_id, 'email_send');

  return claimed;
end
$$;

revoke all on function public.claim_approved_crew_email(uuid, text) from public;
grant execute on function public.claim_approved_crew_email(uuid, text) to authenticated;

commit;
