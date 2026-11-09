// @vitest-environment node
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { describe, expect, it } from "vitest";

describe("Wave Starter HubSpot runtime handoff", () => {
  it("sends checkout to valid HubSpot URLs and records the active product", async () => {
    const requests: { url: string; body: any }[] = [];
    let paymentUpdate: any;
    const source = readFileSync("supabase/functions/membership-webhook/index.ts", "utf8")
      .replace(/^import .*;\r?\n/gm, "");
    const compiled = ts.transpileModule(source, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
    }).outputText;
    const context = {
      Deno: { env: { get: () => "test-only" }, serve: () => {} },
      Stripe: class {
        static createSubtleCryptoProvider() { return {}; }
      },
      createClient: () => ({
        from: () => ({
          update: (value: unknown) => {
            paymentUpdate = value;
            return { eq: async () => ({ error: null }) };
          },
        }),
      }),
      fetch: async (url: string, init: RequestInit) => {
        requests.push({ url, body: JSON.parse(init.body as string) });
        const parsed = new URL(url);
        if (parsed.origin !== "https://api.hubapi.com") throw new Error("Invalid HubSpot origin");
        const result = parsed.pathname.endsWith("/contacts/search")
          ? { results: [{ id: "contact-1" }] }
          : parsed.pathname.endsWith("/deals/search")
            ? { results: [] }
            : { id: parsed.pathname.endsWith("/line_items") ? "line-1" : "deal-1" };
        return { ok: true, json: async () => result };
      },
    };
    await runInNewContext(compiled + '\nsyncWaveStarterToHubSpot({id:"cs_fixture", customer_email:"buyer@example.com"});', context);
    expect(requests.map(({ url }) => url)).toEqual([
      "https://api.hubapi.com/crm/v3/objects/contacts/search",
      "https://api.hubapi.com/crm/v3/objects/deals/search",
      "https://api.hubapi.com/crm/v3/objects/deals",
      "https://api.hubapi.com/crm/v3/objects/line_items",
    ]);
    expect(requests[3].body.properties.hs_product_id).toBe("340889702100");
    expect(paymentUpdate.metadata).toMatchObject({
      crm_sync_status: "synced",
      hubspot_product_id: "340889702100",
      hubspot_contact_id: "contact-1",
      hubspot_deal_id: "deal-1",
      hubspot_line_item_id: "line-1",
    });
  });
});
