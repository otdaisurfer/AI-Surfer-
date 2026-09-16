# Member Tool Workspace Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist each signed-in member's Members Tool Dock inputs and latest generated result per tool so work survives refreshes and later logins without breaking signed-out usage or the existing connected workflow.

**Architecture:** Add one RLS-protected Supabase table keyed by `(user_id, tool_id)`, one focused client persistence helper that translates between database rows and `MemberToolInput`, and a thin UI integration in `MemberToolDock`. Generation stays local-first and immediate; persistence is best-effort and non-blocking. Direct `Continue to...` handoffs preserve the current shared fields while restoring only destination-specific persisted state.

**Tech Stack:** React 19, TypeScript 5.9, Vite 8, Vitest 4, Supabase JS 2.110, PostgreSQL/Supabase RLS.

**Spec:** `docs/superpowers/specs/2026-09-16-member-tool-workspace-persistence-design.md`

## Global Constraints

- Reuse the existing browser Supabase client in `src/lib/supabase.ts`.
- Never use a Supabase service-role key in browser code.
- RLS must be enabled before client persistence ships.
- `user_id` must come from the authenticated Supabase user, never form input.
- Signed-out users must retain the current session-only workflow.
- Save/load failures must never block local result generation.
- `Start Over` resets local state only in this release; it does not delete stored workspace rows.
- Preserve all 11 existing member tools and the current connected workflow.

---

### Task 1: Add the RLS-Protected Workspace Table

**Files:**
- Create: `supabase/migrations/20260916_member_tool_workspaces.sql`

**Interfaces:**
- Produces: table `public.member_tool_workspaces` with unique `(user_id, tool_id)` and authenticated-user-only CRUD policies.

- [ ] **Step 1: Write the migration with table, unique constraint, and RLS policies**

```sql
create table if not exists public.member_tool_workspaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_id text not null,
  business text not null default '',
  audience text not null default '',
  goal text not null default '',
  offer text not null default '',
  monthly_revenue_goal text not null default '',
  average_sale text not null default '',
  recurring_price text not null default '',
  qualified_conversations text not null default '',
  leads text not null default '',
  one_time_sales text not null default '',
  recurring_customers text not null default '',
  weekly_revenue text not null default '',
  generated_result text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, tool_id)
);

alter table public.member_tool_workspaces enable row level security;

drop policy if exists "members can read own tool workspaces" on public.member_tool_workspaces;
create policy "members can read own tool workspaces"
on public.member_tool_workspaces for select
using (auth.uid() = user_id);

drop policy if exists "members can insert own tool workspaces" on public.member_tool_workspaces;
create policy "members can insert own tool workspaces"
on public.member_tool_workspaces for insert
with check (auth.uid() = user_id);

drop policy if exists "members can update own tool workspaces" on public.member_tool_workspaces;
create policy "members can update own tool workspaces"
on public.member_tool_workspaces for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "members can delete own tool workspaces" on public.member_tool_workspaces;
create policy "members can delete own tool workspaces"
on public.member_tool_workspaces for delete
using (auth.uid() = user_id);
```

- [ ] **Step 2: Verify the migration is idempotent and contains all four CRUD policies**

Run a repository text check or Supabase migration validation available in the environment. Confirm the table has RLS enabled and `(user_id, tool_id)` is unique.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260916_member_tool_workspaces.sql
git commit -m "feat: add member tool workspace persistence table"
```

---

### Task 2: Build the Persistence Helper with TDD

**Files:**
- Create: `src/pages/members/memberToolWorkspace.ts`
- Create: `src/pages/members/memberToolWorkspace.test.ts`
- Read: `src/lib/supabase.ts`
- Read: `src/pages/members/memberTools.ts`

**Interfaces:**
- Consumes: `supabase`, `MemberToolId`, `MemberToolInput`.
- Produces:
  - `loadMemberToolWorkspace(toolId: MemberToolId): Promise<MemberToolWorkspaceLoadResult>`
  - `saveMemberToolWorkspace(toolId: MemberToolId, input: MemberToolInput, generatedResult: string): Promise<MemberToolWorkspaceSaveResult>`
  - exported mapping helpers only if tests need direct coverage.

Use result types instead of throwing into the UI:

```ts
export type MemberToolWorkspaceLoadResult =
  | { status: "signed-out" }
  | { status: "empty" }
  | { status: "loaded"; input: MemberToolInput; generatedResult: string }
  | { status: "error" };

export type MemberToolWorkspaceSaveResult =
  | { status: "signed-out" }
  | { status: "saved" }
  | { status: "error" };
```

- [ ] **Step 1: Write failing tests for signed-out behavior, row mapping, load, save, and controlled errors**

Mock `src/lib/supabase.ts`. Cover:

```ts
it("does not query workspaces when signed out", async () => { /* expect status signed-out */ });
it("maps a saved database row into MemberToolInput", async () => { /* expect loaded input/result */ });
it("returns empty when the authenticated user has no saved row", async () => { /* expect empty */ });
it("upserts the authenticated user id, tool id, inputs, result, and updated_at", async () => { /* expect saved */ });
it("returns error instead of throwing when load fails", async () => { /* expect error */ });
it("returns error instead of throwing when save fails", async () => { /* expect error */ });
```

- [ ] **Step 2: Run helper tests and verify they fail**

Run:

```bash
npm test -- --run src/pages/members/memberToolWorkspace.test.ts
```

Expected: FAIL because the helper module/functions do not exist yet.

- [ ] **Step 3: Implement the minimal helper**

Use `supabase.auth.getUser()` to obtain the current user. Query only the authenticated user's row for the requested `tool_id`, and upsert with:

```ts
.onConflict("user_id,tool_id")
```

Persist `updated_at: new Date().toISOString()` explicitly. Convert snake_case database columns to the existing camelCase `MemberToolInput` fields.

- [ ] **Step 4: Run helper tests and verify they pass**

```bash
npm test -- --run src/pages/members/memberToolWorkspace.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/members/memberToolWorkspace.ts src/pages/members/memberToolWorkspace.test.ts
git commit -m "feat: add member tool workspace persistence helper"
```

---

### Task 3: Restore Saved Workspaces in MemberToolDock

**Files:**
- Modify: `src/pages/members/MemberToolDock.tsx`
- Modify: `src/pages/members/MemberToolDock.test.tsx`

**Interfaces:**
- Consumes: `loadMemberToolWorkspace`.
- Produces: restore status UI and fresh-open/manual-open restore behavior without breaking direct handoff state.

- [ ] **Step 1: Add failing tests for restore behavior**

Mock `memberToolWorkspace.ts` and add tests that prove:

```ts
it("restores a saved workspace when a signed-in member manually opens a tool", async () => { /* saved inputs + result appear */ });
it("keeps local data when restore fails", async () => { /* tool remains usable + non-blocking warning */ });
it("does not replace current shared fields with older saved values during a direct Continue to handoff", async () => { /* current four shared values survive */ });
```

For the direct-handoff case, allow destination-specific persisted values/result to restore while keeping `business`, `audience`, `goal`, and `offer` from the active session.

- [ ] **Step 2: Run dock tests and verify they fail**

```bash
npm test -- --run src/pages/members/MemberToolDock.test.tsx
```

Expected: FAIL on missing restore behavior/status.

- [ ] **Step 3: Implement minimal restore state**

Add UI state such as:

```ts
type PersistenceStatus = "idle" | "restoring" | "restored" | "saving" | "saved" | "save-error" | "restore-error";
```

Track whether `openTool` came from a direct workflow handoff versus a manual card open. On manual/fresh open, apply the full saved input/result. On direct handoff, merge only destination-specific fields/result from the saved row and keep the current shared fields.

- [ ] **Step 4: Render non-blocking restore status**

Display `Restored from your workspace` or a small restore warning near the result controls. Never use `role="alert"` for a normal successful restore.

- [ ] **Step 5: Run dock tests and verify they pass**

```bash
npm test -- --run src/pages/members/MemberToolDock.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/pages/members/MemberToolDock.tsx src/pages/members/MemberToolDock.test.tsx
git commit -m "feat: restore saved member tool workspaces"
```

---

### Task 4: Save Successful Results Without Blocking Generation

**Files:**
- Modify: `src/pages/members/MemberToolDock.tsx`
- Modify: `src/pages/members/MemberToolDock.test.tsx`

**Interfaces:**
- Consumes: `saveMemberToolWorkspace`.
- Produces: immediate local result display plus `Saving...`, `Saved ✓`, or `Save failed` status.

- [ ] **Step 1: Add failing tests for save timing and failure behavior**

Add tests proving:

```ts
it("shows the generated result before the persistence promise resolves", async () => { /* result visible while status Saving... */ });
it("shows Saved ✓ after a successful authenticated save", async () => { /* saved status */ });
it("keeps the generated result visible when persistence fails", async () => { /* result remains + Save failed */ });
it("keeps signed-out generation behavior unchanged", async () => { /* no persistence error/status required */ });
```

- [ ] **Step 2: Run dock tests and verify they fail**

```bash
npm test -- --run src/pages/members/MemberToolDock.test.tsx
```

Expected: FAIL because generation is not yet wired to persistence.

- [ ] **Step 3: Implement save after local generation**

Inside `generate()`:

1. Call `generateMemberToolResult` synchronously.
2. Set the local result immediately.
3. Start persistence asynchronously.
4. Set status to `saving` only for authenticated saves.
5. Resolve to `saved`, `save-error`, or signed-out/no-status behavior.

Do not clear the generated result on persistence failure.

- [ ] **Step 4: Render save status beside result controls**

Use exact member-facing strings:

- `Saving...`
- `Saved ✓`
- `Save failed. Your result is still available on this page.`

- [ ] **Step 5: Run dock tests and verify they pass**

```bash
npm test -- --run src/pages/members/MemberToolDock.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/pages/members/MemberToolDock.tsx src/pages/members/MemberToolDock.test.tsx
git commit -m "feat: save generated member tool workspaces"
```

---

### Task 5: Security and Regression Verification

**Files:**
- Verify: `supabase/migrations/20260916_member_tool_workspaces.sql`
- Verify: all member persistence/tool files

**Interfaces:**
- Produces: evidence that the feature meets the spec and does not regress the existing member workflow.

- [ ] **Step 1: Run focused persistence and dock tests**

```bash
npm test -- --run src/pages/members/memberToolWorkspace.test.ts src/pages/members/MemberToolDock.test.tsx src/pages/members/memberTools.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run the full test suite**

```bash
npm test -- --run
```

Expected: PASS.

- [ ] **Step 3: Run the production build**

```bash
npm run build
```

Expected: Vite build succeeds.

- [ ] **Step 4: Verify migration security manually or against Supabase**

Confirm:

- RLS is enabled on `public.member_tool_workspaces`.
- SELECT, INSERT, UPDATE, DELETE policies all require `auth.uid() = user_id`.
- Two authenticated users cannot read or mutate each other's rows.
- No browser file imports or references a service-role key.

- [ ] **Step 5: Verify acceptance flow**

For one signed-in test member:

1. Open a member tool.
2. Enter shared inputs and generate a result.
3. Confirm `Saved ✓`.
4. Refresh the page.
5. Reopen the same tool and confirm inputs/result restore.
6. Advance with `Continue to...` and confirm current shared inputs remain unchanged.
7. Sign out and confirm tools still generate locally without persistence errors.

- [ ] **Step 6: Commit any verification-only fixes, then record final evidence**

```bash
git status --short
git log -5 --oneline
```

Only claim completion after the focused tests, full suite, build, and security checks above have fresh passing evidence.
