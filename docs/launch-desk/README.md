# Launch Desk

Launch Desk is a full-stack release-planning agent for engineering teams. It turns a rough product brief into a prioritized launch plan, readiness assessment, risk register, owner checklist, channel-specific copy, and focused follow-up questions.

## Current architecture

```text
src/launch-desk/             React workspace + streaming client
src/server/api/launch.ts     SSE API route
src/server/agent/             Launch Desk agent + shared schemas
src/server/tools/             Independent function tools
tests/                        deterministic tool tests
```

The browser never receives `OPENAI_API_KEY`. The server uses `@openai/agents` and Zod v4, following the current Agents SDK pattern for Agents, function tools, streaming, and tracing. The SDK's server runtime tracing is enabled by default unless disabled for tests. See the current [Agents SDK documentation](https://openai.github.io/openai-agents-js/) and [OpenAI model guidance](https://developers.openai.com/api/docs/models).

## Local setup

1. Install Node.js 20+.
2. Copy `.env.example` to `.env`.
3. Set `OPENAI_API_KEY` to a server-side OpenAI API key.
4. Keep `OPENAI_MODEL=gpt-5.6-terra` unless you have a reason to use another current model.
5. Install dependencies with `npm install`.
6. Start the API in one terminal: `npm run server:dev`.
7. Start Vite in another: `npm run dev`.
8. Open `/launch-desk` in the browser.

For a same-origin deployment, set `VITE_API_URL` to the deployed API origin or place the API behind the same reverse proxy.

## Streaming contract

`POST http://localhost:3001/api/launch` accepts:

```json
{
  "productBrief": "...",
  "audience": "...",
  "launchDate": "2026-09-01",
  "constraints": "...",
  "assets": "...",
  "channels": ["Email", "LinkedIn"]
}
```

The endpoint returns `text/event-stream` events. Application events are:

- `tool_progress`: deterministic preflight and agent tool activity.
- `text_delta`: model output text arriving incrementally.
- `final`: terminal accumulated output.
- `error`: request or model error.

The route performs deterministic task extraction and readiness scoring before the model run. This guarantees visible tool progress for the UI while still giving the Agents SDK agent its own tools to validate and enrich the plan.

## Adding a tool

1. Add a Zod input schema and deterministic implementation to `src/server/tools/launchTools.ts` or a new tool module.
2. Wrap the function with the Agents SDK `tool()` helper.
3. Add it to `launchDeskAgent.tools`.
4. Update the agent instructions so the model knows when the tool should be used.
5. Add deterministic unit tests before relying on a live model call.
6. If the tool produces user-visible progress, make sure the server stream maps its SDK run-item event to `tool_progress`.

## Adding a handoff

For a future specialist workflow, create a focused Agent and add it to a manager/triage Agent's `handoffs`. Keep Launch Desk responsible for orchestration and delegate only a bounded domain such as legal review or rollout operations.

## Observability

Agents SDK tracing runs in Node server runtimes by default and captures agent turns, generations, function calls, handoffs, and related lifecycle data. Set `OPENAI_AGENTS_DISABLE_TRACING=1` when you need to disable export. Never log API keys.

## Testing

Run deterministic tests with:

```bash
npm test -- tests/launchTools.test.ts --run
```

For the required real verification, use a shell where the server process can reach the OpenAI API:

```bash
curl -N -X POST http://localhost:3001/api/launch \
  -H 'Content-Type: application/json' \
  -d '{"productBrief":"We are launching a production billing migration with a safer rollback path and a new activation dashboard. The goal is to reduce setup time for engineering teams.","audience":"Engineering teams","launchDate":"2026-09-01","constraints":"Two approvers; limited rollout window","assets":"Release notes, screenshots, email draft","channels":["Email","LinkedIn","Release notes"]}'
```

Do not treat `/health`, Vite startup, TypeScript compilation, or mocked tests as proof that the OpenAI integration works. The end-to-end check must observe at least one `tool_progress` event and one `text_delta` event from the real streamed request.
