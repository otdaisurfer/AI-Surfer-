# Save AI Fin Lead

`POST /api/ai-fin/leads`

Stores a qualified AI Fin lead in Supabase and calculates the next workflow action.

## Request body

Required fields include `contactName`, `businessName`, `email`, `primaryProblem`, `recommendedProduct`, `leadStage`, `urgency`, `conversationSummary`, and `consentToFollowUp: true`.

Approved products:

- AEO Wave Audit
- Wave Scout
- Sales Rider
- Content Creator
- Customer Care Cove
- Automation Architect
- Big Kahuna

Approved packages:

- Wave Starter
- Wave Builder
- Tsunami Growth
- Needs Human Review

Lead stages: `COLD`, `WARM`, `HOT`, `SURF'S UP`.

## Example

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

## Success response

```json
{
  "ok": true,
  "status": "saved",
  "leadId": "generated-uuid",
  "nextAction": "human_review"
}
```

`nextAction` is `begin_onboarding` for `SURF'S UP`, `human_review` for `HOT`, and `follow_up` for other accepted stages.

## Errors

- `400 INVALID_LEAD_PAYLOAD`
- `500 SUPABASE_NOT_CONFIGURED`
- `500 LEAD_SAVE_FAILED`
