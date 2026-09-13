import Stripe from "npm:stripe@14.25.0";
import { createClient } from "npm:@supabase/supabase-js@2";
import type { Stripe as StripeType } from "npm:stripe@14.25.0";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || (() => {
  const raw = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed.default || parsed.service_role || parsed.serviceRole || null;
  } catch {
    return null;
  }
})();
const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "sk_test_webhook_verification_only", {
  apiVersion: "2024-11-20",
});
const cryptoProvider = Stripe.createSubtleCryptoProvider();
const admin = SUPABASE_URL && SERVICE_ROLE_KEY ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY) : null;

function text(message: string, status = 200) {
  return new Response(message, {
    status,
    headers: { "Content-Type": "text/plain" },
  });
}

async function upsertCheckoutMembership(
  email: string,
  customerId: string | null,
  tier: string,
) {
  if (!admin) throw new Error("Supabase admin unavailable");
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) throw new Error("Missing customer email");

  const payload: Record<string, unknown> = {
    email: cleanEmail,
    tier,
    status: "active",
    updated_at: new Date().toISOString(),
  };
  if (customerId) payload.stripe_customer_id = customerId;

  const { error } = await admin.from("users").upsert(payload, { onConflict: "email" });
  if (error) throw error;
}

async function updateMembershipByCustomer(
  customerId: string,
  changes: { tier?: string; status: "active" | "cancelled" | "paused" | "trialing" },
) {
  if (!admin) throw new Error("Supabase admin unavailable");

  const payload: Record<string, unknown> = {
    status: changes.status,
    updated_at: new Date().toISOString(),
  };
  if (changes.tier) payload.tier = changes.tier;

  const { error } = await admin
    .from("users")
    .update(payload)
    .eq("stripe_customer_id", customerId);

  if (error) throw error;
}

function customerIdFrom(
  customer: string | StripeType.Customer | StripeType.DeletedCustomer | null,
) {
  return typeof customer === "string" ? customer : customer?.id ?? null;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return text("Method Not Allowed", 405);
  if (!admin || !WEBHOOK_SECRET) return text("Server configuration incomplete", 500);

  const signature = req.headers.get("Stripe-Signature");
  if (!signature) return text("Missing Stripe-Signature", 400);

  const body = await req.text();

  let event: StripeType.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      WEBHOOK_SECRET,
      undefined,
      cryptoProvider,
    );
  } catch (err) {
    return text(err instanceof Error ? err.message : "Invalid webhook signature", 400);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as StripeType.Checkout.Session;
      if (session.metadata?.product_slug !== "ai-surfer-membership") return text("ok");

      const email = session.customer_details?.email ?? session.customer_email ?? "";
      const tier = session.metadata?.tier;
      const customerId = customerIdFrom(session.customer);

      if (email && tier) {
        await upsertCheckoutMembership(email, customerId, tier);
      }
    }

    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as StripeType.Subscription;
      const customerId = customerIdFrom(subscription.customer);

      if (customerId) {
        if (subscription.status === "active") {
          await updateMembershipByCustomer(customerId, { status: "active" });
        } else if (subscription.status === "trialing") {
          await updateMembershipByCustomer(customerId, { status: "trialing" });
        } else {
          await updateMembershipByCustomer(customerId, { status: "paused" });
        }
      }
    }

    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as StripeType.Invoice;
      const customerId = customerIdFrom(invoice.customer);

      if (customerId) {
        await updateMembershipByCustomer(customerId, { status: "paused" });
      }
    }

    if (event.type === "invoice.paid") {
      const invoice = event.data.object as StripeType.Invoice;
      const customerId = customerIdFrom(invoice.customer);

      if (customerId) {
        await updateMembershipByCustomer(customerId, { status: "active" });
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as StripeType.Subscription;
      const customerId = customerIdFrom(subscription.customer);

      if (customerId) {
        await updateMembershipByCustomer(customerId, {
          tier: "free",
          status: "cancelled",
        });
      }
    }
  } catch (err) {
    console.error("membership webhook processing failed", err);
    return text("Webhook processing failed", 500);
  }

  return text("ok");
});
