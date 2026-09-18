# AI SURFER API Reference 🌊

This reference covers the current server endpoints exposed by the AI SURFER backend.

## Core endpoints

| Endpoint | Method | Purpose |
| --- | --- | --- |
| [Health](./health.md) | `GET /health` | Check server and integration configuration |
| [Save Lead](./leads.md) | `POST /api/ai-fin/leads` | Save an AI Fin lead and determine the next action |
| [Start Audit](./audit-start.md) | `POST /api/ai-fin/audit/start` | Queue an AI Wave / AEO audit |
| [Human Handoff](./handoff.md) | `POST /api/ai-fin/handoff` | Queue a conversation for human review |
| [Follow-Up](./follow-up.md) | `POST /api/ai-fin/follow-up` | Queue an approved follow-up message |
| [Onboarding](./onboarding.md) | `POST /api/ai-fin/onboarding` | Start the next onboarding step |
| [Launch Desk](./launch.md) | `POST /api/launch` | Stream a launch plan using Launch Desk |

## Conventions

JSON write endpoints expect:

```http
Content-Type: application/json
```

Validation failures return `400`. Server configuration or persistence failures return `500`. Successful AI Fin write operations normally return `201`.

The current Express server does not add endpoint authentication by itself. Production deployments should place these write routes behind an authenticated or otherwise protected origin, restrict CORS, and add abuse protection.

## Start here

- [5-minute Quickstart](../quickstart.md)
- [API Overview](../overview.md)
- [Security Policy](../../SECURITY.md)

**Ride the Wave 🌊 Grow with AI.**
