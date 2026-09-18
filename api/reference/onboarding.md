# Start Onboarding

`POST /api/ai-fin/onboarding`

Creates an onboarding record and determines whether the requested next step is ready.

## Request body

Required fields:

- `contactName`
- `businessName`
- `email`
- `recommendedProduct`
- `recommendedPackage`
- `nextStepType`

Accepted packages: `Wave Starter`, `Wave Builder`, `Tsunami Growth`.

Accepted next-step types: `checkout`, `booking`, `intake_form`, `human_review`.

## Example

```json
{
  "contactName": "Taylor Reed",
  "businessName": "Harbor & Pine",
  "email": "taylor@example.com",
  "recommendedProduct": "Sales Rider",
  "recommendedPackage": "Wave Starter",
  "nextStepType": "checkout"
}
```

## Success response

```json
{
  "ok": true,
  "status": "ready",
  "onboardingId": "generated-uuid",
  "nextStepType": "checkout",
  "checkoutStatus": "ready",
  "url": null,
  "requiresConfiguration": false,
  "checkoutConfiguration": {
    "stripeSecretConfigured": true,
    "packagePriceConfigured": true,
    "requiredPriceEnvironmentVariable": "..."
  }
}
```

If checkout is requested but Stripe or package price configuration is missing, the endpoint returns `status: "waiting_configuration"` and `checkoutStatus: "configuration_required"`.

## Errors

- `400 INVALID_ONBOARDING_PAYLOAD`
- `500 SUPABASE_NOT_CONFIGURED`
- `500 ONBOARDING_SAVE_FAILED`
