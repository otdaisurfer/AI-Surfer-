---
title: "Launch Desk"
description: "Stream an AI SURFER engineering launch plan over Server-Sent Events."
---

# Launch Desk

`POST /api/launch`

Streams an engineering launch plan over **Server-Sent Events (SSE)**.

## Request Body

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

Required:

- `productBrief`
- `audience`
- `launchDate`
- at least one `channels` entry

## Example Request

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

## Stream Format

The endpoint emits SSE messages in this form:

```text
data: {"type":"tool_progress", ...}
```

## Event Types

- `tool_progress` — planning tools start or complete
- `text_delta` — streamed model text
- `final` — completed launch plan
- `error` — the request cannot be completed

## Planning Flow

The preflight phase extracts launch tasks and calculates a readiness score before the agent produces the final plan.

<Note>
  This endpoint is streaming. Clients should process events incrementally and wait for the `final` event rather than assuming the first chunk is the completed result.
</Note>

<Card title="Launch Desk Streaming Recipe" icon="rocket" href="/api/recipes/launch-streaming">
  See a complete client pattern for consuming the stream.
</Card>
