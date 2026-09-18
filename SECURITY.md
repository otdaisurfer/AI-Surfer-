# Security Policy

Ocean Tide Drop AI SURFER treats customer data, credentials, payment configuration, and AI workflow access as sensitive.

## Supported code

Security fixes are applied to the current `main` branch and the production deployment built from it. Older snapshots and abandoned branches are not considered supported releases.

## API protection

The Express backend protects all `/api/*` routes with three controls:

1. **API key authentication** using `AI_SURFER_API_KEY`.
2. **Origin allowlisting** through `AI_SURFER_ALLOWED_ORIGINS`.
3. **Per-process rate limiting** through `AI_SURFER_RATE_LIMIT` and `AI_SURFER_RATE_WINDOW_SECONDS`.

The public `/health` endpoint is intentionally excluded from API-key authentication.

### Production behavior

When `NODE_ENV=production`, API-key protection defaults to required unless `AI_SURFER_REQUIRE_API_KEY=false` is explicitly set.

If protection is required but no `AI_SURFER_API_KEY` is configured, protected routes fail closed with `503 API_SECURITY_NOT_CONFIGURED`.

Requests may authenticate with either:

```http
X-AI-Surfer-Key: <secret>
```

or:

```http
Authorization: Bearer <secret>
```

## Browser clients

Never expose `AI_SURFER_API_KEY` in browser JavaScript, HTML, a public repository, or any `VITE_*` environment variable.

Browser-facing features should call a same-origin server / worker boundary that holds the secret server-side, or use an equivalent authenticated access layer.

CORS is a browser control, not a substitute for authentication.

## Secrets

Server-only secrets include, but are not limited to:

- `AI_SURFER_API_KEY`
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- Supabase service-role credentials
- Cloudflare API and Browser Run tokens

Only publishable keys may use a `VITE_*` prefix.

## Rate limiting

The built-in limiter is intentionally lightweight and process-local. It is useful as a baseline guard, but horizontally scaled production deployments should use a shared rate-limit store or Cloudflare rate-limiting / WAF controls.

## Reporting a vulnerability

Do not publish sensitive vulnerability details in a public issue.

Report suspected security problems privately to the repository owner with:

- the affected route or component;
- clear reproduction steps;
- the potential impact;
- whether credentials or customer information may have been exposed.

Do not include live secrets in the report. Rotate any credential believed to be compromised.
