# 🌊 Ocean Tide Drop AI SURFER

**Ride the Wave. Grow with AI.**

Ocean Tide Drop AI SURFER is an AI implementation platform for small and local businesses. It helps businesses discover practical AI opportunities, improve AI-search visibility, strengthen lead follow-up, automate repetitive work, and move from diagnosis to implementation without drowning in jargon.

## 🏄 What AI SURFER Does

The customer journey is designed around one clear path:

**Discover → Diagnose → Plan → Implement → Transform**

- **Free AI Wave Check** — identifies the strongest practical AI opportunity.
- **AEO Wave Audit** — evaluates AI-search visibility and answer-engine readiness.
- **AI Wave Report** — turns findings into priorities and a 30-day action path.
- **AI Agents** — focused systems for leads, sales, content, support, automation, and transformation.
- **Implementation Offers** — hands-on builds that put the plan to work.

## 💰 Current Implementation Offers

These are the primary public implementation offers and should be treated as the canonical sales ladder:

| Offer | Price | Best fit | Primary CTA |
| --- | ---: | --- | --- |
| **Wave Starter** | **$497** | One focused AI implementation sprint | Buy Wave Starter |
| **Wave Builder** | **$1,997** | Connected visibility, lead-flow, follow-up, or automation systems | Request a Strategy Call |
| **Tsunami Growth** | **$3,997** | Multi-area AI strategy and deeper implementation | Talk With AI Surfer |

When a visitor is unsure where to begin, the preferred entry point is the **Free AI Wave Check**.

## 🤖 AI SURFER Agent Crew

AI SURFER currently uses six named specialist agents:

- **Wave Scout** — opportunity discovery, lead generation, and visibility gaps.
- **Sales Rider** — lead response, sales follow-up, and conversion workflows.
- **Content Creator** — repeatable AI-assisted content systems.
- **Customer Care Cove** — customer support and service automation.
- **Automation Architect** — repetitive workflow design and integrations.
- **Big Kahuna** — multi-area AI strategy and implementation.

## 🧠 Knowledge Hub

The repository contains a canonical knowledge-hub source for public documentation, AI-search visibility, and future Mintlify Wiki pages:

`docs/knowledge-hub/ai-surfer-knowledge-hub.md`

That document is intended to keep product names, pricing, CTAs, agent descriptions, and customer-journey language aligned across the website, documentation, AI Fin, sales pages, and external knowledge surfaces.

## 📚 Documentation

The public developer documentation now has a dedicated branded entry point:

- [AI SURFER API Overview](api/overview.md) — developer-facing API and automation overview
- [API README](api/README.md) — technical brand guidance and developer navigation
- [AI SURFER Knowledge Hub](docs/knowledge-hub/ai-surfer-knowledge-hub.md) — canonical product, offer, agent, and positioning source
- [Launch Desk](docs/launch-desk/README.md) — release-planning agent documentation
- [Security Policy](SECURITY.md) — security guidance

The **AI Surfer technology emblem** is reserved for developer documentation, APIs, integrations, Launch Desk, and other technical product surfaces. Customer-facing sales pages keep the primary Ocean Tide Drop AI SURFER brand as the lead identity.

## 🧱 Platform Stack

- React 19
- Vite
- TypeScript
- Cloudflare Pages
- Cloudflare Workers / Functions
- Supabase
- Stripe
- OpenAI-powered AI experiences
- Framer Motion
- Lucide Icons

## 🧭 Key Routes

- `/` — primary AI SURFER landing experience
- `/wave-check` — Free AI Wave Check
- `/pricing` — current implementation offers
- `/members` — member dashboard
- `/audit/*` — paid AEO Wave Audit flow

## 🚀 Development

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Cloudflare deploys from the connected GitHub repository.

## 🩺 Browser Run Website Health Check

`POST /api/site-health` uses Cloudflare Browser Run Quick Actions to capture the live AI SURFER homepage as a screenshot, Markdown, and accessibility tree.

The endpoint is fixed to `https://otdaisurfer.surf/` and requires an internal bearer key so public callers cannot spend Browser Run time.

Configure these encrypted Cloudflare Pages environment variables:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_BROWSER_TOKEN`
- `SITE_HEALTH_API_KEY`

Example:

```bash
curl -X POST https://otdaisurfer.surf/api/site-health \
  -H "Authorization: Bearer $SITE_HEALTH_API_KEY"
```

## 🎨 Brand Direction

Ocean Tide Drop AI SURFER uses a neon-ocean visual system with cyan, blue, violet, and pink accents. The voice should stay practical, energetic, friendly, and business-focused.

The core promise is simple:

**Find the right AI wave, then put it to work.**

---

Created by Shannon Foster.  
Ocean Tide Drop AI SURFER 🌊
