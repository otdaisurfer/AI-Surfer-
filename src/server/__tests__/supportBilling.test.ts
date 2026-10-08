import { describe, expect, it } from "vitest";
import { isOptionalSupportBillingEvent } from "../../../supabase/functions/membership-webhook/supportBilling";

describe("support billing isolation", () => {
  it.each(["customer.subscription.updated", "customer.subscription.deleted"])("ignores %s for support, while retaining membership handling", (type) => {
    expect(isOptionalSupportBillingEvent({ type, data: { object: { metadata: { purchase_kind: "optional_support" } } } })).toBe(true);
    expect(isOptionalSupportBillingEvent({ type, data: { object: { metadata: {} } } })).toBe(false);
  });

  it.each(["invoice.paid", "invoice.payment_failed"])("ignores %s for support across Stripe invoice versions", (type) => {
    const details = { metadata: { purchase_kind: "optional_support" } };
    expect(isOptionalSupportBillingEvent({ type, data: { object: { subscription_details: details } } })).toBe(true);
    expect(isOptionalSupportBillingEvent({ type, data: { object: { parent: { subscription_details: details } } } })).toBe(true);
    expect(isOptionalSupportBillingEvent({ type, data: { object: { subscription_details: { metadata: {} } } } })).toBe(false);
    expect(isOptionalSupportBillingEvent({ type, data: { object: {} } })).toBe(false);
  });
});
