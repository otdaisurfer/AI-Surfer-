---
title: "Save AI Fin Lead"
description: "Store a qualified AI Fin lead and calculate the next workflow action."
---

# Save AI Fin Lead

`POST /api/ai-fin/leads`

Stores a qualified AI Fin lead in Supabase and calculates the next workflow action.

## Request Body

Required fields include:

- `contactName`
- `businessName`
- `email`
- `primaryProblem`
- `recommendedProduct`
- `leadStage`
- `urgency`
- `conversationSummary`
- `consentToFollowUp: true`

### Approved Products

- AEO Wave Audit
- Wave Scout
- Sales Rider
- Content Creator
- Customer Care Cove
- Automation Architect
- Big Kahuna

### Approved Packages

- Wave Starter
- Wave Builder
- Tsunami Growth
- Needs Human Review

### Lead Stages

`COLD`, `WARM`, `HOT`, `SURF'S UP`

## Example Request

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

## Success Response

```json
{
  "ok": true,
  "status": "saved",
  "leadId": "generated-uuid",
  "nextAction": "human_review"
}
```

## Next-Action Rules

- `SURF'S UP` → `begin_onboarding`
- `HOT` → `human_review`
- other accepted stages → `follow_up`

<Warning>
  Do not set `consentToFollowUp` to true unless the visitor has actually consented to follow-up.
</Warning>

## Errors

- `400 INVALID_LEAD_PAYLOAD`
- `500 SUPABASE_NOT_CONFIGURED`
- `500 LEAD_SAVE_FAILED`

<Card title="Lead-to-Onboarding Recipe" icon="route" href="/api/recipes/lead-to-onboarding">
  See this endpoint in a complete business workflow.
</Card>
