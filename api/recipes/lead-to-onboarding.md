# Recipe: Lead → Follow-Up → Onboarding

This recipe turns an AI Fin conversation into a complete next-step workflow.

## 1. Save the lead

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

Capture the returned `leadId`.

## 2. Queue follow-up

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

## 3. Start onboarding

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

## Decision rule

- `HOT` leads route toward human review.
- `SURF'S UP` leads route toward onboarding.
- Other accepted stages route toward follow-up.

That makes AI Fin a traffic controller instead of just a chat window. 🌊
