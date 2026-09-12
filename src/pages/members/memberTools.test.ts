import { describe, expect, it } from "vitest";

import { generateMemberToolResult, memberTools } from "./memberTools";

const input = {
  business: "Tideway Bakery",
  audience: "busy local parents",
  goal: "increase weekday orders",
  offer: "family breakfast boxes",
};

describe("member tool generators", () => {
  it("ships the four approved member tools", () => {
    expect(memberTools.map((tool) => tool.name)).toEqual([
      "Prompt Wave Builder",
      "Follow-Up Message Maker",
      "Offer Builder",
      "My 30-Day Wave Plan",
    ]);
  });

  it.each(memberTools)("generates a useful $name result from member details", (tool) => {
    const result = generateMemberToolResult(tool.id, input);

    expect(result).toContain("Tideway Bakery");
    expect(result).toContain("busy local parents");
    expect(result).toContain(
      tool.id === "follow-up-maker" ? "increasing weekday orders" : "increase weekday orders",
    );
    expect(result).toContain("family breakfast boxes");
    expect(result.length).toBeGreaterThan(250);
  });

  it("rejects incomplete tool inputs with a clear message", () => {
    expect(() =>
      generateMemberToolResult("offer-builder", { ...input, audience: "" }),
    ).toThrow("Complete all four fields");
  });

  it("uses natural grammar when a goal starts with an action verb", () => {
    const actionInput = {
      business: "Ocean Tide Drop AI SURFER",
      audience: "local business owners",
      goal: "Generate more qualifying leads",
      offer: "AI Wave Check",
    };

    const followUp = generateMemberToolResult("follow-up-maker", actionInput);
    const offer = generateMemberToolResult("offer-builder", actionInput);

    expect(followUp).toContain("your goal of generating more qualifying leads");
    expect(followUp).not.toContain("your goal to Generate");
    expect(offer).toContain("progress toward generating more qualifying leads");
    expect(offer).not.toContain("progress toward Generate");
  });

  it("rejects a pasted result in place of a business name", () => {
    expect(() =>
      generateMemberToolResult("thirty-day-plan", {
        ...input,
        business: "THE OCEAN TIDE DROP AI SURFER OFFER\nWHO IT HELPS\nLocal business owners",
      }),
    ).toThrow("Enter only your business name");
  });
});
