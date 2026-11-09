import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const webhook = readFileSync("supabase/functions/membership-webhook/index.ts", "utf8");

describe("Wave Starter HubSpot handoff", () => {
  it("uses the active product for both line items and payment metadata", () => {
    const readiness = readFileSync("functions/api/launch-readiness.ts", "utf8");
    const productId = /const HUBSPOT_WAVE_STARTER_PRODUCT_ID = "(\d+)"/;
    expect(webhook.match(productId)?.[1]).toBe("340889702100");
    expect(webhook.match(productId)?.[1]).toBe(readiness.match(productId)?.[1]);
    expect(webhook).toContain("hs_product_id: HUBSPOT_WAVE_STARTER_PRODUCT_ID");
    expect(webhook).toContain("hubspot_product_id: HUBSPOT_WAVE_STARTER_PRODUCT_ID");
    expect(webhook).not.toContain("332891806434");
  });

  it("prepares the paid Wave Starter checkout for HubSpot CRM sync", () => {
    expect(webhook).toContain('Deno.env.get("HUBSPOT_ACCESS_TOKEN")');
    expect(webhook).toContain('const HUBSPOT_WAVE_STARTER_PRODUCT_ID = "340889702100"');
    expect(webhook).toContain('const HUBSPOT_OWNER_ID = "96366886"');
    expect(webhook).toContain('pipeline: "default"');
    expect(webhook).toContain('dealstage: "closedwon"');
    expect(webhook).toContain('dealtype: "newbusiness"');
    expect(webhook).toContain('amount: "497"');
    expect(webhook).toContain('deal_currency_code: "USD"');
    expect(webhook).toContain('hs_sku: "wave-starter"');
    expect(webhook).toContain('crm_sync_status: "synced"');
  });

  it("keeps Stripe payment handling successful when HubSpot is unavailable", () => {
    expect(webhook).toContain('crm_sync_status: "queued"');
    expect(webhook).toContain('console.error("Wave Starter HubSpot sync failed"');
    expect(webhook).not.toContain('throw new Error("HubSpot sync failed")');
  });
});
