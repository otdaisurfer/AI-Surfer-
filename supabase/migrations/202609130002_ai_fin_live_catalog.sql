-- Sync AI Fin's public product knowledge to the current launch catalog.
-- Source of truth: live site pricing plus live Stripe products on 2026-09-13.

update public.ai_fin_knowledge
set status = 'retired',
    updated_at = now(),
    last_reviewed_date = '2026-09-13'
where knowledge_key like 'product.%'
  and knowledge_key not in (
    'product.free-wave-check',
    'product.aeo-wave-audit',
    'product.wave-starter',
    'product.wave-builder',
    'product.tsunami-growth'
  );

insert into public.ai_fin_knowledge (
  knowledge_key,
  category,
  title,
  visibility,
  status,
  body,
  version_no,
  effective_date,
  last_reviewed_date,
  approval_source
)
values
  ('product.free-wave-check', 'product', 'Free AI Wave Check', 'public', 'active', '{"productId":"free-wave-check","setupPriceCents":0,"monthlyPriceCents":null,"notes":"Free lead-in assessment; use when a visitor needs help choosing the next step."}'::jsonb, 2, '2026-09-13', '2026-09-13', 'Live site'),
  ('product.aeo-wave-audit', 'product', 'AEO Wave Audit', 'public', 'active', '{"productId":"aeo-wave-audit","setupPriceCents":9700,"monthlyPriceCents":null,"notes":"One-time personalized 100-point AEO analysis with visibility gaps, Customer Question Map, 30-Day Wave Plan, and AI Surfer recommendation."}'::jsonb, 2, '2026-09-13', '2026-09-13', 'Live Stripe'),
  ('product.wave-starter', 'product', 'Wave Starter', 'public', 'active', '{"productId":"wave-starter","setupPriceCents":49700,"monthlyPriceCents":null,"notes":"Focused implementation sprint. Direct checkout is available."}'::jsonb, 1, '2026-09-13', '2026-09-13', 'Live site and Stripe'),
  ('product.wave-builder', 'product', 'Wave Builder', 'public', 'active', '{"productId":"wave-builder","setupPriceCents":199700,"monthlyPriceCents":null,"notes":"Broader build connecting AI visibility, lead flow, follow-up, and automation. Strategy call is the next step."}'::jsonb, 1, '2026-09-13', '2026-09-13', 'Live site'),
  ('product.tsunami-growth', 'product', 'Tsunami Growth', 'public', 'active', '{"productId":"tsunami-growth","setupPriceCents":399700,"monthlyPriceCents":null,"notes":"Strategy plus deeper multi-system implementation. Strategy call is the next step."}'::jsonb, 1, '2026-09-13', '2026-09-13', 'Live site')
on conflict (knowledge_key) do update
set title = excluded.title,
    visibility = excluded.visibility,
    status = excluded.status,
    body = excluded.body,
    version_no = excluded.version_no,
    effective_date = excluded.effective_date,
    last_reviewed_date = excluded.last_reviewed_date,
    approval_source = excluded.approval_source,
    updated_at = now();

insert into public.ai_fin_knowledge_versions (
  knowledge_id,
  version_no,
  visibility,
  status,
  body,
  effective_date,
  last_reviewed_date,
  approval_source
)
select
  k.id,
  k.version_no,
  k.visibility,
  k.status,
  k.body,
  k.effective_date,
  k.last_reviewed_date,
  k.approval_source
from public.ai_fin_knowledge k
where k.knowledge_key in (
  'product.free-wave-check',
  'product.aeo-wave-audit',
  'product.wave-starter',
  'product.wave-builder',
  'product.tsunami-growth'
)
on conflict (knowledge_id, version_no) do update
set visibility = excluded.visibility,
    status = excluded.status,
    body = excluded.body,
    effective_date = excluded.effective_date,
    last_reviewed_date = excluded.last_reviewed_date,
    approval_source = excluded.approval_source;
