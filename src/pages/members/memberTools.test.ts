import { describe, expect, it } from "vitest";

import { generateMemberToolResult, memberTools } from "./memberTools";

const input = {
  business: "Tideway Bakery",
  audience: "busy local parents",
  goal: "increase weekday orders",
  offer: "family breakfast boxes",
  monthlyRevenueGoal: "5000",
  averageSale: "500",
  recurringPrice: "100",
};

describe("member tool generators", () => {
  it("ships the eight approved member tools", () => {
    expect(memberTools.map((tool) => tool.name)).toEqual([
      "Prompt Wave Builder",
      "Follow-Up Message Maker",
      "Offer Builder",
      "My 30-Day Wave Plan",
      "Offer Wave Builder",
      "Revenue Tide Planner",
      "Content Wave Generator",
      "Sales Wave Script Builder",
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

  it("builds good, better and best packages with recurring revenue", () => {
    const result = generateMemberToolResult("offer-wave-builder", input);

    expect(result).toContain("GOOD — STARTER WAVE");
    expect(result).toContain("BETTER — GROWTH WAVE");
    expect(result).toContain("BEST — BIG KAHUNA");
    expect(result).toContain("MONTHLY REVENUE");
    expect(result).toContain("7-DAY LAUNCH");
  });

  it("calculates a practical revenue path from the member's numbers", () => {
    const result = generateMemberToolResult("revenue-tide-planner", {
      ...input,
      monthlyRevenueGoal: "5000",
      averageSale: "500",
      recurringPrice: "100",
    });

    expect(result).toContain("10 one-time sales");
    expect(result).toContain("3 sales per week");
    expect(result).toContain("50 recurring members");
    expect(result).toContain("$5,000");
    expect(result).toContain("33 qualified conversations per week");
  });

  it("accepts commonly formatted currency amounts", () => {
    const result = generateMemberToolResult("revenue-tide-planner", {
      ...input,
      monthlyRevenueGoal: "$5,000",
      averageSale: "$500",
      recurringPrice: "$100",
    });

    expect(result).toContain("10 one-time sales");
  });

  it.each(["5,00", "49,99", "1 00"])(
    "rejects malformed currency input %s instead of changing its value",
    (averageSale) => {
      expect(() =>
        generateMemberToolResult("revenue-tide-planner", {
          ...input,
          averageSale,
        }),
      ).toThrow("Enter valid U.S. dollar amounts");
    },
  );

  it("preserves cents in displayed revenue amounts", () => {
    const result = generateMemberToolResult("revenue-tide-planner", {
      ...input,
      monthlyRevenueGoal: "100",
      averageSale: "$0.50",
      recurringPrice: "$49.99",
    });

    expect(result).toContain("200 one-time sales at $0.50 each");
    expect(result).toContain("3 recurring members at $49.99 per month");
  });

  it("reports the actual revenue produced by rounded-up recurring members", () => {
    const result = generateMemberToolResult("revenue-tide-planner", {
      ...input,
      monthlyRevenueGoal: "5000",
      averageSale: "500",
      recurringPrice: "3000",
    });

    expect(result).toContain("2 recurring members at $3,000 per month for $6,000");
    expect(result).not.toContain("2 recurring members at $3,000 per month for $5,000");
  });

  it("rejects missing or invalid revenue numbers", () => {
    expect(() =>
      generateMemberToolResult("revenue-tide-planner", {
        ...input,
        monthlyRevenueGoal: "5000",
        averageSale: "0",
        recurringPrice: "100",
      }),
    ).toThrow("Enter amounts greater than zero");
  });

  it("creates a seven-day content campaign with hooks and calls to action", () => {
    const result = generateMemberToolResult("content-wave-generator", input);

    expect(result).toContain("7-DAY CONTENT WAVE");
    expect(result).toContain("DAY 1 — PROBLEM HOOK");
    expect(result).toContain("REEL IDEAS");
    expect(result).toContain("CALLS TO ACTION");
  });

  it("creates a complete sales conversation script with closes and follow-up", () => {
    const result = generateMemberToolResult("sales-wave-script-builder", input);

    expect(result).toContain("SALES WAVE SCRIPT");
    expect(result).toContain("OPENING");
    expect(result).toContain("DISCOVERY QUESTIONS");
    expect(result).toContain("OBJECTION RESPONSES");
    expect(result).toContain("SOFT CLOSE");
    expect(result).toContain("DIRECT CLOSE");
    expect(result).toContain("TEXT / DM VERSION");
    expect(result).toContain("NOT READY YET FOLLOW-UP");
  });
});
