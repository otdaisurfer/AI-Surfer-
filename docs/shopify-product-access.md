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

## Activation sequence (not completed by the code change)

1. Review the migration and run it on the **AI-Surfer** Supabase project
   `mkgnyarwiscttobnytin`. Do not apply it to the paused github-mcp-server project.
   It adds two isolated tables and two service-only RPCs; it does not modify
   `users`, Stripe tables, existing RLS policies, or membership tiers.
2. Add `SHOPIFY_WEBHOOK_SECRET` to the Cloudflare Pages production secret store
   using the signing secret for these Shopify webhooks. Preserve the existing
   `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` values for the same project.
   Never put the secret in GitHub, a VITE variable, browser code, or chat.
3. Deploy the reviewed Pages code. Configure JSON HTTPS subscriptions for
   `orders/paid`, `orders/cancelled`, and `refunds/create`, all pointing to
   `https://otdaisurfer.surf/api/shopify-webhook`. This is a proposed destination
   until deployed and verified; it has not been registered by this patch.
4. Test an isolated signed fixture in preview first. Production rejects test
   orders. For a real paid-order end-to-end check, obtain approval for the
   specific transaction, complete it as the buyer, and verify one pending grant.
   Never place an order, use a customer account, or take payment just to make a
   verification check green.
5. Sign in with the confirmed checkout email at `/members/purchases`. Confirm
   that GET leaves activation/expiry null. Activate the matching workspace;
   confirm exactly 720 hours and no tier/subscription changes. Replay the paid
   event; confirm the expiry is unchanged. Verify refund/cancellation behavior
   on an approved test order and test expiry in preview.
6. Only after the live checks pass, update the eight Shopify descriptions and
   the order confirmation email with the 30-day benefit, activation link
   `https://otdaisurfer.surf/login?returnTo=%2Fmembers%2Fpurchases`, same-email
   instructions, expiry, no renewal, and the bonus-access revocation rule. Do
   not advertise this benefit as live until the connection is active. Preserve
   the manual service onboarding instructions.

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
