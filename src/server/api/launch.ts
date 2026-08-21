import type { Request, Response } from "express";
import { run } from "@openai/agents";
import { LaunchBriefSchema } from "../agent/types";
import { launchDeskAgent } from "../agent/launchDeskAgent";
import { checkLaunchReadiness, extractLaunchTasks } from "../tools/launchTools";

function send(res: Response, payload: unknown) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

export async function launchHandler(req: Request, res: Response) {
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const parsed = LaunchBriefSchema.safeParse(req.body);
  if (!parsed.success) {
    send(res, { type: "error", message: parsed.error.issues[0]?.message ?? "Invalid launch brief" });
    res.end();
    return;
  }

  const brief = parsed.data;
  try {
    send(res, { type: "tool_progress", tool: "extract_launch_tasks", status: "started", message: "Extracting the launch critical path…" });
    const tasks = extractLaunchTasks({ productBrief: brief.productBrief, constraints: brief.constraints });
    send(res, { type: "tool_progress", tool: "extract_launch_tasks", status: "completed", message: `${tasks.length} launch tasks identified.` });

    send(res, { type: "tool_progress", tool: "check_launch_readiness", status: "started", message: "Checking readiness against the launch rubric…" });
    const readiness = checkLaunchReadiness({ ...brief, tasks });
    send(res, { type: "tool_progress", tool: "check_launch_readiness", status: "completed", message: `Readiness score: ${readiness.score}/100 (${readiness.status}).` });

    const prompt = `Launch context:\n${JSON.stringify({ ...brief, extractedTasks: tasks, readiness }, null, 2)}\n\nCreate the release plan now. Use the tools to validate and enrich this preflight analysis. Stream useful progress as you work.`;
    const stream = await run(launchDeskAgent, prompt, { stream: true });

    let text = "";
    for await (const event of stream) {
      if (event.type === "raw_model_stream_event") {
        const data = event.data as { type?: string; delta?: string };
        if (data.type === "output_text_delta" && data.delta) {
          text += data.delta;
          send(res, { type: "text_delta", delta: data.delta });
        }
      } else if (event.type === "run_item_stream_event") {
        const item = event.item as { type?: string; name?: string };
        if (item.type === "tool_call_item") {
          send(res, { type: "tool_progress", tool: item.name ?? "agent_tool", status: "started", message: `Running ${item.name ?? "planning tool"}…` });
        } else if (item.type === "tool_call_output_item") {
          send(res, { type: "tool_progress", tool: item.name ?? "agent_tool", status: "completed", message: `${item.name ?? "Planning tool"} completed.` });
        }
      }
    }

    await stream.completed;
    send(res, { type: "final", output: text || stream.finalOutput || "Launch plan generated." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Launch Desk could not complete the request.";
    send(res, { type: "error", message });
  } finally {
    res.end();
  }
}
