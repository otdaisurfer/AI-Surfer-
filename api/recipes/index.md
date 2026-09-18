---
title: "API Recipes"
description: "Connect AI SURFER endpoints into complete lead, audit, onboarding, and launch workflows."
---

# AI SURFER API Recipes 🌊

Recipes show how to connect individual endpoints into complete business workflows.

<CardGroup cols={2}>
  <Card title="Lead → Onboarding" icon="route" href="/api/recipes/lead-to-onboarding">
    Save a lead, recommend the next step, queue follow-up, and begin onboarding.
  </Card>

  <Card title="Audit Intake" icon="radar" href="/api/recipes/audit-intake">
    Start an AI Wave or AEO audit from a qualified business intake.
  </Card>

  <Card title="Launch Desk Streaming" icon="rocket" href="/api/recipes/launch-streaming">
    Consume the streaming Launch Desk response and build a launch workflow.
  </Card>
</CardGroup>

## Before You Begin

Set your base URL:

```bash
export AI_SURFER_API_BASE="http://localhost:3001"
```

For production, use a protected API origin and follow the security guidance in the [API Reference](/api/reference/index).

<Tip>
  These recipes follow one rule: **business outcome first, API plumbing second**.
</Tip>
