insert into public.pricing_tiers (name, price_monthly, price_annual, color, icon, features, active, sort_order)
values
  ('free', 0, 0, '#4a9eff', '🌊', '["Free AI Wave Check","Wave Scout","Sales Rider","AI Opportunity Report"]'::jsonb, true, 0),
  ('bronze', 1700, 17000, '#00f5d4', '🏄', '["Everything in free","Content Creator","Customer Care Cove","AEO Blueprint","Automation Blueprint"]'::jsonb, true, 1),
  ('wave', 9900, 99000, '#a78bfa', '🌊', '["Everything in bronze","Automation Architect"]'::jsonb, false, 2),
  ('tsunami', 25000, 250000, '#f5c518', '🐋', '["Everything in wave","Big Kahuna"]'::jsonb, false, 3),
  ('enterprise', 75000, 750000, '#f9a8d4', '👑', '["Custom AI infrastructure","White-label systems","Dedicated deployment pipeline"]'::jsonb, false, 4)
on conflict (name) do update set
  price_monthly = excluded.price_monthly,
  price_annual = excluded.price_annual,
  color = excluded.color,
  icon = excluded.icon,
  features = excluded.features,
  active = excluded.active,
  sort_order = excluded.sort_order;

alter table public.users alter column tier set default 'free';
update public.users set tier='free'
where tier in ('Initiate','Automator','Architect','Omniscient')
  and stripe_customer_id is null;
update public.pricing_tiers set active=false
where name in ('Initiate','Automator','Architect','Omniscient');