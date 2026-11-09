import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const dashboardSource = readFileSync(resolve(here, "MembersDashboard.tsx"), "utf8");

describe("members dashboard brand", () => {
  it("places the command-center title on a readable glass panel", () => {
    expect(dashboardSource).toContain('aria-label="Members Command Center brand"');
    expect(dashboardSource).toContain("style={styles.brandPanel}");
    expect(dashboardSource).toContain('background: "rgba(2,6,23,.88)"');
    expect(dashboardSource).toContain('backdropFilter: "blur(14px)"');
  });

  it("adds a click-through silver sparkle halo around the brand", () => {
    expect(dashboardSource).toContain('aria-hidden="true"');
    expect(dashboardSource).toContain('style={styles.silverSparkles}');
    expect(dashboardSource).toContain('pointerEvents: "none"');
    expect(dashboardSource).toContain('color: "#f8fafc"');
  });
});
