---
title: "AI SURFER API Quickstart"
description: "Make your first AI SURFER API call, save a lead, start an audit, and understand the core workflow in about five minutes."
---

Get from **zero to a working AI SURFER API call in about five minutes**.

<p align="center">
  <img src="https://otdaisurfer.surf/images/ai-surfer-tech-emblem.jpg" alt="Ocean Tide Drop AI SURFER technology emblem" width="420" />
</p>

## 1. Start the API

Install dependencies and run the server using the repository's normal development workflow.

The Express API defaults to:

```text
http://localhost:3001
```

Set a reusable base URL:

```bash
export AI_SURFER_API_BASE="http://localhost:3001"
```

For a deployed environment, replace that value with the protected API origin.

## 2. Check health

```bash
curl "$AI_SURFER_API_BASE/health"
```

A healthy server returns JSON with `status: "ok"` plus configuration flags for OpenAI and Supabase.

## 3. Save your first AI Fin lead

```bash
curl -X POST "$AI_SURFER_API_BASE/api/ai-fin/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "contactName": "Taylor Reed",
    "businessName": "Harbor & Pine",
    "email": "taylor@example.com",
    "website": "https://example.com",
    "industry": "Home Services",
    "primaryProblem": "We lose leads because follow-up is inconsistent.",
    "desiredOutcome": "Respond faster and convert more qualified inquiries.",
    "recommendedProduct": "Sales Rider",
    "recommendedPackage": "Wave Starter",
    "leadStage": "HOT",
    "urgency": "High",
    "systemsUsed": ["Website", "Email"],
    "conversationSummary": "The business needs faster lead response and a consistent follow-up workflow.",
    "source": "ai-fin",
    "consentToFollowUp": true
  }'
```

A successful response returns `201` with:

- `ok: true`
- a generated `leadId`
- a `nextAction` such as `human_review`, `follow_up`, or `begin_onboarding`

## 4. Start an AI Wave / AEO audit

```bash
curl -X POST "$AI_SURFER_API_BASE/api/ai-fin/audit/start" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Harbor & Pine",
    "website": "https://example.com",
    "contactName": "Taylor Reed",
    "email": "taylor@example.com",
    "source": "ai-fin"
  }'
```

A successful response returns an `auditId` and queues the next audit step.

## 5. Route the conversation

Once AI Fin understands the visitor's need, the API supports the next action:

| Goal | Endpoint |
| --- | --- |
| Save a qualified lead | `POST /api/ai-fin/leads` |
| Start an audit | `POST /api/ai-fin/audit/start` |
| Request a person | `POST /api/ai-fin/handoff` |
| Queue follow-up | `POST /api/ai-fin/follow-up` |
| Start onboarding | `POST /api/ai-fin/onboarding` |
| Generate a Launch Desk plan | `POST /api/launch` |

## 6. Understand the funnel

A typical AI SURFER flow looks like this:

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

That mirrors the customer journey:

**DISCOVER → DIAGNOSE → PLAN → IMPLEMENT → TRANSFORM**

## 7. Production checklist

Before exposing write endpoints publicly:

- require an authenticated or otherwise protected API origin;
- restrict CORS to approved origins;
- add rate limiting and abuse protection;
- keep Supabase, Stripe, and OpenAI credentials server-side;
- validate webhook and payment-related requests independently;
- log failures without leaking secrets or customer data.

## Next steps

- [API Reference](/api/reference/index)
- [API Recipes](/api/recipes/index)
- [TypeScript Client](/api/sdk/typescript)
- [API Overview](/api/overview)
- [API README](/api/README)
- [Launch Desk](/docs/knowledge-hub/features/launch-desk)
- [Security Policy](https://github.com/otdaisurfer/AI-Surfer-/blob/main/SECURITY.md)
- [Knowledge Hub](/docs/knowledge-hub/introduction)

**Ride the Wave 🌊 Grow with AI.**
