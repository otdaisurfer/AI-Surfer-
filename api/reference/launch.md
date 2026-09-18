# Launch Desk

`POST /api/launch`

Streams an engineering launch plan over Server-Sent Events (SSE).

## Request body

```json
{
  "productBrief": "A product brief of at least 20 characters.",
  "audience": "Target audience",
  "launchDate": "2026-10-15",
  "constraints": "Optional constraints",
  "assets": "Optional available assets",
  "channels": ["website", "email"]
}
```

`productBrief`, `audience`, `launchDate`, and at least one `channels` entry are required.

## Example

```bash
curl -N -X POST "$AI_SURFER_API_BASE/api/launch" \
  -H "Content-Type: application/json" \
  -d '{
    "productBrief": "Launch a new AI follow-up service for local businesses.",
    "audience": "Local business owners",
    "launchDate": "2026-10-15",
    "constraints": "Small team and mobile-first workflow",
    "assets": "Landing page and email list",
    "channels": ["website", "email"]
  }'
```

## Stream events

The endpoint emits SSE messages in the form:

```text
data: {"type":"tool_progress", ...}
```

Event types include:

- `tool_progress` when planning tools start or complete
- `text_delta` for streamed model text
- `final` with the completed launch plan
- `error` when the request cannot be completed

The preflight phase extracts launch tasks and calculates a readiness score before the agent produces the final plan.
