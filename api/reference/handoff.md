# Human Handoff

`POST /api/ai-fin/handoff`

Queues a visitor conversation for human review.

## Request body

Required: `contactName`, `businessName`, `email`, `reason`, `conversationSummary`, `urgency`, and `consentToFollowUp: true`.

Accepted reasons:

- `custom_pricing`
- `complex_scope`
- `enterprise`
- `regulated_industry`
- `legal_or_contract_question`
- `uncertain_scope`
- `visitor_requested_person`
- `other`

Urgency: `Normal`, `High`, or `Immediate`.

## Example

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

## Success response

```json
{
  "ok": true,
  "status": "queued",
  "reviewId": "generated-uuid",
  "priority": "High"
}
```

## Errors

- `400 INVALID_HANDOFF_PAYLOAD`
- `500 SUPABASE_NOT_CONFIGURED`
- `500 HANDOFF_QUEUE_FAILED`
