---
title: "TypeScript Client"
description: "Use the lightweight typed AI SURFER API client included in the repository."
---

# TypeScript Client 🌊

AI SURFER includes a lightweight typed TypeScript client at:

```text
src/lib/aiSurferApiClient.ts
```

It wraps the current backend endpoints without adding a separate package dependency.

## Import

```ts
import { AiSurferApiClient } from "../../src/lib/aiSurferApiClient";

const api = new AiSurferApiClient({
  baseUrl: "http://localhost:3001",
  apiKey: process.env.AI_SURFER_API_KEY,
});
```

## Common Operations

<CardGroup cols={2}>
  <Card title="Health" icon="activity">
    Verify the API and integration configuration.
  </Card>
  <Card title="Lead Capture" icon="user-plus">
    Save qualified AI Fin leads and receive the recommended next action.
  </Card>
  <Card title="Audit" icon="radar">
    Start an AI Wave or AEO audit.
  </Card>
  <Card title="Launch Desk" icon="rocket">
    Stream launch planning events through the typed client.
  </Card>
</CardGroup>

## Health

```ts
const health = await api.health();
console.log(health.status);
```

## Save a Lead

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

## Start an Audit

```ts
const audit = await api.startAudit({
  businessName: "Harbor & Pine",
  website: "https://example.com",
  contactName: "Taylor Reed",
  email: "taylor@example.com",
  source: "ai-fin",
});
```

## Queue Follow-Up

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

## Start Onboarding

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

## Production Safety

<Warning>
  Keep `AI_SURFER_API_KEY` server-side. Do not place it in a `VITE_*` variable or ship it in browser JavaScript.
</Warning>

Browser traffic should go through a same-origin backend, worker, or another protected server-side boundary.

The OpenAPI file remains the machine-readable API source of truth. This client provides a convenient typed wrapper for the current React and TypeScript application.
