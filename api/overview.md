---
title: "AI SURFER API Overview"
description: "Developer entry point for AI Fin, Wave Check, lead routing, onboarding, Launch Desk, and AI SURFER integrations."
---

# AI SURFER API Overview 🌊

The **Ocean Tide Drop AI SURFER API** powers the technical workflows behind AI Fin, lead capture, audits, follow-up, onboarding, Launch Desk, and connected business automation.

<Tip>
  Start with the **5-minute Quickstart** if you want to make a working call first. Use the API Reference when you already know which endpoint you need.
</Tip>

## What the API Powers

<CardGroup cols={2}>
  <Card title="AI Fin" icon="bot">
    Conversational business guidance, lead qualification, routing, and next-action workflows.
  </Card>

  <Card title="AI Wave Check" icon="wave-square">
    Intake, audit orchestration, opportunity analysis, and report-generation flows.
  </Card>

  <Card title="Lead & Follow-Up" icon="users">
    Lead capture, human handoff, follow-up queues, and sales-routing workflows.
  </Card>

  <Card title="Onboarding" icon="clipboard-check">
    Post-purchase and implementation handoff workflows.
  </Card>

  <Card title="Launch Desk" icon="rocket">
    Release planning, implementation sequencing, and launch operations.
  </Card>

  <Card title="Integrations" icon="plug">
    Connected automation across the AI SURFER stack.
  </Card>
</CardGroup>

## Developer Path

<Steps>
  <Step title="Run the Quickstart">
    Confirm the API is healthy, save a sample lead, and start an audit.
  </Step>

  <Step title="Use the Reference">
    Review request bodies, responses, status codes, and endpoint behavior.
  </Step>

  <Step title="Follow a Recipe">
    Connect individual calls into a complete business workflow.
  </Step>

  <Step title="Use the TypeScript Client">
    Wrap the API in the typed client already included in the repository.
  </Step>
</Steps>

<CardGroup cols={2}>
  <Card title="5-Minute Quickstart" icon="bolt" href="/api/quickstart">
    Make a working API call and follow the core AI SURFER flow.
  </Card>

  <Card title="API Reference" icon="book" href="/api/reference/index">
    Browse the current backend endpoints and conventions.
  </Card>

  <Card title="API Recipes" icon="flask" href="/api/recipes/index">
    Build complete lead, audit, onboarding, and Launch Desk workflows.
  </Card>

  <Card title="TypeScript Client" icon="code" href="/api/sdk/typescript">
    Use the lightweight typed client included with AI SURFER.
  </Card>
</CardGroup>

## Core Business Flow

```text
Conversation
   ↓
Discover the business problem
   ↓
Save lead
   ↓
Audit / Recommendation
   ↓
Follow-up or Human Handoff
   ↓
Onboarding
   ↓
Implementation
```

That technical flow mirrors the customer journey:

**Discover → Diagnose → Plan → Implement → Transform**

## Security Principle

Production write endpoints should be exposed only through an authenticated or otherwise protected boundary, with restricted CORS, rate limiting or abuse protection, and server-side secrets.

<Card title="Deployment Guidance" icon="shield-halved" href="/docs/knowledge-hub/deployment">
  See how AI SURFER verifies production data, payment, AI, and follow-up paths.
</Card>

**Build the workflow. Protect the boundary. Keep the customer journey intact. 🌊**
