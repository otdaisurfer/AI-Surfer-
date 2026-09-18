---
title: "API Reference"
description: "Reference for the current AI SURFER backend endpoints, response patterns, and production conventions."
---

# AI SURFER API Reference 🌊

This reference covers the current server endpoints exposed by the AI SURFER backend.

## Core Endpoints

| Endpoint | Method | Purpose |
| --- | --- | --- |
| [Health](/api/reference/health) | `GET /health` | Check server and integration configuration |
| [Save Lead](/api/reference/leads) | `POST /api/ai-fin/leads` | Save an AI Fin lead and determine the next action |
| [Start Audit](/api/reference/audit-start) | `POST /api/ai-fin/audit/start` | Queue an AI Wave / AEO audit |
| [Human Handoff](/api/reference/handoff) | `POST /api/ai-fin/handoff` | Queue a conversation for human review |
| [Follow-Up](/api/reference/follow-up) | `POST /api/ai-fin/follow-up` | Queue an approved follow-up message |
| [Onboarding](/api/reference/onboarding) | `POST /api/ai-fin/onboarding` | Start the next onboarding step |
| [Launch Desk](/api/reference/launch) | `POST /api/launch` | Stream a launch plan using Launch Desk |

## Conventions

JSON write endpoints expect:

```http
Content-Type: application/json
```

Validation failures return `400`. Server configuration or persistence failures return `500`. Successful AI Fin write operations normally return `201`.

<Warning>
  The current Express server does not add endpoint authentication by itself. Production deployments should protect write routes, restrict CORS, and add abuse protection before exposing them publicly.
</Warning>

<CardGroup cols={2}>
  <Card title="5-Minute Quickstart" icon="bolt" href="/api/quickstart">
    Run the API and make your first calls.
  </Card>
  <Card title="Workflow Recipes" icon="flask" href="/api/recipes/index">
    Connect endpoints into complete business flows.
  </Card>
</CardGroup>

**Business outcome first. API plumbing second. 🌊**
