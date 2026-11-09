---
title: "Start AI Wave / AEO Audit"
description: "Queue a new AI Wave or AEO audit for a business."
---

# Start AI Wave / AEO Audit

`POST /api/ai-fin/audit/start`

Queues a new audit record.

## Request Body

`businessName` is required.

At least one of the following must also be provided:

- `website`
- `businessIdentifier`

Accepted `source` values:

- `homepage_chat`
- `aeo_page`
- `pricing_page`
- `product_page`
- `other`
- `ai-fin`

## Example Request

```bash
curl -X POST "$AI_SURFER_API_BASE/api/ai-fin/audit/start" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Harbor & Pine",
    "website": "https://example.com",
    "contactName": "Taylor Reed",
    "email": "taylor@example.com",
    "source": "ai-fin"
  }'
```

## Success Response

```json
{
  "ok": true,
  "status": "started",
  "auditId": "generated-uuid",
  "nextStep": "complete_aeo_audit"
}
```

## What Happens Next

A successful response means the audit record has been created and the workflow can continue into the deeper audit step.

## Errors

- `400 INVALID_AUDIT_PAYLOAD`
- `500 SUPABASE_NOT_CONFIGURED`
- `500 AUDIT_START_FAILED`

<Card title="Audit Intake Recipe" icon="radar" href="/api/recipes/audit-intake">
  See how audit intake fits into the larger workflow.
</Card>
