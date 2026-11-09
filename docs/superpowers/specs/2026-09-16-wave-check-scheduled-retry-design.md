# Wave Check Scheduled HubSpot Retry Design

## Goal
Ensure failed Wave Check HubSpot handoffs are retried even when no new customer traffic reaches the site.

## Current State
The Wave Check submission path saves the canonical lead to Supabase first, then returns the customer report without waiting on HubSpot. Production schedules the HubSpot handoff with Cloudflare Pages `waitUntil()`. Failed HubSpot handoffs are persisted in the existing D1 database and retried opportunistically during later background Wave Check handoffs with exponential backoff capped at six hours.

## Chosen Architecture
Add a separate, minimal Cloudflare Worker dedicated to scheduled CRM retry processing. The Worker shares the existing `OTDAISURFER` D1 database with the Pages application and uses the same HubSpot access token secret. A Cron Trigger invokes the Worker's `scheduled()` handler every five minutes. The scheduled handler drains only due retry jobs and does not participate in customer requests.

This keeps the customer-facing Pages path independent from the scheduler while reusing the existing retry table and retry semantics.

## Components

### Shared HubSpot retry module
Create `src/server/wave-check/hubspotRetry.ts` as the single home for HubSpot contact sync, retry-table management, enqueue behavior, backoff calculation, and queue draining. Both the Pages Function and scheduled Worker import this module so the retry rules cannot drift between runtimes.

The module will export:
- `syncHubSpotContact(email, accessToken, timeoutMs?)`
- `enqueueHubSpotRetry(db, email, submissionId)`
- `drainHubSpotRetryQueue(db, accessToken, timeoutMs?)`
- D1-compatible types used by both runtimes

The existing behavior remains unchanged:
- search HubSpot by normalized email before creating a contact
- treat an existing contact as success
- create a lead contact only when none exists
- use a three-second HubSpot request timeout
- preserve exponential retry backoff capped at six hours
- delete a retry job only after successful HubSpot synchronization

### Scheduled Worker
Create `src/worker/waveCheckRetry.ts` with a Cloudflare Worker module export containing `scheduled(_controller, env, ctx)`.

Environment contract:
- `OTDAISURFER`: existing D1 database binding
- `HUBSPOT_ACCESS_TOKEN`: Worker secret

The handler calls `ctx.waitUntil(drainHubSpotRetryQueue(...))` so the Cron event remains lightweight while Cloudflare keeps the retry work alive to completion.

No public HTTP route is required for this Worker. A minimal `fetch()` response may return 404 so accidental requests do not expose retry data or provide a manual trigger surface.

### Worker configuration
Create `wrangler.wave-check-retry.jsonc` with:
- a distinct Worker name, `ai-surfer-wave-check-retry`
- `main` set to `src/worker/waveCheckRetry.ts`
- the same compatibility family already used by the repository
- the production D1 binding pointing at the existing `OTDAISURFER` database
- Cron trigger `*/5 * * * *`
- observability enabled

`HUBSPOT_ACCESS_TOKEN` remains a Wrangler secret and must not be committed to source control or config.

### Package scripts
Add focused scripts to `package.json`:
- `worker:retry:dev`
- `worker:retry:deploy`

These scripts use the repository's pinned Wrangler 4.112.0 invocation pattern and the new config file.

## Customer Path Invariant
The scheduled Worker must never be required for a customer to receive their Wave Check report. Supabase remains the canonical lead store. If HubSpot is unavailable, the customer report still completes after the Supabase save and the retry job remains recoverable in D1.

## Failure Behavior
- Missing HubSpot secret: scheduled handler exits without deleting jobs.
- Empty queue: scheduled handler completes without HubSpot calls.
- HubSpot timeout, 429, or 5xx: retry job remains and its next attempt is moved forward according to the existing backoff.
- Existing HubSpot contact: retry job is deleted as synchronized.
- New HubSpot contact created successfully: retry job is deleted.
- D1 failure: the scheduled execution fails visibly in Worker logs; no retry job is intentionally deleted on an unconfirmed database operation.

## Security and Privacy
- No raw client IP data is added by this subsystem.
- Retry storage contains only submission ID, normalized email, attempt count, and retry timestamps already required for CRM delivery.
- The HubSpot token is a Worker secret, never a committed variable.
- The scheduled Worker exposes no functional public retry endpoint.

## Verification
Implementation is complete only when:
- the new scheduler test fails before implementation for the expected missing-worker behavior
- the scheduler test passes after implementation
- existing Wave Check tests continue passing
- full repository tests pass
- Vite build passes
- Wrangler validates the scheduled Worker configuration with a dry-run or equivalent build command
- Code Quality, CodeQL, Security Scanning, and Cloudflare Pages verification remain green on the PR

## Deployment Boundary
Merging source code does not by itself prove the new Worker is deployed with its production secret. Deployment requires the Worker to be created with the D1 binding, `HUBSPOT_ACCESS_TOKEN` secret, and Cron Trigger active. The PR must document that deployment step explicitly and must not claim scheduled retries are live until those deployment conditions are verified.
