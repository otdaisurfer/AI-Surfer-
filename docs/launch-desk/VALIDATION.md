# Launch Desk validation checklist

## Agent behavior

- [ ] Agent treats the product brief as source of truth.
- [ ] Agent states assumptions rather than inventing facts.
- [ ] Agent returns the required six headings.
- [ ] Priority plan contains P0/P1/P2 actions with owners and dependencies.
- [ ] Risk register includes likelihood, impact, mitigation, and owner role.
- [ ] Follow-up questions are focused on materially missing information.
- [ ] Channel copy does not invent claims or product capabilities.

## Tool outputs

- [ ] `extract_launch_tasks` returns deterministic, dependency-aware tasks.
- [ ] `check_launch_readiness` returns a 0-100 score, status, category scores, and blockers.
- [ ] `generate_owner_checklist` groups actions by owner role.
- [ ] `draft_channel_copy` returns one draft per requested channel.
- [ ] Tool unit tests pass.

## Frontend flow

- [ ] `/launch-desk` renders without console errors.
- [ ] Brief, audience, date, constraints, assets, and channel controls work.
- [ ] Submit disables while a run is active.
- [ ] Tool activity appears progressively.
- [ ] Model text appears progressively.
- [ ] Copy action copies the streamed plan.
- [ ] API errors render a visible recovery message.
- [ ] Layout works at desktop and mobile widths.

## API / streaming

- [ ] `POST /api/launch` validates request input.
- [ ] Response uses `text/event-stream`.
- [ ] Successful request emits at least one `tool_progress` event.
- [ ] Successful request emits at least one `text_delta` event.
- [ ] Successful request emits a terminal `final` event.
- [ ] Failure emits an `error` event and closes the stream.
- [ ] API key remains server-side.

## Observability

- [ ] Agents SDK tracing is enabled in normal Node server execution.
- [ ] Tracing can be disabled with `OPENAI_AGENTS_DISABLE_TRACING=1`.
- [ ] Tests do not export traces unintentionally.

## Real end-to-end gate

- [ ] `OPENAI_API_KEY` is configured in the server environment.
- [ ] Frontend and backend dev servers are running.
- [ ] A real POST reaches the local API route.
- [ ] The server process reaches the OpenAI API.
- [ ] The streamed response contains `tool_progress`.
- [ ] The streamed response contains `text_delta`.
- [ ] The final plan is visible in the frontend.

**Completion rule:** do not mark Launch Desk complete if the final real API gate is skipped. If the execution environment blocks outbound OpenAI traffic, document the exact blocker and do not claim successful end-to-end verification.
