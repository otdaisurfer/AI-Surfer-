---
title: "Launch Desk Streaming Client"
description: "Consume the Launch Desk Server-Sent Events stream safely from cURL or browser code."
---

# Launch Desk Streaming Client 🚀🌊

Launch Desk returns **Server-Sent Events (SSE)**, so the client should process a stream instead of waiting for one JSON response.

The pattern is:

**Request → Preflight → Progress Events → Text Deltas → Final Plan**

## cURL

Use `-N` so cURL does not buffer the stream.

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

## Browser Example

```js
const response = await fetch("/api/launch", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    productBrief: "Launch a new AI follow-up service for local businesses.",
    audience: "Local business owners",
    launchDate: "2026-10-15",
    constraints: "Small team and mobile-first workflow",
    assets: "Landing page and email list",
    channels: ["website", "email"]
  })
});

if (!response.ok || !response.body) {
  throw new Error("Launch Desk request failed");
}

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { value, done } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value, { stream: true });
  console.log(chunk);
}
```

## Event Types

- `tool_progress` — preflight or planning work started/completed
- `text_delta` — incremental generated plan text
- `final` — complete launch plan
- `error` — the stream cannot complete successfully

## Client Behavior

A production client should:

- process chunks incrementally
- preserve partial text across chunks
- distinguish event types
- stop only after `final` or `error`
- surface meaningful failures to the user
- avoid assuming each network chunk contains exactly one complete SSE event

<Warning>
  Network chunks and SSE events are not guaranteed to align one-to-one. A robust client should parse the SSE framing rather than treating every raw chunk as a complete event.
</Warning>

## Preflight Phase

The stream begins with preflight work that can include:

- launch-task extraction
- readiness scoring
- planning-tool progress

The final launch plan arrives after that groundwork.

<CardGroup cols={2}>
  <Card title="Launch Desk Reference" icon="rocket" href="/api/reference/launch">
    Review request fields and event types.
  </Card>
  <Card title="TypeScript Client" icon="code" href="/api/sdk/typescript">
    Use the existing typed client for streaming Launch Desk.
  </Card>
</CardGroup>
