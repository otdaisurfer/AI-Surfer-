# Launch Desk Agent Design

**Date:** 2026-08-21

## Goal

Build a polished full-stack web app named **Launch Desk** that turns a rough engineering launch brief into an actionable release plan using the current OpenAI Agents SDK for TypeScript.

## Product flow

1. User enters product brief, audience, target launch date, constraints, and available assets.
2. Frontend validates the minimum launch context and posts it to the server.
3. Server runs a Launch Desk agent with local function tools.
4. The API streams progressive agent events to the browser.
5. UI shows tool progress while the model response accumulates.
6. Final result presents prioritized plan, risk register, owner checklist, channel-specific launch copy, and follow-up questions when information is missing.

## Architecture

The existing React + Vite + TypeScript application remains the frontend host. Launch Desk gets a focused feature boundary rather than being mixed into existing marketing pages.

- `src/launch-desk/`: frontend UI, types, client streaming adapter, and presentation components.
- `src/server/api/`: HTTP route and request/stream serialization.
- `src/server/agent/`: Launch Desk agent definition and instructions.
- `src/server/tools/`: independently testable function tools for task extraction, readiness scoring, owner checklist generation, and channel copy drafting.
- `tests/`: unit tests for tools and an end-to-end streamed API test.

The server owns `OPENAI_API_KEY`; the browser never receives it. The agent uses `@openai/agents` and Zod v4. No Assistants API or legacy Chat Completions scaffolding is introduced.

## Agent behavior

The Launch Desk agent acts as a pragmatic engineering launch planner. It should:

- Treat the user's brief as the source of truth and clearly label assumptions.
- Identify missing information before inventing important launch details.
- Prioritize work by launch impact, dependency, urgency, and reversibility.
- Surface risks with likelihood, impact, mitigation, and owner when ownership is known.
- Produce concrete owner actions rather than generic advice.
- Draft concise channel-specific copy without claiming facts absent from the brief.
- Ask focused follow-up questions only for details that materially affect launch readiness.

The final response is structured into these sections: Launch Snapshot, Priority Plan, Risk Register, Owner Checklist, Launch Copy, and Follow-up Questions.

## Tools

### `extract_launch_tasks`

Input: product brief and constraints. Output: normalized tasks with title, priority, dependency, suggested owner role, and rationale.

### `check_launch_readiness`

Input: launch context and extracted tasks. Output: rubric scores for product readiness, quality, operational readiness, communications, analytics/measurement, and stakeholder readiness, plus blocking gaps.

### `generate_owner_checklist`

Input: tasks, owners/roles, and launch date. Output: checklist grouped by owner role and time horizon.

### `draft_channel_copy`

Input: launch context, audience, and requested channels. Output: channel-specific draft copy for the selected channels, including a concise CTA and a note where source information is missing.

Tools are deterministic where possible so unit tests can assert behavior without an OpenAI call. The agent is responsible for orchestrating them and synthesizing the final plan.

## Streaming contract

`POST /api/launch` accepts JSON launch context and returns an SSE-compatible stream using `text/event-stream`.

Events are JSON objects with a stable envelope:

- `tool_progress`: `{ type, tool, status, message }`
- `text_delta`: `{ type, delta }`
- `final`: `{ type, output }`
- `error`: `{ type, message }`

The route maps Agents SDK streaming events into these application events. The server must emit at least one `tool_progress` event and model text deltas for a successful run.

## Frontend

The Launch Desk screen uses a responsive two-panel workspace on desktop and a stacked layout on small screens.

Left panel:
- Product brief textarea
- Audience input
- Launch date picker
- Constraints textarea
- Available assets textarea
- Channel selection
- Build Launch Plan button

Right panel:
- Live agent activity timeline
- Streaming plan output
- Readiness indicators
- Risks
- Owner checklist
- Copy suggestions
- Follow-up questions

The visual language should feel like an engineering launch command center: clear hierarchy, compact status signals, restrained motion, strong readability, and obvious next actions. Existing app styling can be reused where helpful, but Launch Desk should remain visually coherent as its own feature.

## Models and observability

Use a current GPT-5.6 model supported by the Agents SDK. Default to `gpt-5.6-terra` for the product flow because this is a planning workload where quality/cost balance matters; make the model configurable through an environment variable for easy testing and extension. OpenAI's current model guidance identifies GPT-5.6 Sol as the flagship model, Terra as the balanced option, and Luna as the cost-sensitive option.

Use the Agents SDK's built-in server tracing. Do not expose trace credentials to the browser. Tracing may be disabled in tests through the SDK-supported environment/configuration.

## Validation

The implementation must include:

- Tool unit tests covering normal and incomplete launch briefs.
- Agent input validation tests.
- API streaming tests that post to `/api/launch` and read the stream until both a `tool_progress` event and a `text_delta` event are observed.
- Frontend flow tests for form submission, streaming activity, successful result rendering, and error state.
- A real local end-to-end verification using the configured `OPENAI_API_KEY`, not merely `/api/health`, Vite startup, TypeScript, or mocked tests.

If the server process cannot reach the OpenAI API in the execution environment, the exact network/runtime blocker must be reported and the run mode corrected where possible before declaring completion.

## Developer experience

Provide `.env.example` with `OPENAI_API_KEY` and configurable `OPENAI_MODEL`. Keep `.env` out of version control and never print secrets in logs.

README must document prerequisites, environment setup, frontend/backend commands, architecture, tool extension patterns, tracing, testing, and the real streamed verification command.

`VALIDATION.md` must contain a checkbox-based validation checklist for agent behavior, frontend flow, tool outputs, streaming, observability, and real API verification.

## Non-goals

- No persistent launch database in the first version.
- No authentication or billing.
- No Assistants API.
- No legacy Chat Completions route.
- No browser-side OpenAI API key.
