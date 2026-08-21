import { tool } from "@openai/agents";
import { z } from "zod";
import type { LaunchTask, Readiness } from "../agent/types";

const taskInput = z.object({ productBrief: z.string(), constraints: z.string() });

export function extractLaunchTasks(input: z.infer<typeof taskInput>): LaunchTask[] {
  const text = `${input.productBrief} ${input.constraints}`.toLowerCase();
  const tasks: LaunchTask[] = [
    { title: "Lock launch scope and success criteria", priority: "P0", dependency: "Product brief", ownerRole: "Product", rationale: "Prevents scope drift and gives every launch decision a measurable target." },
    { title: "Complete production validation and rollback plan", priority: "P0", dependency: "Launch scope", ownerRole: "Engineering", rationale: "Protects the release path and creates a recovery path if the launch fails." },
    { title: "Prepare audience-facing launch assets", priority: "P1", dependency: "Final positioning", ownerRole: "Marketing", rationale: "Ensures channels have approved material before launch day." },
    { title: "Define launch-day monitoring and escalation", priority: "P1", dependency: "Success criteria", ownerRole: "Engineering", rationale: "Turns launch telemetry into explicit go/no-go and escalation actions." },
    { title: "Confirm stakeholder approvals", priority: "P1", dependency: "Scope and assets", ownerRole: "Launch Lead", rationale: "Removes approval bottlenecks before the critical path closes." },
  ];
  if (text.includes("mobile") || text.includes("ios") || text.includes("android")) tasks.push({ title: "Validate mobile release gates and store readiness", priority: "P0", dependency: "Production validation", ownerRole: "Engineering", rationale: "Mobile launches add platform-specific signing, review, and rollout dependencies." });
  if (text.includes("migration") || text.includes("data")) tasks.push({ title: "Run migration rehearsal and data rollback check", priority: "P0", dependency: "Production validation", ownerRole: "Engineering", rationale: "Data changes need a rehearsed recovery path before launch." });
  return tasks;
}

export const extractLaunchTasksTool = tool({ name: "extract_launch_tasks", description: "Extract a prioritized, dependency-aware task list from a launch brief.", parameters: taskInput, execute: async (input) => extractLaunchTasks(input) });

const readinessInput = z.object({ launchDate: z.string(), productBrief: z.string(), constraints: z.string(), assets: z.string(), tasks: z.array(z.object({ title: z.string(), priority: z.string(), dependency: z.string(), ownerRole: z.string(), rationale: z.string() })) });

export function checkLaunchReadiness(input: z.infer<typeof readinessInput>): Readiness {
  const categories = [
    { category: "Product", score: input.productBrief.length > 120 ? 90 : 65, gap: input.productBrief.length > 120 ? "No obvious brief gap." : "Clarify scope, success criteria, and non-goals." },
    { category: "Engineering", score: input.tasks.some((t) => t.title.toLowerCase().includes("rollback")) ? 85 : 60, gap: input.tasks.some((t) => t.title.toLowerCase().includes("rollback")) ? "Rollback path represented." : "Add production validation and rollback detail." },
    { category: "Operations", score: 70, gap: "Confirm monitoring, escalation, and support coverage." },
    { category: "Communications", score: input.assets.toLowerCase().includes("copy") || input.assets.toLowerCase().includes("email") ? 85 : 55, gap: input.assets.toLowerCase().includes("copy") || input.assets.toLowerCase().includes("email") ? "Core communication assets appear available." : "List approved messaging and launch assets." },
    { category: "Measurement", score: input.productBrief.toLowerCase().includes("metric") || input.productBrief.toLowerCase().includes("kpi") ? 85 : 50, gap: input.productBrief.toLowerCase().includes("metric") || input.productBrief.toLowerCase().includes("kpi") ? "Success metrics are mentioned." : "Define launch-day KPIs and owners." },
    { category: "Stakeholders", score: input.constraints.toLowerCase().includes("approval") ? 80 : 60, gap: input.constraints.toLowerCase().includes("approval") ? "Approval constraint captured." : "Confirm approvers and decision deadline." },
  ];
  const score = Math.round(categories.reduce((sum, c) => sum + c.score, 0) / categories.length);
  const blockers = categories.filter((c) => c.score < 60).map((c) => `${c.category}: ${c.gap}`);
  return { score, status: score >= 80 ? "ready" : score >= 65 ? "at-risk" : "blocked", categories, blockers };
}

export const checkLaunchReadinessTool = tool({ name: "check_launch_readiness", description: "Score launch readiness across product, engineering, operations, communications, measurement, and stakeholders.", parameters: readinessInput, execute: async (input) => checkLaunchReadiness(input) });

const ownerInput = z.object({ launchDate: z.string(), tasks: z.array(z.object({ title: z.string(), priority: z.string(), dependency: z.string(), ownerRole: z.string(), rationale: z.string() })) });
export const generateOwnerChecklistTool = tool({
  name: "generate_owner_checklist",
  description: "Generate owner-role checklists from launch tasks and target date.",
  parameters: ownerInput,
  execute: async ({ tasks, launchDate }) => {
    const groups = new Map<string, typeof tasks>();
    for (const task of tasks) groups.set(task.ownerRole, [...(groups.get(task.ownerRole) ?? []), task]);
    return { launchDate, checklist: [...groups.entries()].map(([owner, ownerTasks]) => ({ owner, actions: ownerTasks.map((task) => ({ task: task.title, priority: task.priority, timing: task.priority === "P0" ? "Before final go/no-go" : "Before launch day" })) })) };
  },
});

const copyInput = z.object({ productBrief: z.string(), audience: z.string(), channels: z.array(z.string()), assets: z.string() });
export const draftChannelCopyTool = tool({
  name: "draft_channel_copy",
  description: "Draft concise, channel-specific launch copy using only facts present in the brief.",
  parameters: copyInput,
  execute: async ({ productBrief, audience, channels }) => channels.map((channel) => ({ channel, headline: `${audience}: meet the new release`, body: `We are launching ${productBrief.slice(0, 180).replace(/\s+/g, " ")}. Learn what is changing, why it matters, and what to do next.`, cta: "See the launch details" })),
});
