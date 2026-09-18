# Health

`GET /health`

Checks whether the API process is running and whether required OpenAI and Supabase environment configuration is present.

## Request

```bash
curl "$AI_SURFER_API_BASE/health"
```

## Example response

```json
{
  "status": "ok",
  "service": "launch-desk-api",
  "openaiConfigured": true,
  "supabaseConfigured": true
}
```

## Response fields

| Field | Type | Meaning |
| --- | --- | --- |
| `status` | string | Server health state |
| `service` | string | Backend service identifier |
| `openaiConfigured` | boolean | Whether an OpenAI API key is present |
| `supabaseConfigured` | boolean | Whether Supabase URL and anon key configuration is present |

This endpoint reports configuration presence, not a full downstream connectivity test.
