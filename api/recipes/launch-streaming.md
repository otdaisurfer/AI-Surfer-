# Recipe: Launch Desk Streaming Client

Launch Desk returns Server-Sent Events (SSE), so the client should process a stream instead of waiting for one JSON response.

## cURL

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

## Browser example

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

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value, { stream: true });
  console.log(chunk);
}
```

## Event types

- `tool_progress`
- `text_delta`
- `final`
- `error`

The stream begins with preflight work, including task extraction and launch-readiness scoring, then moves into the generated plan.
