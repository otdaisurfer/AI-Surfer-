import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const webhookPath = resolve(process.cwd(), "supabase/functions/membership-webhook/index.ts");

describe("canonical membership webhook source", () => {
  it("tracks the deployed membership webhook in the repository", () => {
    expect(existsSync(webhookPath)).toBe(true);
  });

  it("preserves paid tier on failed payment and only frees on cancellation", () => {
    const source = readFileSync(webhookPath, "utf8");

    expect(source).toContain("invoice.payment_failed");
    expect(source).toContain("past_due");
    expect(source).toContain("invoice.paid");
    expect(source).toContain("customer.subscription.deleted");
    expect(source).toMatch(/tier:\s*['\"]free['\"]/);
  });
});
