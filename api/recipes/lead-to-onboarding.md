---
title: "Lead → Follow-Up → Onboarding"
description: "Turn an AI Fin conversation into a saved lead, follow-up action, and onboarding path."
---

# Lead → Follow-Up → Onboarding 🌊

This recipe turns an AI Fin conversation into a complete next-step workflow.

The pattern is:

**Conversation → Save Lead → Route Next Action → Follow-Up or Human Review → Onboarding**

<Tip>
  Keep the workflow driven by the lead stage returned by the API. Do not force every lead directly into checkout.
</Tip>

## 1. Save the Lead

```bash
curl -X POST "$AI_SURFER_API_BASE/api/ai-fin/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "contactName": "Taylor Reed",
    "businessName": "Harbor & Pine",
    "email": "taylor@example.com",
    "primaryProblem": "Lead follow-up is inconsistent.",
    "recommendedProduct": "Sales Rider",
    "recommendedPackage": "Wave Starter",
    "leadStage": "HOT",
    "urgency": "High",
    "systemsUsed": ["Website", "Email"],
    "conversationSummary": "The business needs faster lead response.",
    "source": "ai-fin",
    "consentToFollowUp": true
  }'
```

Capture the returned `leadId` and `nextAction`.

## 2. Route by Next Action

Typical routing:

- `begin_onboarding` → continue into onboarding
- `human_review` → queue a person before the sale moves forward
- `follow_up` → queue the approved follow-up step

<Warning>
  Do not bypass `human_review` just to shorten the funnel. Complex or high-touch opportunities should keep the human checkpoint.
</Warning>

## 3. Queue Follow-Up

Use this step only when follow-up is appropriate and consent is present.

```bash
curl -X POST "$AI_SURFER_API_BASE/api/ai-fin/follow-up" \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "PASTE_LEAD_ID_HERE",
    "contactName": "Taylor Reed",
    "email": "taylor@example.com",
    "recommendedProduct": "Sales Rider",
    "recommendedPackage": "Wave Starter",
    "conversationSummary": "Sales Rider is the best first move.",
    "messageType": "next_steps",
    "consentToFollowUp": true
  }'
```

## 4. Start Onboarding

For a qualified customer moving forward:

```bash
curl -X POST "$AI_SURFER_API_BASE/api/ai-fin/onboarding" \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "PASTE_LEAD_ID_HERE",
    "contactName": "Taylor Reed",
    "businessName": "Harbor & Pine",
    "email": "taylor@example.com",
    "recommendedProduct": "Sales Rider",
    "recommendedPackage": "Wave Starter",
    "nextStepType": "checkout"
  }'
```

## Decision Rules

- `HOT` leads route toward human review.
- `SURF'S UP` leads route toward onboarding.
- Other accepted stages route toward follow-up.

## Why This Pattern Matters

This keeps AI Fin acting like a traffic controller instead of just a chat window.

The conversation becomes structured business movement:

**Understand → Record → Route → Follow Up → Onboard**

<CardGroup cols={2}>
  <Card title="Save Lead Reference" icon="user-plus" href="/api/reference/leads">
    Review the lead payload and next-action rules.
  </Card>
  <Card title="Onboarding Reference" icon="clipboard-check" href="/api/reference/onboarding">
    Review checkout and configuration-ready responses.
  </Card>
</CardGroup>
