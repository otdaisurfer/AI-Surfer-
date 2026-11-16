# PR #202 local routing correction

Prepared November 13, 2026, against PR head `a1e55800e9b7c241bd3dec64d5c0e10c29511143`.
The owner approved updating PR #202 and its automatic preview deployment on
November 13. Production merge, deployment, and indexing requests are not authorized.

## Problem and change

`public/_routes.json` limited Pages Functions to `/api/*`, bypassing the existing
page-status handler. Missing pages therefore returned 200. Include page requests
and retain direct delivery of `/assets/*`, `/images/*`, `/icons/*`, `/packages/*`,
and `/product-icons/*`. Exclude the exact `/wave-audit` route so its existing
static 302 redirect continues to run.

Normalize one trailing slash when recognizing exact application routes. Without
this companion change, enabling the handler would incorrectly return 404 for
valid routes such as `/pricing/`, `/services/`, and `/wave-check/`.

## Verification

- Baseline local Pages HTTP check: 54 checks, 8 failures. GET and HEAD for
  `/about`, `/contact`, `/routing-check-missing`, and `/blog/no-such-episode/`
  incorrectly returned 200 instead of 404.
- Regression tests before the handler correction: three failures for valid
  trailing-slash routes, returning 404 instead of 200.
- Corrected local Pages HTTP check: 54 checks, zero failures. Valid public routes,
  application shells, all three journal pages, robots, sitemap, and logo return
  200. Missing pages return 404. Home/reviews redirects retain query strings;
  Wave Audit retains its 302 redirect. HEAD bodies are empty.
- `npm test -- --run`: 73 test files, 357 tests passed.
- `npm run build`: passed.
- `git diff --check`: passed.

Reproduce the runtime check in two terminals sharing the same network namespace:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run build
WRANGLER_SEND_METRICS=false npx --yes wrangler@4.112.0 pages dev dist --ip 127.0.0.1 --port 8788 --inspector-port 0 --compatibility-date 2026-05-20
```

```sh
node scripts/check-pages-routing.mjs
```

The compatibility date is the repository's production date. The installed
workerd binary cannot run the newer top-level date (2026-08-24); no configuration
date was changed. Runtime verification at that newer date remains outstanding.

Existing warnings remain: Vite plugin deprecations and large JS chunk; jsdom
navigation warning during the passing suite; Wrangler ignores the existing
`/* /index.html 200` rule as a loop. Local SPA routing and the explicit fallback
passed despite that warning. The test does not prove browser rendering, paid
access, checkout, or Google indexing. No customer API was invoked.

## Before release

Verify the approved preview deployment's exact HTTP behavior before any
production merge. Keep preview noindex enabled. Production release requires
separate approval.

This change increases Pages Function invocation coverage for HTML requests;
the listed static directories stay excluded. It does not resolve www canonical
duplication or request Google indexing. Production remains unchanged.
