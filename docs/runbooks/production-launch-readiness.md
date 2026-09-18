# Production Launch Readiness 🌊

Use this private check immediately before opening the funnel to customers.

## Endpoint

`POST /api/launch-readiness`

Authenticate with the existing private site-health key:

```http
Authorization: Bearer <SITE_HEALTH_API_KEY>
```

The endpoint never returns secret values. It checks:

- OpenAI server binding is present
- HubSpot server binding is present
- Supabase points to the connected **AI-Surfer** project
- the `wave_starter_intakes` table is reachable with the server service role
- the live Wave Starter Stripe Payment Link is active
- Stripe returns customers to the verified Wave Starter success path

## Ready response

A launch-ready environment returns:

```json
{
  "ok": true,
  "status": "ready",
  "blockers": []
}
```

If `status` is `blocked`, do not call the funnel launch-ready. Fix the named blocker and run the check again.

## Required production secrets

- `OPENAI_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `HUBSPOT_ACCESS_TOKEN`
- `SITE_HEALTH_API_KEY`

Keep every value server-side. Never place any of these in a `VITE_*` variable or browser bundle.

## Final customer-path rehearsal

After the private readiness check is green, verify:

1. Homepage loads.
2. Free AI Wave Check opens and saves a test submission.
3. AI Fin returns a recommendation and its CTA works.
4. Wave Starter opens the live $497 Stripe checkout.
5. Do **not** create a real charge just for QA.
6. Use automated tests plus a real customer purchase to validate the paid return path.
7. Confirm the verified success page exposes the kickoff intake.
8. Confirm the intake creates the Supabase onboarding handoff.
9. Confirm HubSpot receives the customer/payment handoff through the live webhook.

A launch is complete only when the private readiness check is green and the customer path has no critical blocker.
