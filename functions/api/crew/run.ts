import { run, setDefaultOpenAIKey } from "@openai/agents";
import { z } from "zod";
import { hasCrewAccess } from "../../../src/crew/entitlements";
import type { MembershipTier } from "../../../src/crew/types";
import { createCrewAgents } from "../../../src/server/crew/agents";
import {
  buildCrewPrompt,
  extractBearerToken,
  tierFromVerifiedUser,
} from "../../../src/server/crew/runContract";
import { requireCrewEnv, type CrewEnv, type ResolvedCrewEnv } from "../../_shared/env";
import {
  completeCrewRun,
  loadBusinessProfile,
  loadMembershipTier,
  loadProjectHistory,
  reserveCrewRun,
  verifySupabaseUser,
} from "../../_shared/supabase";

type CrewPagesContext = {
  request: Request;
  env: CrewEnv;
  waitUntil(promise: Promise<unknown>): void;
};

const RequestSchema = z.object({
  agentSlug: z.enum([
    "wave-scout",
    "sales-rider",
    "content-creator",
    "customer-care-cove",
    "automation-architect",
    "big-kahuna",
  ]),
  projectId: z.string().uuid(),
  task: z.string().trim().min(10).max(8000),
});

function json(status: number, body: Record<string, unknown>): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function reservationError(error: unknown): Response {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("agent_locked")) {
    return json(403, { error: "agent_locked", message: "Upgrade your membership to unlock this specialist." });
  }
  if (message.includes("run_limit_reached")) {
    return json(429, { error: "run_limit_reached", message: "Your monthly Crew run allowance has been reached." });
  }
  if (message.includes("project_not_found")) {
    return json(404, { error: "project_not_found", message: "That Crew project was not found." });
  }
  return json(503, { error: "run_unavailable", message: "The Crew could not start this run yet." });
}

export async function onRequestPost(context: CrewPagesContext): Promise<Response> {
  let env: ResolvedCrewEnv;
  try {
    env = requireCrewEnv(context.env);
  } catch {
    return json(503, {
      error: "crew_not_configured",
      message: "The Crew Engine is not configured yet.",
    });
  }

  const token = extractBearerToken(context.request.headers.get("Authorization"));
  if (!token) {
    return json(401, { error: "authentication_required", message: "Please sign in again." });
  }

  const verifiedUser = await verifySupabaseUser({ env, token });
  if (!verifiedUser) {
    return json(401, { error: "invalid_session", message: "Your session expired. Please sign in again." });
  }

  const parsed = RequestSchema.safeParse(await context.request.json().catch(() => null));
  if (!parsed.success) {
    return json(400, {
      error: "invalid_request",
      message: parsed.error.issues[0]?.message ?? "Check the Crew task and try again.",
    });
  }

  const databaseTier = await loadMembershipTier({
    env,
    token,
    authId: verifiedUser.id,
  });
  const tier = tierFromVerifiedUser(
    verifiedUser,
    databaseTier as MembershipTier,
  );

  if (!hasCrewAccess(tier, parsed.data.agentSlug)) {
    return json(403, {
      error: "agent_locked",
      message: "Upgrade your membership to unlock this specialist.",
    });
  }

  const businessProfile = await loadBusinessProfile({ env, token });
  if (!businessProfile) {
    return json(409, {
      error: "business_profile_required",
      message: "Complete your business profile before starting the Crew.",
    });
  }

  let reserved: { id: string; request_id: string };
  try {
    reserved = await reserveCrewRun({
      env,
      token,
      projectId: parsed.data.projectId,
      agentSlug: parsed.data.agentSlug,
      inputSummary: parsed.data.task.slice(0, 500),
    });
  } catch (error) {
    return reservationError(error);
  }

  const history = await loadProjectHistory({
    env,
    token,
    projectId: parsed.data.projectId,
  });

  setDefaultOpenAIKey(env.OPENAI_API_KEY);
  const agents = createCrewAgents(env.OPENAI_MODEL || "gpt-5.6-terra");
  const prompt = buildCrewPrompt({
    task: parsed.data.task,
    businessProfile,
    projectHistory: history,
  });

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  const send = async (payload: Record<string, unknown>) => {
    await writer.write(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
  };

  const pump = (async () => {
    let output = "";
    try {
      await send({
        type: "run_started",
        runId: reserved.id,
        requestId: reserved.request_id,
        agent: parsed.data.agentSlug,
      });

      const stream = await run(agents[parsed.data.agentSlug], prompt, {
        stream: true,
      });

      for await (const event of stream) {
        if (event.type === "raw_model_stream_event") {
          const data = event.data as { type?: string; delta?: string };
          if (data.type === "output_text_delta" && data.delta) {
            output += data.delta;
            await send({ type: "text_delta", delta: data.delta });
          }
        } else if (event.type === "run_item_stream_event") {
          const item = event.item as { type?: string; name?: string };
          if (item.type === "tool_call_item") {
            await send({
              type: "tool_progress",
              status: "started",
              tool: item.name ?? "crew_tool",
              message: "Researching and preparing your work…",
            });
          } else if (item.type === "tool_call_output_item") {
            await send({
              type: "tool_progress",
              status: "completed",
              tool: item.name ?? "crew_tool",
              message: "Research step completed.",
            });
          }
        }
      }

      await stream.completed;
      const finalOutput = output || String(stream.finalOutput ?? "");
      await completeCrewRun({
        env,
        token,
        runId: reserved.id,
        status: "complete",
        output: finalOutput,
      });
      await send({ type: "final", output: finalOutput, runId: reserved.id });
    } catch {
      await completeCrewRun({
        env,
        token,
        runId: reserved.id,
        status: "failed",
        errorCode: "agent_run_failed",
      });
      await send({
        type: "error",
        error: "agent_run_failed",
        message: "This specialist could not finish the run. Your task is still safe.",
      });
    } finally {
      await writer.close();
    }
  })();

  context.waitUntil(pump);

  return new Response(readable, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
