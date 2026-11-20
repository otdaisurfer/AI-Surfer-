# Shopify purchase access

Approved behavior: an eligible paid Shopify service purchase includes 30 days
(720 hours) of access to its matching existing member workspace, beginning when
the buyer clicks **Activate my 30 days**. No recurring billing is created, and
the buyer's existing membership tier is never changed.

## Exact offer mapping

| Shopify product ID | Existing member workspace |
| --- | --- |
| 8045506789435 | wave-scout |
| 8045509017659 | sales-rider |
| 8045510688827 | content-creator |
| 8045511278651 | customer-care-cove |
| 8045512720443 | automation-architect |
| 8045514096699 | big-kahuna |
| 8045516947515 | aeo-blueprint |
| 8045519372347 | ai-opportunity-report |

Free AI Wave Check and Business Starter Kit do not grant paid access. Wave Audit
and Lead Leak Finder have no equivalent existing member workspace and continue
as manual services. This change connects access to the existing MemberProduct
pages; it does not implement new AI agents, service fulfillment, external account
integrations, or the workflow layers that those existing pages describe as future
connections. The free-tier tools remain available under existing membership rules.

## Trust boundaries

- Only `nrctqw-pi.myshopify.com` is accepted. Verify the HMAC against bounded raw
  request bytes with the signing secret for this webhook subscription source.
- `orders/paid` must contain a non-test, paid USD order with a positive order
  total. Exact mapped line items must have a positive net line price. Unmapped
  IDs and free line items are ignored, including the two free products.
- The order/line-item composite keys make duplicate delivery idempotent.
- `orders/cancelled` and `refunds/create` permanently revoke **all bonus workspace
  access for that order**, including partial refunds. This is an access rule,
  not a refund policy or a promise of a refund. A refund arriving before payment
  creates a tombstone; old paid notifications cannot revive it.
- Both tables have RLS enabled and no browser grants or policies. Both RPCs use
  SECURITY INVOKER with an empty search path; EXECUTE is service-role-only.
- The access endpoint validates a bearer token with Supabase `auth.getUser` and
  requires a confirmed, non-anonymous email. The email and user ID come from
  that validated account, never from the request body or user metadata.
- Activation uses a transaction and locks. Repeated activation cannot reset
  expiry or consume another period while access is active. Read requests never
  start the clock. A later separately purchased period can be activated after
  an earlier period has ended. Quantity on one line does not multiply access.
- Refunds revoke the bonus grant only, never a separately purchased membership.
  Existing subscriber/owner access remains under its original rules.
- No ID documents, card data, full webhook payloads, addresses, or auth tokens
  are stored in the order ledger or application logs.

## Read-only launch review — November 9, 2026

**NOT LIVE.** These observations are a dated configuration snapshot, not proof
of successful production activation.

- Shopify Admin API confirmed `nrctqw-pi.myshopify.com` and all eight mapped
  product IDs. The connector's display domain differs; use the Admin API identity
  when verifying the shop.
- The AI-Surfer Supabase project `mkgnyarwiscttobnytin` already records migration
  `20261020044649_shopify_product_access`. Its recorded SQL matches this
  repository migration after trimming whitespace. The two live tables have RLS
  enabled, and the two RPCs are SECURITY INVOKER with empty search paths and
  service-role-only EXECUTE grants. No migration was applied during this review.
- The repository migration is named
  `supabase/migrations/20261020044649_shopify_product_access.sql` to match the
  applied version. It previously used timestamp `20261020035805`. This is a
  filename/test-reference correction only; the SQL is unchanged. Do not rerun
  the CREATE statements or rewrite production migration history.
- Pages production `SUPABASE_URL` points to that project and a
  `SUPABASE_SERVICE_ROLE_KEY` secret is present. Secret validity was not
  exercised. `SHOPIFY_WEBHOOK_SECRET` is absent from the inspected production
  environment; the inspected preview environment has no required bindings.
- Pages reports both `otdaisurfer.surf` and `www.otdaisurfer.surf` custom domains
  as deactivated. The inspected DNS has apex A records and `www` pointing to
  `custom-domains.chatgpt.site`; the zone has a Stripe webhook Worker route but
  no Shopify webhook route. The proposed public URLs are not verified to reach
  this Pages application. Preserve the current homepage until routing is agreed.
- The connected Shopify app returned no webhook subscriptions. This read is
  limited to the current app's shop-scoped subscriptions; subscriptions owned by
  other apps, configured in app TOML, or created through Shopify Admin remain
  unconfirmed. Inspect the intended subscription source before creating duplicates.
- PR #204 is draft and unmerged. On `adc5f41`, all five Actions workflows passed
  and Cloudflare reported a successful preview. The PR reports 374 tests across
  77 files. The inspected `main` lacks `functions/api/shopify-webhook.ts`.
  Live receipt, activation, expiry, and revocation remain unverified.
- Pages production deploys automatically from `main`. Approval to merge must
  explicitly cover the resulting production deployment; a preview is not approval.

## Activation sequence — approval required for production changes

1. Reconcile the repository migration filename and test reference with the
   already-applied version above. On the existing AI-Surfer project, inspect
   history/schema and skip reapplication. For a genuinely fresh isolated
   database, review the SQL and obtain approval before applying it. Never target
   the inactive github-mcp-server project.
2. Establish the production member-app host and webhook route. Prepare exact
   domain/routing changes and rollback steps for approval before changing DNS,
   custom domains, or production settings. Both the webhook and same-email login
   journey must reach the reviewed application; do not assume the current
   homepage host serves Pages Functions.
3. Validate locally with signed synthetic fixtures, disposable PostgreSQL/PGlite,
   and mocked auth. A preview integration test must use an isolated database and
   test-only credentials, never production bindings. Obtain approval before
   creating/configuring any remote test environment. Do not create Shopify
   orders, customer records, or real auth accounts for these checks.
4. Identify the intended Shopify subscription owner and signing-secret source.
   After explicit approval, securely add `SHOPIFY_WEBHOOK_SECRET` to Pages
   production using that source's signing secret. Preserve existing Supabase
   bindings. Never put secrets in GitHub, VITE variables, browser code, or chat.
5. Recheck the exact reviewed commit, CI, routing, and database compatibility.
   Obtain explicit approval before merging or deploying production code. Verify
   the deployed endpoint's method/auth rejection behavior without recording any
   order; a 200 HTML response does not establish a working JSON API.
6. After the endpoint is ready, obtain explicit approval to register JSON HTTPS
   subscriptions for `orders/paid`, `orders/cancelled`, and `refunds/create`.
   The proposed destination is `https://otdaisurfer.surf/api/shopify-webhook`;
   use it only after routing is verified. Confirm the actual signing source,
   topics, destination, payload fields, and delivery health. This patch does not
   register subscriptions.
7. Production ignores test orders. Synthetic tests cannot prove the complete live
   purchase path. Obtain separate approval for any specific legitimate paid
   transaction, customer-account use, activation, cancellation, or refund.
   Never place an order or take payment merely to make verification green.
   Until authorized live checks pass, retain NOT LIVE status.
8. With an approved transaction, sign in using a confirmed account with the
   checkout email at `/members/purchases`. Verify that GET leaves activation and
   expiry null, activation grants exactly 720 hours to the matching workspace,
   replay does not extend expiry, and membership tiers/subscriptions do not
   change. Verify cancellation/refund revocation only on the approved transaction;
   exercise expiry and concurrent activation/refund races in isolation.
9. Only after live checks pass, prepare the eight product descriptions and order
   confirmation email for approval. Include the final verified activation URL,
   same-email instructions, expiry, no renewal, and the rule that even a partial
   refund revokes all bonus workspace grants for that order. The proposed link
   `https://otdaisurfer.surf/login?returnTo=%2Fmembers%2Fpurchases` remains
   unverified until routing and login are tested. Preserve manual service
   onboarding instructions and do not mark orders fulfilled on activation.

Unconfigured endpoints fail closed with 503. Failed writes return 503 so Shopify
retries. Monitor delivery health; Shopify retries are finite. Inspect and replay
missed deliveries after recovering an outage. Automatic scheduled reconciliation
and historical order backfill are not included. Do not mark a Shopify service
fulfilled merely because its bonus workspace was activated.

Rollback: remove the three subscriptions/disable the endpoint signing secret;
remove the UI integration via code rollback. Keep the ledger for audit/recovery.
Existing Stripe membership logic is independent.

## Verification

`npm test -- --run` covers HTTP signature/payment/auth boundaries, real SQL
execution in PGlite (PostgreSQL), the signed receipt-to-activation-to-refund flow,
duplicate notifications, exact expiry, denied browser table/RPC access, matching
workspace UI activation and expiry, and existing member routes. PGlite serializes
queries and is not a multi-connection concurrency stress test. Live Shopify,
Cloudflare and Supabase end-to-end delivery remains an activation check.
