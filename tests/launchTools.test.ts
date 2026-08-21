import { describe, expect, it } from "vitest";
import { checkLaunchReadiness, extractLaunchTasks } from "../src/server/tools/launchTools";

describe("Launch Desk tools", () => {
  it("extracts core launch tasks and special data work", () => {
    const tasks = extractLaunchTasks({ productBrief: "We are shipping a billing migration with a new dashboard and mobile support.", constraints: "Limited rollout window" });
    expect(tasks.some((task) => task.priority === "P0")).toBe(true);
    expect(tasks.some((task) => task.title.toLowerCase().includes("migration"))).toBe(true);
    expect(tasks.some((task) => task.title.toLowerCase().includes("mobile"))).toBe(true);
  });

  it("scores readiness and exposes meaningful blockers", () => {
    const tasks = extractLaunchTasks({ productBrief: "Short brief", constraints: "" });
    const result = checkLaunchReadiness({ launchDate: "2026-09-01", productBrief: "Short brief", constraints: "", assets: "", tasks });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.categories).toHaveLength(6);
    expect(result.blockers.length).toBeGreaterThan(0);
  });
});
