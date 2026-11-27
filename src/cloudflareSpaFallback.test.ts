import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Cloudflare Pages SPA routing", () => {
  it("allows native pricing asset matching and the built-in SPA fallback", () => {
    const redirects = readFileSync("public/_redirects", "utf8");
    expect(redirects).not.toMatch(/^\/pricing\s/m);
    expect(redirects).not.toMatch(/^\/\*\s/m);
    expect(existsSync("public/404.html")).toBe(false);
  });
});
