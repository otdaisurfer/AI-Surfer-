# AI SURFER Landing Page Funnel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the public AI SURFER homepage into a clear revenue funnel that makes the Free AI Wave Check™ the dominant next action while preserving current products, members access, AI Fin, authentication, and existing routes.

**Architecture:** Keep the current `SitesLanding` page as the public funnel shell and reuse the existing `/wave-check`, `/pricing`, and `/members` routes. Add focused presentation sections for Wave Check steps, result preview, and implementation handoff without introducing new backend state or duplicate audit logic. Use route-relative internal links so local and preview deployments behave like production.

**Tech Stack:** React 19, TypeScript/TSX, React Router DOM 7, Vite 8, Vitest 4, CSS.

**Spec:** `docs/superpowers/specs/2026-09-13-landing-page-funnel-design.md`

## Global Constraints

- `/` remains the public homepage.
- Primary Wave Check CTAs target `/wave-check`.
- Pricing CTAs target `/pricing`.
- Members CTAs target `/members`.
- Do not hard-code `https://otdaisurfer.surf` for internal navigation.
- The dominant action above the fold is `Get My Free AI Wave Check™`.
- No new Node backend, Firebase migration, Supabase schema, Stripe webhook, auth redesign, or Wave Check calculation rewrite in this phase.
- Preserve the existing product ecosystem, members experience, AI Fin launcher, approved homepage media, and reduced-motion support.
- The homepage must remain usable on phone-width screens with no horizontal overflow and obvious tap targets.

---

### Task 1: Lock the funnel contract in homepage tests

**Files:**
- Modify: `src/RouterApp.test.tsx`

**Interfaces:**
- Consumes: `RouterApp` rendered under `MemoryRouter` and `AuthProvider`.
- Produces: regression tests that define the required homepage CTA paths, funnel copy, product visibility, members path, and pricing path.

- [ ] **Step 1: Add a failing test for the primary Wave Check CTA and route-relative navigation**

Add this test inside `describe("shared site branding", ...)`:

```tsx
it("makes the Free AI Wave Check the primary homepage conversion action", () => {
  const html = renderToStaticMarkup(
    <MemoryRouter initialEntries={["/"]}>
      <AuthProvider><RouterApp /></AuthProvider>
    </MemoryRouter>,
  );

  expect(html).toContain("Get My Free AI Wave Check™");
  expect(html).toContain('data-funnel-cta="hero-wave-check"');
  expect(html).toContain('href="/wave-check"');
  expect(html).not.toContain('href="https://otdaisurfer.surf/wave-check"');
});
```

- [ ] **Step 2: Add a failing test for the explanatory funnel sections**

Add:

```tsx
it("explains the Wave Check path from assessment to implementation", () => {
  const html = renderToStaticMarkup(
    <MemoryRouter initialEntries={["/"]}>
      <AuthProvider><RouterApp /></AuthProvider>
    </MemoryRouter>,
  );

  expect(html).toContain("How the Wave Check works");
  expect(html).toContain("See your strongest AI opportunity");
  expect(html).toContain("Get a clear next step");
  expect(html).toContain("Turn the recommendation into action");
  expect(html).toContain('data-funnel-cta="midpage-wave-check"');
});
```

- [ ] **Step 3: Add a failing test for preserved product, pricing, and members destinations**

Add:

```tsx
it("keeps products, pricing, and members connected to the funnel", () => {
  const html = renderToStaticMarkup(
    <MemoryRouter initialEntries={["/"]}>
      <AuthProvider><RouterApp /></AuthProvider>
    </MemoryRouter>,
  );

  expect(html).toContain("THE AI SURFER PRODUCT WAVE");
  expect(html).toContain('href="/pricing"');
  expect(html).toContain('href="/members"');
  expect(html).toContain('data-funnel-cta="members"');
  expect(html).toContain('data-funnel-cta="product"');
});
```

- [ ] **Step 4: Run the focused router test to confirm the new expectations fail**

Run:

```bash
npm test -- src/RouterApp.test.tsx --run
```

Expected: the newly added funnel tests fail because the new copy/data attributes and route-relative links are not all present yet.

- [ ] **Step 5: Commit the test contract**

```bash
git add src/RouterApp.test.tsx
git commit -m "test: define landing funnel conversion contract"
```

---

### Task 2: Build the LAND → CAPTURE → AUDIT → RESULTS homepage flow

**Files:**
- Modify: `src/pages/home/SitesLanding.tsx`

**Interfaces:**
- Consumes: existing `products` array, approved media paths, `/wave-check`, `/pricing`, `/members`, and the existing public AI Fin launcher supplied by `RouterApp`.
- Produces: a route-safe, revenue-focused homepage with stable `data-funnel-cta` identifiers.

- [ ] **Step 1: Remove production-domain coupling from internal homepage routes**

Delete the `LIVE_SITE` prefix from internal navigation targets and use these exact route values:

```tsx
href="/pricing"
href="/wave-check"
href="/members"
```

Keep `tel:` links unchanged. Do not create a new router or navigation abstraction.

- [ ] **Step 2: Strengthen the hero around the Wave Check action**

Keep the existing hero structure and approved product-ladder media, but set the primary action to:

```tsx
<a
  className="button button-primary"
  href="/wave-check"
  data-funnel-cta="hero-wave-check"
>
  Get My Free AI Wave Check™
</a>
```

Keep `Explore the Product Wave` as the secondary CTA and retain the current trust line.

The hero lead must continue to communicate practical outcomes: save time, get found, and grow with AI.

- [ ] **Step 3: Insert the three-step Wave Check explanation after the hero**

Add a section with heading `How the Wave Check works` and three cards using this exact content structure:

```tsx
<section className="wave-check-steps" aria-labelledby="wave-check-steps-title">
  <div className="section-heading">
    <p className="eyebrow">START WITH THE RIGHT WAVE</p>
    <h2 id="wave-check-steps-title">How the Wave Check works</h2>
    <p>Get a practical read on where AI can create the most value in your business before you spend money building the wrong thing.</p>
  </div>
  <div className="wave-check-step-grid">
    <article className="wave-check-step-card">
      <span>01</span>
      <h3>Check the business signals</h3>
      <p>We look at visibility, repetitive work, lead follow-up, customer support, and automation opportunities.</p>
    </article>
    <article className="wave-check-step-card">
      <span>02</span>
      <h3>See your strongest AI opportunity</h3>
      <p>Your result highlights the gap or workflow where AI can make the clearest business impact.</p>
    </article>
    <article className="wave-check-step-card">
      <span>03</span>
      <h3>Get a clear next step</h3>
      <p>We connect the result to the AI SURFER product, service, or implementation path that fits the opportunity.</p>
    </article>
  </div>
</section>
```

- [ ] **Step 4: Expand the current Wave Check section into the CAPTURE/AUDIT handoff**

Keep the section focused on the existing `/wave-check` route. The CTA must be:

```tsx
<a
  className="button button-primary"
  href="/wave-check"
  data-funnel-cta="midpage-wave-check"
>
  Start My Free Wave Check →
</a>
```

The section copy must state that the check evaluates business visibility and operational AI opportunities and produces practical next steps, without claiming a new backend capability.

- [ ] **Step 5: Add a RESULTS preview section before the product catalog**

Add:

```tsx
<section className="results-preview" aria-labelledby="results-preview-title">
  <div className="section-heading">
    <p className="eyebrow">KNOW WHAT TO DO NEXT</p>
    <h2 id="results-preview-title">Your Wave Check turns AI possibilities into a decision.</h2>
    <p>Instead of generic AI advice, the result points you toward the business opportunity worth acting on first.</p>
  </div>
  <div className="results-preview-grid">
    <article>
      <span>Strongest opportunity</span>
      <h3>Find the highest-value wave</h3>
      <p>See whether visibility, follow-up, support, content, or workflow automation deserves attention first.</p>
    </article>
    <article>
      <span>Business gap</span>
      <h3>Understand what is slowing growth</h3>
      <p>See the visibility or workflow gap behind the recommendation in plain business language.</p>
    </article>
    <article>
      <span>Recommended action</span>
      <h3>Move from diagnosis to action</h3>
      <p>Get a clear next step and the AI SURFER product or service that matches it.</p>
    </article>
  </div>
</section>
```

- [ ] **Step 6: Add stable funnel identifiers to product and members CTAs**

For every product CTA, add:

```tsx
data-funnel-cta="product"
```

For the members-area button, add:

```tsx
data-funnel-cta="members"
```

Keep product names, stages, approved media, and existing product destinations intact.

- [ ] **Step 7: Add an IMPLEMENT section before membership retention**

Add:

```tsx
<section className="implementation-path" aria-labelledby="implementation-path-title">
  <div>
    <p className="eyebrow">FROM RECOMMENDATION TO REAL WORK</p>
    <h2 id="implementation-path-title">Turn the recommendation into action.</h2>
    <p>AI SURFER can help move from diagnosis into practical setup with focused agents, automations, visibility work, and service packages built around the business problem you found first.</p>
  </div>
  <a className="button button-secondary" href="/pricing">See Implementation Options →</a>
</section>
```

- [ ] **Step 8: Run the focused router test**

```bash
npm test -- src/RouterApp.test.tsx --run
```

Expected: the three new funnel tests pass and the previously existing homepage/router tests remain green.

- [ ] **Step 9: Commit the funnel markup**

```bash
git add src/pages/home/SitesLanding.tsx src/RouterApp.test.tsx
git commit -m "feat: build landing page revenue funnel"
```

---

### Task 3: Style the funnel for desktop, phone, focus, and reduced motion

**Files:**
- Modify: `src/pages/home/SitesLanding.css`

**Interfaces:**
- Consumes: `.wave-check-steps`, `.wave-check-step-grid`, `.wave-check-step-card`, `.results-preview`, `.results-preview-grid`, and `.implementation-path` markup from Task 2.
- Produces: responsive styling that matches the current AI SURFER visual system without altering route behavior.

- [ ] **Step 1: Add Wave Check step layout styles**

Add styles following the existing section widths and color variables:

```css
.sites-landing .wave-check-steps,
.sites-landing .results-preview {
  max-width: 1184px;
  margin: 0 auto 110px;
  padding: 0 28px;
}

.sites-landing .wave-check-step-grid,
.sites-landing .results-preview-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.sites-landing .wave-check-step-card,
.sites-landing .results-preview-grid article {
  min-height: 240px;
  padding: 28px;
  border: 1px solid rgba(24,238,241,.24);
  border-radius: 24px;
  background: linear-gradient(145deg, rgba(10,31,51,.94), rgba(6,13,25,.98));
  box-shadow: 0 22px 62px rgba(0,0,0,.28);
}

.sites-landing .wave-check-step-card span,
.sites-landing .results-preview-grid article > span {
  color: var(--cyan);
  font-size: .7rem;
  font-weight: 950;
  letter-spacing: .14em;
  text-transform: uppercase;
}

.sites-landing .wave-check-step-card h3,
.sites-landing .results-preview-grid h3 {
  margin: 18px 0 12px;
  color: var(--ink);
  font-size: 1.2rem;
}

.sites-landing .wave-check-step-card p,
.sites-landing .results-preview-grid p {
  margin: 0;
  color: var(--muted);
  line-height: 1.7;
}
```

- [ ] **Step 2: Add implementation-section styling**

```css
.sites-landing .implementation-path {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 36px;
  max-width: 1120px;
  margin: 0 auto 112px;
  padding: 44px 48px;
  border: 1px solid rgba(142,85,255,.34);
  border-radius: 32px;
  background: radial-gradient(circle at 10% 0%, rgba(24,238,241,.12), transparent 34%), linear-gradient(135deg, #0b1d34, #120a28);
}

.sites-landing .implementation-path h2 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.5rem);
}

.sites-landing .implementation-path p:not(.eyebrow) {
  max-width: 720px;
  color: var(--muted);
  line-height: 1.7;
}
```

- [ ] **Step 3: Add visible keyboard focus treatment**

```css
.sites-landing a:focus-visible {
  outline: 3px solid var(--gold);
  outline-offset: 4px;
}
```

- [ ] **Step 4: Extend the existing mobile media query**

Inside the page's phone/tablet breakpoint, add rules equivalent to:

```css
.sites-landing .wave-check-step-grid,
.sites-landing .results-preview-grid {
  grid-template-columns: 1fr;
}

.sites-landing .implementation-path {
  flex-direction: column;
  align-items: stretch;
  margin-right: 20px;
  margin-left: 20px;
  padding: 34px 24px;
}

.sites-landing .implementation-path .button {
  width: 100%;
}
```

Also verify the existing `.hero`, `.revenue-funnel-track`, `.product-grid`, `.wave-check`, and `.nav-shell` mobile rules do not cause horizontal overflow.

- [ ] **Step 5: Preserve reduced-motion behavior**

Do not introduce new required animation. Confirm the existing `@media (prefers-reduced-motion: reduce)` rule still disables decorative product-card animation and that all newly added sections remain understandable when motion is disabled.

- [ ] **Step 6: Run focused tests and build**

```bash
npm test -- src/RouterApp.test.tsx --run
npm run build
```

Expected: both commands exit successfully.

- [ ] **Step 7: Commit responsive funnel styles**

```bash
git add src/pages/home/SitesLanding.css
git commit -m "style: polish landing funnel across screen sizes"
```

---

### Task 4: Verify the funnel as a release candidate

**Files:**
- Verify: `src/pages/home/SitesLanding.tsx`
- Verify: `src/pages/home/SitesLanding.css`
- Verify: `src/RouterApp.test.tsx`
- Verify: `src/RouterApp.tsx`

**Interfaces:**
- Consumes: all changes from Tasks 1-3.
- Produces: a branch ready for pull request review with no backend or auth behavior changes.

- [ ] **Step 1: Run the complete automated test suite**

```bash
npm test -- --run
```

Expected: all Vitest tests pass.

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: exits with code 0. If the repository already contains unrelated baseline lint failures, record the exact pre-existing failures and confirm no new failures originate from `SitesLanding.tsx`, `SitesLanding.css`, or `RouterApp.test.tsx`.

- [ ] **Step 3: Run the production build**

```bash
npm run build
```

Expected: Vite completes the production build successfully.

- [ ] **Step 4: Perform desktop manual QA**

Run:

```bash
npm run dev
```

Verify at `/`:

- the hero shows `Get My Free AI Wave Check™` before the product catalog
- hero CTA opens `/wave-check`
- the three-step Wave Check section reads in order
- results preview is visible before product cards
- product card actions still render
- implementation section appears before the members section
- members CTA opens `/members`
- pricing links open `/pricing`
- AI Fin still launches on `/`
- approved images/videos still render or show their existing fallbacks

- [ ] **Step 5: Perform phone-width manual QA**

At approximately 390px viewport width verify:

- no horizontal page overflow
- primary hero CTA is visible before large media
- CTA tap targets remain comfortably sized
- Wave Check step cards stack in one column
- results cards stack in one column
- implementation CTA spans the available width
- revenue funnel/product areas remain readable

- [ ] **Step 6: Verify reduced-motion behavior**

Enable `prefers-reduced-motion: reduce` in browser devtools and verify product cards stop floating while the funnel content remains fully understandable.

- [ ] **Step 7: Review the final diff for scope discipline**

Run:

```bash
git diff main...HEAD -- src/pages/home/SitesLanding.tsx src/pages/home/SitesLanding.css src/RouterApp.test.tsx docs/superpowers/specs/2026-09-13-landing-page-funnel-design.md docs/superpowers/plans/2026-09-13-landing-page-funnel.md
```

Confirm there are no backend, auth, members-dashboard, Stripe, Supabase-schema, or unrelated routing changes.

- [ ] **Step 8: Commit any QA-only corrections**

If QA required a correction, commit only those files:

```bash
git add src/pages/home/SitesLanding.tsx src/pages/home/SitesLanding.css src/RouterApp.test.tsx
git commit -m "fix: finalize landing funnel QA"
```

If no correction was required, do not create an empty commit.

- [ ] **Step 9: Open the pull request**

Open a PR from `feat/landing-funnel` into `main` titled:

```text
Build AI SURFER landing page revenue funnel
```

PR summary must state:

- primary homepage action is now the Free AI Wave Check™
- internal homepage routes are environment-safe
- Wave Check steps/results/implementation story was added
- product, members, AI Fin, auth, and backend behavior were preserved
- automated test, lint, build, desktop, phone, and reduced-motion verification results
