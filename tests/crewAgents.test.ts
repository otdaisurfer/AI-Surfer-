import { describe, expect, it } from "vitest";
import {
  CREW_AGENT_INSTRUCTIONS,
  createCrewAgents,
} from "../src/server/crew/agents";

describe("Crew Engine agent definitions", () => {
  it("defines focused instructions for all six specialists", () => {
    expect(Object.keys(CREW_AGENT_INSTRUCTIONS)).toEqual([
      "wave-scout",
      "sales-rider",
      "content-creator",
      "customer-care-cove",
      "automation-architect",
      "big-kahuna",
    ]);

    for (const instructions of Object.values(CREW_AGENT_INSTRUCTIONS)) {
      expect(instructions).toContain("Quick Wave Summary");
      expect(instructions).toContain("Research Sources");
      expect(instructions).toContain("Best Next Step");
    }
  });

  it("keeps outbound communication behind explicit approval", () => {
    expect(CREW_AGENT_INSTRUCTIONS["sales-rider"]).toContain(
      "Never send email",
    );
    expect(CREW_AGENT_INSTRUCTIONS["customer-care-cove"]).toContain(
      "Never send email",
    );
    expect(CREW_AGENT_INSTRUCTIONS["big-kahuna"]).toContain(
      "cannot bypass approval",
    );
  });

  it("creates Big Kahuna as manager of the five bounded specialists", () => {
    const agents = createCrewAgents("gpt-5.6-terra");
    expect(agents["wave-scout"].name).toBe("Wave Scout");
    expect(agents["big-kahuna"].name).toBe("Big Kahuna");
    expect(agents["big-kahuna"].tools).toHaveLength(6);
  });
});
