---
title: "Health"
description: "Check whether the AI SURFER API is running and whether required OpenAI and Supabase configuration is present."
---

# Health

`GET /health`

Checks whether the API process is running and whether required OpenAI and Supabase environment configuration is present.

## Request

```bash
curl "$AI_SURFER_API_BASE/health"
```

## Example Response

```json
{
  "status": "ok",
  "service": "launch-desk-api",
  "openaiConfigured": true,
  "supabaseConfigured": true
}
```

## Response Fields

| Field | Type | Meaning |
| --- | --- | --- |
| `status` | string | Server health state |
| `service` | string | Backend service identifier |
| `openaiConfigured` | boolean | Whether an OpenAI API key is present |
| `supabaseConfigured` | boolean | Whether Supabase URL and anon key configuration is present |

<Note>
  This endpoint reports configuration presence. It does not prove that every downstream service is reachable or healthy.
</Note>

## When to Use It

Use this endpoint for:

- deployment smoke tests
- uptime checks
- confirming required environment variables are present
- quickly separating configuration problems from application-flow problems

<Card title="Back to API Reference" icon="book" href="/api/reference/index">
  Browse the rest of the AI SURFER endpoints.
</Card>
