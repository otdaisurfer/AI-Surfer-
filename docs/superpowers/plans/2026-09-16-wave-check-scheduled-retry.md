# Wave Check Scheduled HubSpot Retry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated Cloudflare Cron Worker that retries due Wave Check HubSpot handoffs every five minutes without touching the customer response path.

**Architecture:** Extract the HubSpot sync and D1 retry queue logic from the Pages Function into a shared server module. Keep the Pages Function responsible for validating/saving the Wave Check and scheduling background CRM work, while a new Worker imports the same queue drain function from the shared module and runs it from a `scheduled()` handler against the existing D1 database.

**Tech Stack:** TypeScript, Cloudflare Pages Functions, Cloudflare Workers, D1, Wrangler 4.112.0, Vitest, HubSpot CRM API.

**Spec:** `docs/superpowers/specs/2026-09-16-wave-check-scheduled-retry-design.md`

## Global Constraints

- Supabase remains the canonical Wave Check lead store.
- Customer report completion must never depend on the scheduled Worker.
- Use the existing `OTDAISURFER` D1 database.
- Use Cron expression `*/5 * * * *`.
- Keep `HUBSPOT_ACCESS_TOKEN` as a Worker secret and never commit its value.
- Keep the existing three-second HubSpot timeout and six-hour retry-backoff cap.
- The Worker must expose no functional public retry endpoint.
- Do not claim scheduled retries are live until deployment, secret, D1 binding, and Cron activation are verified.

---

### Task 1: Extract Shared HubSpot Retry Logic

**Files:**
- Create: `src/server/wave-check/hubspotRetry.ts`
- Modify: `functions/api/wave-check-submit.ts`
- Test: `functions/api/wave-check-submit.test.ts`

**Interfaces:**
- Consumes: Cloudflare-compatible D1 object exposing `prepare(query)` and statements exposing `bind()`, `run()`, `first()`, and optional `all()`.
- Produces: `syncHubSpotContact(email: string, accessToken?: string, timeoutMs?: number): Promise<HubSpotSyncStatus>`, `enqueueHubSpotRetry(db: D1Like, email: string, submissionId: string): Promise<void>`, `drainHubSpotRetryQueue(db: D1Like | undefined, accessToken?: string, timeoutMs?: number): Promise<void>`.

- [ ] **Step 1: Write a regression test proving the Pages path still queues HubSpot work without making inline HubSpot calls**

In `functions/api/wave-check-submit.test.ts`, preserve the existing background-handoff test and strengthen it to assert that only the Supabase request occurs before the response is returned:

```ts
it("keeps HubSpot off the customer response path", async () => {
  const fetchMock = vi.fn().mockResolvedValueOnce(new Response(null, { status: 201 }));
  vi.stubGlobal("fetch", fetchMock);
  const backgroundHandoff = vi.fn();

  const response = await handleWaveCheckSubmit(
    request(),
    "hubspot-token",
    3000,
    undefined,
    backgroundHandoff,
  );

  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({
    status: "saved",
    hubspotStatus: "queued",
  });
  expect(backgroundHandoff).toHaveBeenCalledWith(
    "surfer@example.com",
    submission.submission_id,
  );
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 2: Run the focused Pages Function test before extraction**

Run:

```bash
npx vitest --run functions/api/wave-check-submit.test.ts
```

Expected: PASS. This is a characterization test that protects the already-correct customer path during extraction.

- [ ] **Step 3: Create the shared retry module**

Create `src/server/wave-check/hubspotRetry.ts` with these constants and exports:

```ts
const HUBSPOT_API_BASE = "https://api.hubapi.com/crm/v3/objects";
export const DEFAULT_HUBSPOT_TIMEOUT_MS = 3000;
const RETRY_BASE_SECONDS = 60;
const RETRY_MAX_SECONDS = 21600;
const RETRY_BATCH_SIZE = 5;

export type HubSpotSyncStatus = "synced" | "not_configured" | "failed";

export type D1StatementLike = {
  bind: (...values: unknown[]) => D1StatementLike;
  run: () => Promise<unknown>;
  first: <T>() => Promise<T | null>;
  all?: <T>() => Promise<{ results?: T[] }>;
};

export type D1Like = {
  prepare: (query: string) => D1StatementLike;
};
```

Move the existing `hubSpotRequest`, `syncHubSpotContact`, retry-table creation, enqueue, and drain logic from `functions/api/wave-check-submit.ts` into this module without changing semantics. Keep retry delay calculation:

```ts
const attempts = row.attempts + 1;
const delay = Math.min(
  RETRY_BASE_SECONDS * (2 ** attempts),
  RETRY_MAX_SECONDS,
);
```

- [ ] **Step 4: Update the Pages Function to import the shared module**

At the top of `functions/api/wave-check-submit.ts`, import:

```ts
import {
  DEFAULT_HUBSPOT_TIMEOUT_MS,
  type D1Like,
  drainHubSpotRetryQueue,
  enqueueHubSpotRetry,
  syncHubSpotContact,
} from "../../src/server/wave-check/hubspotRetry";
```

Delete the duplicate HubSpot/retry implementations from the Pages Function. Keep `runBackgroundHubSpotHandoff` local because it coordinates Pages `waitUntil()` behavior:

```ts
async function runBackgroundHubSpotHandoff(
  db: D1Like | undefined,
  email: string,
  submissionId: string,
  accessToken?: string,
  timeoutMs = DEFAULT_HUBSPOT_TIMEOUT_MS,
) {
  const status = await syncHubSpotContact(email, accessToken, timeoutMs);
  if (status === "failed" && db) {
    await enqueueHubSpotRetry(db, email, submissionId);
  }
  await drainHubSpotRetryQueue(db, accessToken, timeoutMs);
}
```

- [ ] **Step 5: Run the focused Pages Function test after extraction**

Run:

```bash
npx vitest --run functions/api/wave-check-submit.test.ts
```

Expected: PASS with the same customer behavior and HubSpot response statuses.

- [ ] **Step 6: Commit the extraction**

```bash
git add src/server/wave-check/hubspotRetry.ts functions/api/wave-check-submit.ts functions/api/wave-check-submit.test.ts
git commit -m "refactor: share Wave Check HubSpot retry logic"
```

### Task 2: Add the Scheduled Retry Worker With TDD

**Files:**
- Create: `src/worker/waveCheckRetry.ts`
- Create: `src/worker/waveCheckRetry.test.ts`

**Interfaces:**
- Consumes: `drainHubSpotRetryQueue(db, accessToken)` from Task 1.
- Produces: default Worker export with `scheduled(controller, env, ctx): Promise<void>` and `fetch(): Promise<Response>`.

- [ ] **Step 1: Write the failing scheduler test**

Create `src/worker/waveCheckRetry.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import worker from "./waveCheckRetry";

vi.mock("../server/wave-check/hubspotRetry", () => ({
  drainHubSpotRetryQueue: vi.fn().mockResolvedValue(undefined),
}));

import { drainHubSpotRetryQueue } from "../server/wave-check/hubspotRetry";

describe("waveCheckRetry worker", () => {
  it("drains due HubSpot retries from the scheduled event", async () => {
    const pending: Promise<unknown>[] = [];
    const db = { prepare: vi.fn() };
    const env = {
      OTDAISURFER: db,
      HUBSPOT_ACCESS_TOKEN: "hubspot-token",
    };
    const ctx = {
      waitUntil(promise: Promise<unknown>) {
        pending.push(promise);
      },
    };

    await worker.scheduled({} as ScheduledController, env as never, ctx as never);
    await Promise.all(pending);

    expect(drainHubSpotRetryQueue).toHaveBeenCalledWith(db, "hubspot-token");
  });

  it("does not expose a public retry trigger", async () => {
    const response = await worker.fetch();
    expect(response.status).toBe(404);
  });
});
```

- [ ] **Step 2: Run the scheduler test and verify RED**

Run:

```bash
npx vitest --run src/worker/waveCheckRetry.test.ts
```

Expected: FAIL because `src/worker/waveCheckRetry.ts` does not exist.

- [ ] **Step 3: Implement the minimal Worker**

Create `src/worker/waveCheckRetry.ts`:

```ts
import {
  drainHubSpotRetryQueue,
  type D1Like,
} from "../server/wave-check/hubspotRetry";

type Env = {
  OTDAISURFER: D1Like;
  HUBSPOT_ACCESS_TOKEN?: string;
};

export default {
  async scheduled(
    _controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    if (!env.HUBSPOT_ACCESS_TOKEN) return;
    ctx.waitUntil(
      drainHubSpotRetryQueue(
        env.OTDAISURFER,
        env.HUBSPOT_ACCESS_TOKEN,
      ),
    );
  },

  async fetch(): Promise<Response> {
    return new Response("Not Found", { status: 404 });
  },
};
```

- [ ] **Step 4: Run the scheduler test and verify GREEN**

Run:

```bash
npx vitest --run src/worker/waveCheckRetry.test.ts
```

Expected: PASS for scheduled drain and 404 public fetch behavior.

- [ ] **Step 5: Run both Wave Check and scheduler tests together**

Run:

```bash
npx vitest --run functions/api/wave-check-submit.test.ts src/worker/waveCheckRetry.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit the Worker**

```bash
git add src/worker/waveCheckRetry.ts src/worker/waveCheckRetry.test.ts
git commit -m "feat: add scheduled Wave Check HubSpot retry worker"
```

### Task 3: Configure the Worker and Deployment Scripts

**Files:**
- Create: `wrangler.wave-check-retry.jsonc`
- Modify: `package.json`

**Interfaces:**
- Consumes: `src/worker/waveCheckRetry.ts` and existing D1 database ID `6c3651bc-03b9-4d2a-9c66-76b19ffc016d`.
- Produces: Wrangler config and npm scripts for validation/deployment.

- [ ] **Step 1: Create the Worker Wrangler config**

Create `wrangler.wave-check-retry.jsonc`:

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "ai-surfer-wave-check-retry",
  "main": "src/worker/waveCheckRetry.ts",
  "compatibility_date": "2026-08-25",
  "observability": {
    "enabled": true
  },
  "triggers": {
    "crons": ["*/5 * * * *"]
  },
  "d1_databases": [
    {
      "binding": "OTDAISURFER",
      "database_name": "OTDAISURFER",
      "database_id": "6c3651bc-03b9-4d2a-9c66-76b19ffc016d"
    }
  ]
}
```

Do not put `HUBSPOT_ACCESS_TOKEN` in this file.

- [ ] **Step 2: Add package scripts using the repository's Wrangler version**

Add to `package.json` scripts:

```json
"worker:retry:dev": "npx wrangler@4.112.0 dev --remote --config wrangler.wave-check-retry.jsonc",
"worker:retry:deploy": "npx wrangler@4.112.0 deploy --config wrangler.wave-check-retry.jsonc",
"worker:retry:check": "npx wrangler@4.112.0 deploy --dry-run --config wrangler.wave-check-retry.jsonc"
```

- [ ] **Step 3: Validate the Worker bundle without deploying**

Run:

```bash
npm run worker:retry:check
```

Expected: Wrangler exits successfully and reports a dry-run bundle for `ai-surfer-wave-check-retry` with D1 binding `OTDAISURFER` and Cron `*/5 * * * *`.

- [ ] **Step 4: Run the full test suite and app build**

Run:

```bash
npm test -- --run
npm run build
```

Expected: all tests PASS and Vite build PASS.

- [ ] **Step 5: Commit Worker configuration**

```bash
git add wrangler.wave-check-retry.jsonc package.json package-lock.json
git commit -m "chore: configure scheduled HubSpot retry worker"
```

### Task 4: Document Production Activation and Verify the PR

**Files:**
- Create: `docs/runbooks/wave-check-hubspot-retry-worker.md`

**Interfaces:**
- Consumes: Worker config and scripts from Task 3.
- Produces: exact production activation and verification procedure.

- [ ] **Step 1: Add the deployment runbook**

Create `docs/runbooks/wave-check-hubspot-retry-worker.md` with these commands and checks:

```markdown
# Wave Check HubSpot Retry Worker

## One-time secret setup

Run locally from an authenticated Wrangler session:

```bash
npx wrangler@4.112.0 secret put HUBSPOT_ACCESS_TOKEN --config wrangler.wave-check-retry.jsonc
```

Paste the existing HubSpot private-app access token when Wrangler prompts. Never place the token in the repository, shell history, screenshots, or documentation.

## Deploy

```bash
npm run worker:retry:deploy
```

## Verify

Confirm in Cloudflare that Worker `ai-surfer-wave-check-retry` has:

- D1 binding `OTDAISURFER`
- secret `HUBSPOT_ACCESS_TOKEN`
- Cron Trigger `*/5 * * * *`
- observability enabled

A successful source merge does not prove these runtime settings are active.
```

- [ ] **Step 2: Re-run verification before opening the PR**

Run:

```bash
npx vitest --run functions/api/wave-check-submit.test.ts src/worker/waveCheckRetry.test.ts
npm test -- --run
npm run build
npm run worker:retry:check
```

Expected: all commands PASS.

- [ ] **Step 3: Review the final diff for secret leakage**

Run:

```bash
git diff main...HEAD -- . ':!package-lock.json'
```

Verify no HubSpot token value, bearer credential, or new sensitive key is present.

- [ ] **Step 4: Commit the runbook**

```bash
git add docs/runbooks/wave-check-hubspot-retry-worker.md
git commit -m "docs: add HubSpot retry worker runbook"
```

- [ ] **Step 5: Open a focused draft PR**

PR title:

```text
Run Wave Check HubSpot retries on a schedule
```

PR body must state:
- customer path remains independent of the scheduler
- schedule is every five minutes
- the Worker shares existing D1 retry state
- `HUBSPOT_ACCESS_TOKEN` is a runtime secret
- source verification results
- production activation is not considered complete until Worker deployment, secret, binding, and Cron are verified

- [ ] **Step 6: Promote and merge only after all required GitHub gates are green**

Required gates:
- CI Pipeline
- Code Quality
- CodeQL Security Scan
- Security Scanning
- Verify Cloudflare Pages Build

If any gate fails, inspect the exact job logs, fix the root cause, rerun verification, and do not merge until fresh evidence is green.
