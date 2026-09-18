---
title: "Human Handoff"
description: "Queue an AI Fin conversation for human review when automation should stop or escalate."
---

# Human Handoff

`POST /api/ai-fin/handoff`

Queues a visitor conversation for human review.

## Request Body

Required fields:

- `contactName`
- `businessName`
- `email`
- `reason`
- `conversationSummary`
- `urgency`
- `consentToFollowUp: true`

### Accepted Reasons

- `custom_pricing`
- `complex_scope`
- `enterprise`
- `regulated_industry`
- `legal_or_contract_question`
- `uncertain_scope`
- `visitor_requested_person`
- `other`

### Urgency

`Normal`, `High`, or `Immediate`

## Example Request

```json
{
  "contactName": "Taylor Reed",
  "businessName": "Harbor & Pine",
  "email": "taylor@example.com",
  "reason": "complex_scope",
  "recommendedProduct": "Big Kahuna",
  "conversationSummary": "Multiple workflows need coordinated implementation.",
  "urgency": "High",
  "consentToFollowUp": true
}
```

## Success Response

```json
{
  "ok": true,
  "status": "queued",
  "reviewId": "generated-uuid",
  "priority": "High"
}
```

<Tip>
  Use human handoff when the request is complex, sensitive, outside the approved automation path, or when the visitor explicitly asks for a person.
</Tip>

<Warning>
  Preserve the visitor's real follow-up consent. A handoff should not manufacture permission to contact someone.
</Warning>

## Errors

- `400 INVALID_HANDOFF_PAYLOAD`
- `500 SUPABASE_NOT_CONFIGURED`
- `500 HANDOFF_QUEUE_FAILED`

<Card title="Lead-to-Onboarding Recipe" icon="route" href="/api/recipes/lead-to-onboarding">
  See where human review fits in the full lead workflow.
</Card>
