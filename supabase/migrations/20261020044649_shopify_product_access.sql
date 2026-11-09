-- Service-role-only order ledger. No client writes, tier upgrades, subscriptions,
-- or auth account creation. A revocation is permanent for this order.
create table public.shopify_access_orders (
  shop_domain text not null check (shop_domain = 'nrctqw-pi.myshopify.com'),
  order_id text not null check (order_id ~ '^[1-9][0-9]{0,19}$'),
  buyer_email text,
  revoked boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (shop_domain, order_id)
);
create table public.shopify_product_access (
  shop_domain text not null,
  order_id text not null,
  line_item_id text not null check (line_item_id ~ '^[1-9][0-9]{0,19}$'),
  product_slug text not null check (product_slug in ('wave-scout','sales-rider','content-creator','customer-care-cove','automation-architect','big-kahuna','aeo-blueprint','ai-opportunity-report')),
  user_id uuid references auth.users(id) on delete set null,
  activated_at timestamptz,
  expires_at timestamptz,
  primary key (shop_domain, order_id, line_item_id),
  foreign key (shop_domain, order_id) references public.shopify_access_orders(shop_domain, order_id),
  check ((activated_at is null and expires_at is null) or
    (activated_at is not null and expires_at = activated_at + interval '720 hours'))
);
create index shopify_access_buyer_email on public.shopify_access_orders(buyer_email);
create index shopify_access_user on public.shopify_product_access(user_id);
alter table public.shopify_access_orders enable row level security;
alter table public.shopify_product_access enable row level security;
revoke all on public.shopify_access_orders, public.shopify_product_access from public, anon, authenticated;
grant select, insert, update on public.shopify_access_orders, public.shopify_product_access to service_role;

create function public.record_shopify_access_order(p_shop text, p_order_id text, p_email text, p_revoke boolean, p_items jsonb)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if p_shop <> 'nrctqw-pi.myshopify.com' or p_order_id !~ '^[1-9][0-9]{0,19}$' or p_revoke is null then
    raise exception 'Invalid order';
  end if;
  if p_revoke then
    insert into public.shopify_access_orders(shop_domain, order_id, revoked)
    values (p_shop, p_order_id, true)
    on conflict (shop_domain, order_id) do update set revoked = true;
    return;
  end if;
  if p_email is null or p_email <> lower(trim(p_email)) or length(p_email) > 254 or position('@' in p_email) < 2 then
    raise exception 'Invalid buyer email';
  end if;
  insert into public.shopify_access_orders(shop_domain, order_id, buyer_email)
  values (p_shop, p_order_id, p_email) on conflict do nothing;
  -- Serialize paid/revoke events and prevent old paid deliveries reviving access.
  perform 1 from public.shopify_access_orders
  where shop_domain = p_shop and order_id = p_order_id for update;
  if exists(select 1 from public.shopify_access_orders where shop_domain = p_shop and order_id = p_order_id and revoked) then return; end if;
  insert into public.shopify_product_access(shop_domain, order_id, line_item_id, product_slug)
  select p_shop, p_order_id, item.line_item_id, item.product_slug
  from jsonb_to_recordset(p_items) as item(line_item_id text, product_slug text)
  on conflict do nothing;
end;
$$;

-- Only the authenticated server may call this. It supplies an identity obtained
-- from auth.getUser(), including its confirmed email, never browser form data.
create function public.resolve_shopify_member_access(p_user_id uuid, p_email text, p_activate_slug text default null)
returns table(product_slug text, status text, activated_at timestamptz, expires_at timestamptz)
language plpgsql security invoker set search_path = '' as $$
begin
  if p_user_id is null or p_email is null then raise exception 'Missing verified account'; end if;
  if p_activate_slug is not null then
    -- Serialize activations from this account so a retry cannot consume another
    -- purchased period. The conditional update also handles two accounts racing.
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user_id::text, 0));
    if not exists (
      select 1 from public.shopify_product_access g join public.shopify_access_orders o using (shop_domain, order_id)
      where g.user_id = p_user_id and g.product_slug = p_activate_slug and not o.revoked and g.expires_at > now()
    ) then
      update public.shopify_product_access g set user_id = p_user_id, activated_at = now(), expires_at = now() + interval '720 hours'
      where (g.shop_domain, g.order_id, g.line_item_id) in (
        select candidate.shop_domain, candidate.order_id, candidate.line_item_id
        from public.shopify_product_access candidate join public.shopify_access_orders o using (shop_domain, order_id)
        where o.buyer_email = p_email and not o.revoked and candidate.product_slug = p_activate_slug
          and candidate.activated_at is null and candidate.user_id is null
        order by o.created_at, candidate.order_id, candidate.line_item_id limit 1 for update of candidate, o
      ) and g.activated_at is null and g.user_id is null;
    end if;
  end if;
  return query
    select g.product_slug, case when o.revoked then 'revoked' when g.activated_at is null then 'pending'
      when g.expires_at > now() then 'active' else 'expired' end,
      g.activated_at, g.expires_at
    from public.shopify_product_access g join public.shopify_access_orders o using (shop_domain, order_id)
    where g.user_id = p_user_id or (g.user_id is null and g.activated_at is null and o.buyer_email = p_email)
    order by o.created_at, g.product_slug;
end;
$$;
revoke all on function public.record_shopify_access_order(text,text,text,boolean,jsonb) from public, anon, authenticated;
revoke all on function public.resolve_shopify_member_access(uuid,text,text) from public, anon, authenticated;
grant execute on function public.record_shopify_access_order(text,text,text,boolean,jsonb) to service_role;
grant execute on function public.resolve_shopify_member_access(uuid,text,text) to service_role;
