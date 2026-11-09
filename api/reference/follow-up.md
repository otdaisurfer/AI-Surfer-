---
title: "Queue Follow-Up"
description: "Queue an approved follow-up record for an AI Fin lead."
---

# Queue Follow-Up

`POST /api/ai-fin/follow-up`

Queues an approved follow-up record for a lead.

## Request Body

Required fields:

- `contactName`
- `email`
- `recommendedProduct`
- `conversationSummary`
- `messageType`
- `consentToFollowUp: true`

### Accepted Message Types

- `recommendation_summary`
- `next_steps`
- `human_review_confirmation`

## Example Request

```json
{
  "contactName": "Taylor Reed",
  "email": "taylor@example.com",
  "recommendedProduct": "Sales Rider",
  "recommendedPackage": "Wave Starter",
  "conversationSummary": "Lead follow-up is the highest-priority opportunity.",
  "messageType": "next_steps",
  "consentToFollowUp": true
}
```

## Success Response

```json
{
  "ok": true,
  "status": "queued",
  "messageId": "generated-uuid"
}
```

<Warning>
  Queue follow-up only when the visitor has consented. This endpoint records the workflow action; downstream delivery should preserve the same consent boundary.
</Warning>

## Errors

- `400 INVALID_FOLLOW_UP_PAYLOAD`
- `500 SUPABASE_NOT_CONFIGURED`
- `500 FOLLOW_UP_QUEUE_FAILED`

<Card title="Lead-to-Onboarding Recipe" icon="route" href="/api/recipes/lead-to-onboarding">
  See follow-up in the complete lead workflow.
</Card>
