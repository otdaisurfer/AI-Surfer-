# AI SURFER Landing Page Funnel Design

Date: 2026-09-13
Repo: `otdaisurfer/AI-Surfer-`
Branch: `feat/landing-funnel`

## Goal

Turn the existing homepage into a clear revenue funnel that moves a visitor from first impression to a free AI Wave Check, then into a relevant paid AI SURFER offer without disrupting existing authentication, members routes, pricing, or AI Fin.

The approved funnel is:

`LAND → CAPTURE → AUDIT → RESULTS → SELL → IMPLEMENT → RETAIN`

The first implementation focuses on the landing-page experience and handoff into the already-existing `/wave-check` route. It does not replace the Wave Check backend or rebuild the members area.

## Current State

The public `/` route renders `src/pages/home/SitesLanding.tsx` through `src/RouterApp.tsx`.

The homepage already contains:

- Ocean Tide Drop AI SURFER branding
- a hero section
- approved homepage imagery and videos
- a seven-stage revenue funnel strip
- a Wave Check CTA
- the AI SURFER product ladder
- members-area CTA
- AI Fin public launcher on `/`

The router already exposes `/wave-check`, `/wave-audit`, `/pricing`, `/members`, and protected audit routes. The implementation should use those existing routes instead of creating duplicate flows.

## Product Strategy

The homepage should sell one primary next action: **Get My Free AI Wave Check™**.

Secondary actions may still expose products and members access, but they must not compete visually with the primary conversion path above the fold.

The homepage message should answer three visitor questions quickly:

1. What does AI SURFER do for my business?
2. What can I do right now without committing to a large purchase?
3. What happens after I complete the free Wave Check?

## Funnel Architecture

### 1. LAND

Purpose: establish relevance and trust in the first screen.

The hero keeps the existing brand identity but shifts emphasis from broad AI services to a concrete business outcome.

Required elements:

- brand promise: save time, get found, and grow with practical AI
- primary CTA: `Get My Free AI Wave Check™`
- secondary CTA: `Explore the Product Wave`
- short trust line
- approved product-ladder or equivalent hero visual

The primary CTA must link to `/wave-check` using an internal route-compatible link rather than hard-coding the production domain.

### 2. CAPTURE

Purpose: make the free Wave Check feel like the beginning of a guided process, not an isolated page.

On the landing page, introduce what the Wave Check will evaluate before the visitor clicks:

- business visibility
- repetitive work
- lead/sales follow-up
- customer support
- automation opportunities

No new lead form is added directly to the homepage in this phase. Lead capture remains inside the Wave Check flow unless the existing Wave Check implementation requires a later enhancement.

### 3. AUDIT

Purpose: hand the visitor into the existing `/wave-check` experience.

The landing page should explain that the Wave Check produces a practical assessment, not generic AI advice.

The homepage must not duplicate audit calculation logic.

### 4. RESULTS

Purpose: explain the value of completing the check before the visitor starts it.

The landing page should preview the type of result a visitor can expect:

- strongest AI opportunity
- visibility or workflow gap
- recommended next step
- recommended AI SURFER product/service

This is a visual preview only. Actual individualized results remain inside the Wave Check/audit flow.

### 5. SELL

Purpose: connect assessment results to AI SURFER products.

The existing product ladder remains on the homepage, but product cards should be framed as the next waves available after diagnosis.

The product section should preserve existing product routes and names. It should not expose protected pages as if they are public purchases. Where a product route requires membership, the CTA copy should clearly indicate that it opens the member experience or pricing path.

### 6. IMPLEMENT

Purpose: show visitors that AI SURFER can help them act on the recommendation.

The homepage should include a concise implementation section explaining that AI SURFER can move from diagnosis to setup through its agents, automations, and service packages.

This section should emphasize outcomes rather than technical architecture.

### 7. RETAIN

Purpose: give existing customers a clear way back into the ecosystem.

Retain the members-area CTA and public AI Fin launcher. The members area is the post-purchase/home-base destination.

## Recommended Page Structure

1. Launch announcement bar
2. Main navigation
3. Revenue-focused hero
4. “How the Wave Check works” three-step strip
5. Wave Check benefit section
6. Results preview section
7. AI SURFER product ladder / product cards
8. Implementation section
9. Members-area retention section
10. Footer

The existing seven-stage funnel strip can remain, but should support the story rather than serve as the only explanation of the funnel.

## Components and File Boundaries

Primary implementation target:

- `src/pages/home/SitesLanding.tsx`
- `src/pages/home/SitesLanding.css`

Tests:

- existing homepage tests in `src/App.homepage.test.ts` and related route tests
- add or update focused tests for homepage CTA paths and key funnel copy

No unrelated refactor of `RouterApp.tsx`, auth, members pages, or audit internals is planned unless tests reveal a direct integration problem.

If `SitesLanding.tsx` becomes too large during implementation, extract focused presentation components under `src/pages/home/components/`, such as:

- `WaveCheckSteps.tsx`
- `ResultsPreview.tsx`
- `ImplementationSection.tsx`

Extraction is allowed only when it improves clarity; avoid component fragmentation for its own sake.

## Routing Rules

- `/` remains the public homepage.
- primary Wave Check CTAs target `/wave-check`.
- pricing CTAs target `/pricing`.
- members CTAs target `/members`.
- do not hard-code `https://otdaisurfer.surf` for internal navigation.
- external links, phone links, and intentionally canonical public-site links may remain absolute where appropriate.

This removes unnecessary environment coupling and lets preview deployments behave correctly.

## Data Flow

This phase is presentation and routing only.

Homepage interaction flow:

`Visitor → CTA → /wave-check → existing audit flow → result/recommendation → existing pricing/member paths`

No new Supabase table, Node endpoint, Stripe webhook, or Firebase integration is introduced in this phase.

Those backend integrations belong to the next implementation cycle after the funnel path is confirmed in production and the exact Wave Check persistence requirements are known.

## Error Handling

Because this phase does not introduce new network calls, error handling is primarily navigational and accessibility focused.

Requirements:

- all internal CTAs must resolve to existing routes
- media must retain poster/fallback behavior
- reduced-motion users must not depend on animation to understand content
- text and CTA meaning must remain understandable if images/videos fail
- protected destinations must not be presented as immediately accessible to anonymous users

## Mobile Requirements

The funnel must be usable on phone-width screens.

Requirements:

- hero CTA stack remains obvious and tappable
- no horizontal overflow in the funnel strip or product grid
- primary CTA appears before large media on narrow screens
- section copy avoids oversized blocks
- interactive targets meet comfortable mobile tap sizing
- videos/images remain responsive and do not push critical CTA content below an excessive first-screen height

## Accessibility Requirements

- semantic section headings in logical order
- descriptive link text
- visible focus states
- descriptive image alt text
- video poster/fallback remains available
- `prefers-reduced-motion` remains respected
- decorative visual elements must not carry essential meaning

## Analytics Readiness

Do not add a new analytics vendor in this phase.

Add stable identifiers or data attributes to the primary CTA and important funnel CTAs where useful so analytics can be attached later without restructuring markup.

Suggested identifiers:

- `data-funnel-cta="hero-wave-check"`
- `data-funnel-cta="midpage-wave-check"`
- `data-funnel-cta="product"`
- `data-funnel-cta="members"`

## Testing

Minimum tests:

1. homepage renders the primary `Get My Free AI Wave Check™` CTA
2. primary CTA resolves to `/wave-check`
3. product section still renders
4. members CTA still resolves to `/members`
5. pricing links still resolve to `/pricing`
6. key funnel stages/copy render without requiring animation
7. existing router tests continue to pass

Manual QA after automated tests:

- desktop layout
- phone layout
- hero CTA visibility
- image/video fallback behavior
- Wave Check navigation
- product links
- members link
- reduced-motion behavior

## Release Strategy

Implement on `feat/landing-funnel`.

Do not modify `main` directly.

After implementation and verification:

1. open a pull request into `main`
2. summarize funnel changes and deployment impact
3. confirm automated checks
4. review mobile and desktop preview
5. merge only after the funnel route is verified

## Out of Scope for This Phase

- new Node backend
- Firebase migration
- new Supabase schema
- Stripe webhook changes
- rebuilding the Wave Check calculation engine
- replacing authentication
- redesigning the members dashboard
- new AI agent runtime
- CRM automation

These can follow once the landing funnel is proven.

## Success Criteria

The implementation is ready when:

- a first-time visitor can understand the offer without scrolling through the entire product catalog
- the dominant action is the free AI Wave Check
- the visitor understands what they receive after the check
- the existing product ecosystem remains discoverable
- the homepage routes correctly in local, preview, and production environments
- existing authentication and members behavior remain unchanged
- automated tests pass
- mobile and desktop layouts are usable and visually consistent with the approved AI SURFER brand
