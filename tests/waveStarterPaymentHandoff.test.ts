import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const webhook = readFileSync("supabase/functions/membership-webhook/index.ts", "utf8");

describe("Wave Starter Stripe handoff", () => {
  it("records completed Wave Starter checkouts in payments for CRM handoff", () => {
    expect(webhook).toContain('session.metadata?.offer_slug === "wave-starter"');
    expect(webhook).toContain('.from("payments")');
    expect(webhook).toContain('product_slug: "wave-starter"');
    expect(webhook).toContain('crm_sync_status: "queued"');
    expect(webhook).toContain('stripe_checkout_session_id: session.id');
  });

  it("keeps membership checkout handling intact", () => {
    expect(webhook).toContain('"ai-surfer-membership"');
    expect(webhook).toContain("upsertCheckoutMembership");
  });
});
