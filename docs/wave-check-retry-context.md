# Wave Check diagnostic retry correction

## Defect
The initial HubSpot handoff creates a contact and diagnostic note. On failure, the retry queue previously retained only email and receipt ID. A later retry could find/create the contact, mark itself successful, and discard the queued task without ever delivering the score and recommendations.

## Scope
Preserve diagnostic context in an auxiliary D1 table keyed by submission ID. Pass context into the retry path both when HubSpot fails and when no token is configured. Retry contact + note together; remove queue/context only after success. The legacy queue is deliberately untouched; context that was never stored cannot be reconstructed. Explicit context-free enqueues into v2 remain supported.

## Verification
Regression tests use an in-memory SQLite database with a D1-compatible adapter and mocked HTTP. No live contact, email, payment, or database modification is performed. Tests use `node:sqlite`, available in current Node 22 LTS (22.13+ without an experimental flag).

## Release gate
This is not a live-site fix until the exact deployed Wave Check backend is identified. The custom domain may use a separate Sites publication. The new handler and Worker exclusively use `wave_check_hubspot_retry_v2` and `wave_check_hubspot_retry_v2_context`. Legacy Pages and Workers only access the unversioned queue and cannot drain new diagnostic records. Either rollout order preserves new records; until a v2 consumer is running, v2 delivery is delayed. New code never imports, deletes, or replays legacy rows. Old Pages can still produce incomplete legacy records until upgraded, so completing the producer rollout remains necessary. Review D1 storage/retention and table creation before release. Existing stored reports need a separate, approved recovery process; this patch does not replay them.

The queue remains at-least-once: overlapping consumers or a timeout after HubSpot accepts a note can create duplicate notes. This patch does not promise exactly-once delivery. Never replay production records as a test.

Rollback: v2 records remain isolated and pending while old consumers run; retain both v2 tables and restore a v2 consumer to resume delivery. Never rename or copy v2 records into the old queue. Legacy backlog recovery is a separate approved migration after old producers/consumers are retired; no automatic migration is included.

## Separate post-payment work
PR #206 already addresses the Wave Starter HubSpot product/hostname defect. It needs review and a separate Supabase membership-webhook deployment; a Pages deployment does not release it. Identify the account owning live Stripe links before asserting webhook or fulfillment readiness. No paid service should be marked delivered by this patch.

## Review hardening
Queue/context enqueue and cleanup use D1 `batch()` transactions, so a failed second statement rolls back the first rather than leaving an orphan or losing queued delivery. This follows [Cloudflare's batch transaction contract](https://developers.cloudflare.com/d1/worker-api/d1-database/#batch). Tests inject SQLite trigger failures on queue insertion and context deletion to verify rollback. Invalid JSON, scalar/null/array context, wrong receipt IDs, and malformed fields are retained and backed off without contacting HubSpot. Only SQL NULL from a context-free v2 enqueue permits contact-only delivery.

Verification on Node 22.23.5: full suite 74 files / 365 tests passed; Vite production build passed.

## Rolling-upgrade regression
A frozen copy of the baseline retry module (`7e46a873`, test fixture only) executes against the same in-memory database as v2. Tests run legacy drains twice and verify v2 rows/context survive before new consumer delivery, and verify a new consumer leaves the legacy backlog untouched. The legacy implementation is shared by both old Pages and scheduled Worker paths.
