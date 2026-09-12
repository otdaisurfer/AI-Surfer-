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
    expect(result).toContain("increase weekday orders");
    expect(result).toContain("family breakfast boxes");
    expect(result.length).toBeGreaterThan(250);
  });

  it("rejects incomplete tool inputs with a clear message", () => {
    expect(() =>
      generateMemberToolResult("offer-builder", { ...input, audience: "" }),
    ).toThrow("Complete all four fields");
  });
});
