---
title: "AI Wave / AEO Audit Intake"
description: "Move a qualified business from conversation into a queued AI Wave or AEO audit."
---

# AI Wave / AEO Audit Intake 🌊🔎

Use this recipe when the conversation has identified visibility or diagnostic work as the right next step.

The pattern is:

**Business Context → Audit Intake → Audit ID → Deeper Assessment**

## 1. Confirm the Audit Is the Right Next Step

Use audit intake when:

- AI-search visibility is the strongest opportunity
- the business needs a deeper diagnostic before implementation
- the Free AI Wave Check points toward AEO/GEO
- a qualified conversation needs structured assessment

## 2. Start the Audit

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

## 3. Capture the Audit ID

Expected response:

```json
{
  "ok": true,
  "status": "started",
  "auditId": "generated-uuid",
  "nextStep": "complete_aeo_audit"
}
```

Persist the `auditId` so later audit work can stay attached to the correct business record.

## 4. Use `businessIdentifier` When Needed

If the visitor does not have a website, send a meaningful `businessIdentifier` instead.

Useful examples include:

- business name + city
- business name + service area
- another stable identifier your workflow can reliably match

At least one of `website` or `businessIdentifier` is required.

<Note>
  A business without a website can still have an AI-search visibility problem. The intake path should not exclude it automatically.
</Note>

## Where This Fits

This recipe belongs primarily in the **Diagnose** stage:

**Discover → Diagnose → Plan → Implement → Transform**

After intake, the deeper assessment can feed an AEO Blueprint, implementation recommendation, or next-step offer.

<CardGroup cols={2}>
  <Card title="Audit Endpoint" icon="radar" href="/api/reference/audit-start">
    Review required fields, sources, and errors.
  </Card>
  <Card title="AEO Wave Audit" icon="magnifying-glass" href="/docs/knowledge-hub/features/wave-audit">
    See the customer-facing version of the audit.
  </Card>
</CardGroup>
