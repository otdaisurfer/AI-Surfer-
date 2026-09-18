import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("src/features/ai-fin/AiFinChat.tsx", "utf8");

describe("AI Fin mobile safeguards", () => {
  it("uses the dynamic viewport and phone-safe panel gutters", () => {
    expect(source).toContain("calc(100dvh - 24px)");
    expect(source).toContain("width: 'min(410px, calc(100vw - 24px))'");
    expect(source).toContain("right: 12");
    expect(source).toContain("bottom: 12");
  });

  it("keeps text inputs at 16px to avoid mobile focus zoom", () => {
    expect(source).toContain("fontSize: 16");
    expect((source.match(/fontSize: 16/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });

  it("keeps primary icon controls at least 44px", () => {
    expect(source).toContain("minWidth: 44");
    expect(source).toContain("minHeight: 44");
    expect(source).toContain("width: 44, height: 44");
  });
});
