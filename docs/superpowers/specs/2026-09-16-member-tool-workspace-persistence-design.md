# Member Tool Workspace Persistence Design

Date: 2026-09-16
Status: Proposed, user-approved architecture pending written-spec review

## Goal

Persist each signed-in member's Members Tool Dock inputs and generated results so work survives page refreshes, browser restarts, and later logins, while preserving the current session-only experience for signed-out visitors.

## Scope

This first persistence release includes:

- Save the shared member-tool inputs: business, audience, goal, and offer.
- Save tool-specific numeric inputs used by Revenue Tide Planner and Friday Revenue Scorecard.
- Save the latest generated result for each tool.
- Restore saved state when a signed-in member opens a tool.
- Show a simple save state in the UI: Saving..., Saved ✓, or Save failed.
- Keep signed-out usage unchanged and session-only.
- Enforce per-user isolation with Supabase Row Level Security.

This release does not include folders, result version history, collaboration, exports, admin browsing, or multi-workspace naming.

## Existing Architecture Reused

The implementation reuses the existing browser Supabase client in `src/lib/supabase.ts`, the current Supabase authentication session, and the existing `MemberToolDock` / `memberTools` flow. No service-role key is used in the browser and no parallel persistence system is introduced.

## Data Model

Add a `member_tool_workspaces` table.

Suggested schema:

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
```

`tool_id` stores the existing `MemberToolId` value. Numeric-looking inputs remain text because the current form state stores them as strings and validation/calculation already happens in the generator layer.

## Row Level Security

Enable RLS and restrict every operation to the current authenticated user.

```sql
alter table public.member_tool_workspaces enable row level security;

create policy "members can read own tool workspaces"
on public.member_tool_workspaces
for select
using (auth.uid() = user_id);

create policy "members can insert own tool workspaces"
on public.member_tool_workspaces
for insert
with check (auth.uid() = user_id);

create policy "members can update own tool workspaces"
on public.member_tool_workspaces
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "members can delete own tool workspaces"
on public.member_tool_workspaces
for delete
using (auth.uid() = user_id);
```

The unique `(user_id, tool_id)` constraint allows a single upsert target per member/tool while preventing duplicate current-state rows.

## Client Persistence Layer

Add a focused helper module, for example `src/pages/members/memberToolWorkspace.ts`, responsible for database translation and nothing else.

Responsibilities:

- Get the current authenticated user ID from the existing Supabase session.
- Load one saved workspace by `tool_id` for the current user.
- Upsert one saved workspace after a successful generation.
- Convert between Supabase snake_case fields and the existing `MemberToolInput` shape.
- Return explicit success/failure results so the UI can display status without crashing the tool.

The UI should not embed raw Supabase queries throughout `MemberToolDock.tsx`.

## Load Flow

When a member opens a tool:

1. `MemberToolDock` keeps the existing local state immediately available.
2. If there is no authenticated Supabase user, no persistence request is made.
3. If a user is authenticated, load the saved workspace for the selected `tool_id`.
4. If a saved row exists, replace the current tool input fields and result with the saved values.
5. If no row exists, retain the current shared in-memory values so the connected-tool handoff still works.
6. If loading fails, keep the tool usable and display a small non-blocking restore warning.

This preserves the current fast workflow and avoids making database availability a prerequisite for using a tool.

## Save Flow

Persistence happens after a successful `generateMemberToolResult` call.

1. Generate the result locally exactly as today.
2. Show the result immediately.
3. If signed out, stop there.
4. If signed in, set save status to `Saving...`.
5. Upsert the current tool's inputs plus generated result using `(user_id, tool_id)`.
6. On success, show `Saved ✓`.
7. On failure, keep the generated result visible and show `Save failed. Your result is still available on this page.`

Generation must never be rolled back because a persistence request fails.

## Shared-Input Handoff Behavior

The existing connected workflow remains intact:

`Offer Wave → Revenue Tide → Content Wave → Sales Script → Sales Page → Lead Magnet → Friday Revenue Scorecard`

When a user presses the current `Continue to...` control:

- Shared in-memory fields carry forward immediately as they do now.
- Opening the destination tool loads its own saved workspace only if one exists.
- A saved destination workspace takes precedence over blank/default values, but it must not silently overwrite new shared values when the user has just advanced in the same active session.

Implementation rule: during a direct `Continue to...` handoff, preserve the active session's shared fields and restore only destination-specific fields/result from persistence. During a fresh page visit or manual tool open, restore the full saved workspace.

This avoids the confusing case where a member updates an offer, advances to the next tool, and sees older persisted shared details reappear.

## Authentication Changes

No new login system is introduced. The persistence layer uses the current Supabase auth session.

Behavior:

- Authenticated member: save/restore enabled.
- Signed-out visitor: existing session-only behavior.
- Expired session: treat as signed out, keep the tool functional, and do not expose or reuse another user's saved data.

## UI Changes

In `MemberToolDock`:

- Add a small persistence status near the result controls.
- Status values: `Saving...`, `Saved ✓`, `Save failed`, and optional `Restored from your workspace`.
- Keep `Copy Result` unchanged.
- `Start Over` resets local state only in this first release. It does not delete the stored workspace.

A future explicit `Delete Saved Workspace` action can be added separately. Avoid coupling destructive persistence behavior to the existing local reset control.

## Error Handling

Persistence errors are non-blocking.

- Tool generation continues to work without Supabase.
- Restore failure leaves current local data untouched.
- Save failure leaves the generated result visible.
- Authentication lookup failure is treated as signed-out behavior unless it indicates a programmer/configuration error.
- No raw database error text is shown to members.

Useful errors can be logged to the existing client logging path if one is already available, but logging is not required to ship this release.

## Migration

Add one idempotent Supabase SQL migration under the repository's existing `supabase/migrations` convention. The migration creates the table, indexes/constraints, RLS, and policies.

If an `updated_at` trigger pattern already exists in the repo, reuse it. Otherwise update `updated_at` explicitly in each upsert rather than introducing a new global trigger framework for this feature.

## Testing Strategy

### Persistence helper tests

Cover:

- Loads a saved workspace for an authenticated user.
- Returns no saved workspace when none exists.
- Upserts the expected `user_id`, `tool_id`, inputs, and generated result.
- Maps snake_case database fields to `MemberToolInput` correctly.
- Does not issue persistence writes when there is no authenticated user.
- Surfaces save/load failure as a controlled result rather than throwing into the UI.

### MemberToolDock tests

Cover:

- Signed-out generation behaves exactly as before.
- Authenticated saved workspace restores when opening a tool from a fresh state.
- Successful generation shows the result before persistence completes.
- Successful save shows `Saved ✓`.
- Failed save leaves the generated result visible and shows a non-blocking save error.
- Direct `Continue to...` handoff preserves newly entered shared fields even if the destination has older saved shared values.
- Destination-specific fields can still restore during a direct handoff.

### Migration/security verification

Verify:

- RLS is enabled.
- A user can select/insert/update/delete only rows where `user_id = auth.uid()`.
- A different authenticated user cannot read or modify another member's workspace row.

### Regression gate

Run the full existing test suite and the production Vite build. Existing 11 tools and the connected workflow must remain green.

## Files Expected to Change

Likely implementation files:

- `supabase/migrations/<timestamp>_member_tool_workspaces.sql`
- `src/pages/members/memberToolWorkspace.ts`
- `src/pages/members/memberToolWorkspace.test.ts`
- `src/pages/members/MemberToolDock.tsx`
- `src/pages/members/MemberToolDock.test.tsx`

Existing auth/Supabase client files should be reused, not rewritten, unless implementation reveals a concrete incompatibility.

## Security and Privacy Notes

- Never place a Supabase service-role key in browser code.
- RLS is mandatory before client access ships.
- `user_id` always comes from the authenticated Supabase user, never from editable form input.
- The first release stores only tool inputs and generated business content. It does not intentionally add payment data, passwords, tokens, or full card data.
- Workspace rows are deleted automatically if the corresponding auth user is deleted because of `on delete cascade`.

## Acceptance Criteria

The feature is complete when:

1. A signed-in member generates a result, refreshes the page, reopens the same tool, and sees the saved workspace restored.
2. A signed-in member can move through the connected tool workflow without losing newly entered shared business details.
3. A signed-out user can still use all member tools without persistence errors.
4. A save or restore outage does not block generation.
5. RLS prevents one authenticated user from accessing another user's workspace rows.
6. All existing tests pass and the production Vite build succeeds.
