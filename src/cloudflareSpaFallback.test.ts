import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Cloudflare Pages SPA routing", () => {
  it("rewrites direct app routes to index.html", () => {
    const redirects = readFileSync("public/_redirects", "utf8");
    expect(redirects).toContain("/* /index.html 200");
  });
});
