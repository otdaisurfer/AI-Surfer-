# TypeScript Client 🌊

AI SURFER now includes a lightweight typed TypeScript client at:

```text
src/lib/aiSurferApiClient.ts
```

It wraps the current backend endpoints without adding a separate dependency.

## Import

```ts
import { AiSurferApiClient } from "../../src/lib/aiSurferApiClient";

const api = new AiSurferApiClient({
  baseUrl: "http://localhost:3001",
  apiKey: process.env.AI_SURFER_API_KEY,
});
```

## AI Fin chat

The public / owner chat UI now uses this same typed client internally.

```ts
const result = await api.chatAiFin({
  mode: "public",
  message: "What can AI Surfer help my business automate?",
  conversation: [],
});

console.log(result.answer);
```

Owner Mode can pass a Supabase access token without exposing the protected server API key:

```ts
await api.chatAiFin(
  {
    mode: "owner",
    message: "Show me our current offer positioning.",
    preview: true,
  },
  { accessToken: session.access_token },
);
```

The client deliberately **never attaches `AI_SURFER_API_KEY` to `/api/ai-fin/chat`**. That Pages endpoint has its own public / owner authentication model and is safe for the browser flow.

## Health

```ts
const health = await api.health();
console.log(health.status);
```

## Save a lead

```ts
const lead = await api.saveLead({
  contactName: "Taylor Reed",
  businessName: "Harbor & Pine",
  email: "taylor@example.com",
  primaryProblem: "Lead follow-up is inconsistent.",
  recommendedProduct: "Sales Rider",
  recommendedPackage: "Wave Starter",
  leadStage: "HOT",
  urgency: "High",
  systemsUsed: ["Website", "Email"],
  conversationSummary: "The business needs faster lead response.",
  source: "ai-fin",
  consentToFollowUp: true,
});

console.log(lead.leadId, lead.nextAction);
```

## Start an audit

```ts
const audit = await api.startAudit({
  businessName: "Harbor & Pine",
  website: "https://example.com",
  contactName: "Taylor Reed",
  email: "taylor@example.com",
  source: "ai-fin",
});
```

## Queue follow-up

```ts
await api.queueFollowUp({
  leadId: lead.leadId,
  contactName: "Taylor Reed",
  email: "taylor@example.com",
  recommendedProduct: "Sales Rider",
  recommendedPackage: "Wave Starter",
  conversationSummary: "Sales Rider is the best first move.",
  messageType: "next_steps",
  consentToFollowUp: true,
});
```

## Start onboarding

```ts
await api.startOnboarding({
  leadId: lead.leadId,
  contactName: "Taylor Reed",
  businessName: "Harbor & Pine",
  email: "taylor@example.com",
  recommendedProduct: "Sales Rider",
  recommendedPackage: "Wave Starter",
  nextStepType: "checkout",
});
```

## Stream Launch Desk

```ts
for await (const event of api.streamLaunchPlan({
  productBrief: "Launch a new AI follow-up service for local businesses.",
  audience: "Local business owners",
  launchDate: "2026-10-15",
  constraints: "Small team and mobile-first workflow",
  assets: "Landing page and email list",
  channels: ["website", "email"],
})) {
  console.log(event);
}
```

## Why this exists

The OpenAPI file is the machine-readable source of truth. This client gives the current React / TypeScript app a convenient typed wrapper immediately, while leaving room for generated SDKs later.

For production, point `baseUrl` at the protected API origin and supply `AI_SURFER_API_KEY` only from server-side code.

Do **not** put this key in a `VITE_*` variable or ship it in browser JavaScript. Browser traffic should go through a same-origin backend / worker or another protected server-side boundary.
