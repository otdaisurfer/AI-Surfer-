# Queue Follow-Up

`POST /api/ai-fin/follow-up`

Queues an approved follow-up record for a lead.

## Request body

Required: `contactName`, `email`, `recommendedProduct`, `conversationSummary`, `messageType`, and `consentToFollowUp: true`.

Accepted message types:

- `recommendation_summary`
- `next_steps`
- `human_review_confirmation`

## Example

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

## Success response

```json
{
  "ok": true,
  "status": "queued",
  "messageId": "generated-uuid"
}
```

## Errors

- `400 INVALID_FOLLOW_UP_PAYLOAD`
- `500 SUPABASE_NOT_CONFIGURED`
- `500 FOLLOW_UP_QUEUE_FAILED`
