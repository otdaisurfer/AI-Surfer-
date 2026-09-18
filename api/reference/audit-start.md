# Start AI Wave / AEO Audit

`POST /api/ai-fin/audit/start`

Queues a new audit record.

## Request body

`businessName` is required. At least one of `website` or `businessIdentifier` must also be provided.

Accepted `source` values:

`homepage_chat`, `aeo_page`, `pricing_page`, `product_page`, `other`, `ai-fin`.

## Example

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

## Success response

```json
{
  "ok": true,
  "status": "started",
  "auditId": "generated-uuid",
  "nextStep": "complete_aeo_audit"
}
```

## Errors

- `400 INVALID_AUDIT_PAYLOAD`
- `500 SUPABASE_NOT_CONFIGURED`
- `500 AUDIT_START_FAILED`
