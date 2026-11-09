---
title: "Start Onboarding"
description: "Create an onboarding record and determine whether the requested next step is ready."
---

# Start Onboarding

`POST /api/ai-fin/onboarding`

Creates an onboarding record and determines whether the requested next step is ready.

## Request Body

Required fields:

- `contactName`
- `businessName`
- `email`
- `recommendedProduct`
- `recommendedPackage`
- `nextStepType`

### Accepted Packages

- `Wave Starter`
- `Wave Builder`
- `Tsunami Growth`

### Accepted Next-Step Types

- `checkout`
- `booking`
- `intake_form`
- `human_review`

## Example Request

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

## Success Response

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

## Configuration-Required Response

If checkout is requested but Stripe or package price configuration is missing, the endpoint returns:

- `status: "waiting_configuration"`
- `checkoutStatus: "configuration_required"`

<Note>
  A successful onboarding record does not always mean the commercial next step is ready. Check the returned status and configuration fields before presenting checkout.
</Note>

## Errors

- `400 INVALID_ONBOARDING_PAYLOAD`
- `500 SUPABASE_NOT_CONFIGURED`
- `500 ONBOARDING_SAVE_FAILED`

<Card title="Lead-to-Onboarding Recipe" icon="route" href="/api/recipes/lead-to-onboarding">
  See how onboarding completes the lead workflow.
</Card>
