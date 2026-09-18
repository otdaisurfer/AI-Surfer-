# Recipe: AI Wave / AEO Audit Intake

Use this recipe to move a visitor from a conversation into a queued visibility audit.

## Start the audit

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

## Expected response

```json
{
  "ok": true,
  "status": "started",
  "auditId": "generated-uuid",
  "nextStep": "complete_aeo_audit"
}
```

## When to use `businessIdentifier`

If a visitor does not have a website, send a meaningful `businessIdentifier` instead, such as a business name plus city or another identifier your workflow can use reliably.

At least one of `website` or `businessIdentifier` is required.

## Funnel use

This recipe fits the **DIAGNOSE** stage of the AI SURFER journey:

**DISCOVER → DIAGNOSE → PLAN → IMPLEMENT → TRANSFORM**
