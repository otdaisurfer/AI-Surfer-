type Metadata = { purchase_kind?: string } | null;
type BillingObject = {
    metadata?: Metadata;
    subscription_details?: { metadata?: Metadata } | null;
    parent?: { subscription_details?: { metadata?: Metadata } | null } | null;
};

// Support subscriptions are separate purchases and must never change member access.
export function isOptionalSupportBillingEvent(event: { type: string; data: { object: unknown } }): boolean {
  const object = event.data.object as BillingObject;
  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    return object.metadata?.purchase_kind === "optional_support";
  }
  if (event.type === "invoice.paid" || event.type === "invoice.payment_failed") {
    // Stripe's older API places the snapshot at subscription_details; newer APIs use parent.
    const metadata = object.parent?.subscription_details?.metadata ?? object.subscription_details?.metadata;
    return metadata?.purchase_kind === "optional_support";
  }
  return false;
}
