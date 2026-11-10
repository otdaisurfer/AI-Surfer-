import { describe, expect, it } from "vitest";
import {
  CREW_AGENTS,
  crewAgentBySlug,
  minimumTierForAgent,
} from "../src/crew/catalog";
import { hasCrewAccess, unlockedCrewAgents } from "../src/crew/entitlements";

describe("AI SURFER crew catalog", () => {
  it("defines the six approved specialists with stable slugs", () => {
    expect(CREW_AGENTS.map((agent) => agent.slug)).toEqual([
      "wave-scout",
      "sales-rider",
      "content-creator",
      "customer-care-cove",
      "automation-architect",
      "big-kahuna",
    ]);
    expect(new Set(CREW_AGENTS.map((agent) => agent.slug)).size).toBe(6);
  });

  it.each([
    ["wave-scout", "Starter Access"],
    ["sales-rider", "Starter Access"],
    ["content-creator", "Innovator Tier"],
    ["customer-care-cove", "Innovator Tier"],
    ["automation-architect", "Console Tier"],
    ["big-kahuna", "Full Takeover"],
  ] as const)("%s requires %s", (slug, tier) => {
    expect(minimumTierForAgent(slug)).toBe(tier);
    expect(crewAgentBySlug(slug)?.minimumTier).toBe(tier);
  });

  it("enforces the approved membership ladder", () => {
    expect(unlockedCrewAgents("Member")).toEqual([]);
    expect(unlockedCrewAgents("Starter Access")).toEqual([
      "wave-scout",
      "sales-rider",
    ]);
    expect(unlockedCrewAgents("Innovator Tier")).toEqual([
      "wave-scout",
      "sales-rider",
      "content-creator",
      "customer-care-cove",
    ]);
    expect(unlockedCrewAgents("Console Tier")).toEqual([
      "wave-scout",
      "sales-rider",
      "content-creator",
      "customer-care-cove",
      "automation-architect",
    ]);
    expect(unlockedCrewAgents("Full Takeover")).toHaveLength(6);
    expect(unlockedCrewAgents("Owner")).toHaveLength(6);
  });

  it("keeps unknown agents and Member accounts locked", () => {
    expect(hasCrewAccess("Member", "wave-scout")).toBe(false);
    expect(hasCrewAccess("Owner", "not-a-real-agent")).toBe(false);
  });
});
