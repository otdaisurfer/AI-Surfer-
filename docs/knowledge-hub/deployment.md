---
title: "Deployment"
description: "How AI SURFER moves from verified build to live production across Cloudflare, Supabase, Stripe, and OpenAI-powered workflows."
---

# Deployment 🚀🌊

AI SURFER uses a modern web stack built around React, Vite, TypeScript, Cloudflare, Supabase, Stripe, and OpenAI-powered workflows.

The important part is not the list of technologies.

The important part is making sure the **live customer journey still works after deployment**.

<Tip>
  A deployment is only successful when the customer path, data path, payment path, and follow-up path work together in production.
</Tip>

## Core Stack

<CardGroup cols={2}>
  <Card title="Frontend" icon="browser">
    React, Vite, and TypeScript power the public experience and application interface.
  </Card>

  <Card title="Cloudflare" icon="cloud">
    Cloudflare Pages and Workers support hosting, edge logic, routing, and secure server-side workflows.
  </Card>

  <Card title="Supabase" icon="database">
    Supabase provides database, authentication, and application data services.
  </Card>

  <Card title="Stripe" icon="credit-card">
    Stripe handles secure checkout and payment handoff for paid offers.
  </Card>

  <Card title="OpenAI Workflows" icon="sparkles">
    OpenAI-powered workflows support AI Fin, specialist agents, report generation, and AI-driven implementation experiences.
  </Card>
</CardGroup>

## Deployment Principle

AI SURFER follows the sequence:

**Secure → Stabilize → Deploy → Revenue**

Deployment sits in the middle of that chain.

If security is weak, the launch is risky.

If the experience is unstable, the launch is unreliable.

If the system is deployed but the offer or follow-up path is broken, the launch is not revenue-ready.

## Before Deployment

Before a production release, verify:

- core routes load correctly
- forms submit successfully
- authentication works
- protected areas are actually protected
- environment variables are present
- API keys are stored securely
- database writes succeed
- payment links point to the correct product
- strategy-call links are correct
- AI-generated reports return expected results
- important failures display useful fallback states
- mobile behavior is acceptable

## Production Environment

The production environment should be treated differently from local development.

That means checking:

- production URLs
- live domains
- DNS records
- production secrets
- database environment
- authentication redirect URLs
- payment environment
- third-party callback URLs
- CORS and origin rules
- analytics and monitoring configuration

A feature can work perfectly in local development and still fail in production because one environment-specific value is wrong.

## Cloudflare

Cloudflare supports the public delivery layer and edge-side workflows.

Depending on the implementation, it may handle:

- production hosting
- route handling
- server-side API calls
- secure secret usage
- lead-processing logic
- retries
- health checks
- lightweight automation
- edge functions

The deployment check should confirm that the expected production configuration is attached to the correct project and environment.

## Supabase

Supabase supports application data and authentication.

Production checks should include:

- database connectivity
- table access
- row-level security behavior
- authentication flows
- redirect URLs
- session persistence
- write permissions
- expected data relationships
- failure handling

A successful form submission should be verified by confirming that the expected data actually reaches the database.

## Stripe

Stripe supports secure payment handoff.

For the current AI SURFER offer ladder:

- **Wave Starter — $497** can use a direct payment path
- **Wave Builder — $1,997** should route to a strategy call
- **Tsunami Growth — $3,997** should route to a strategy call

Production verification should check:

- the correct product
- the correct price
- the correct environment
- successful redirect behavior
- post-purchase handoff
- CRM or follow-up recording where applicable

## OpenAI-Powered Workflows

OpenAI-powered workflows can support:

- AI Fin
- Wave Check analysis
- Wave Report generation
- specialist AI agents
- content workflows
- customer support experiences
- business diagnostics

Production verification should confirm:

- the workflow can make a successful request
- required secrets are available
- the expected model path is configured
- failures return a useful customer-facing response
- outputs are stored or handed off correctly when needed

## Post-Deploy Smoke Test

After each meaningful production deployment, run a short end-to-end smoke test.

<Steps>
  <Step title="Open the live site">
    Confirm the expected production domain and key routes load correctly.
  </Step>

  <Step title="Run the customer entry flow">
    Test the Free AI Wave Check or another primary lead path.
  </Step>

  <Step title="Verify the data path">
    Confirm the lead, report, or customer record reaches the intended system.
  </Step>

  <Step title="Check the recommendation">
    Make sure the correct offer or next step is shown.
  </Step>

  <Step title="Test the commercial handoff">
    Verify Stripe or the strategy-call path works as expected.
  </Step>

  <Step title="Confirm follow-up">
    Make sure the lead or customer is available for the next sales or delivery action.
  </Step>
</Steps>

## Deployment Failure Patterns

Common failures include:

- production secrets missing
- wrong redirect URLs
- incorrect payment links
- forms that appear successful but do not save
- AI responses failing only in production
- stale frontend assets
- broken mobile layouts
- CRM handoffs not recording
- domain or DNS mismatches
- authentication loops

These are exactly the kinds of issues Launch Desk is designed to catch.

<Card title="Explore Launch Desk" icon="rocket" href="/docs/knowledge-hub/features/launch-desk">
  See how AI SURFER manages Secure, Stabilize, Deploy, and Revenue as one launch process.
</Card>

## Definition of Done

A deployment is done when:

- the live site loads
- the primary customer path works
- the data path works
- the AI workflow works
- the correct offer is presented
- payment or booking works
- follow-up can happen
- no critical launch issue remains

**Ship the system, not just the code. 🌊**
