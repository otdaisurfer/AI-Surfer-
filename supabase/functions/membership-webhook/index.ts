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
const HUBSPOT_ACCESS_TOKEN = Deno.env.get("HUBSPOT_ACCESS_TOKEN");
const HUBSPOT_WAVE_STARTER_PRODUCT_ID = "332891806434";
const HUBSPOT_OWNER_ID = "96366886";
const HUBSPOT_API_BASE = "https://api.hubapi.com/crm/objects/2026-03";

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

async function recordWaveStarterPayment(session: StripeType.Checkout.Session) {
  if (!admin) throw new Error("Supabase admin unavailable");

  const email = session.customer_details?.email ?? session.customer_email ?? null;
  const paymentIntentId = typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id ?? null;

  const { error } = await admin
    .from("payments")
    .upsert({
      email: email?.trim().toLowerCase() || null,
      amount: session.amount_total ?? 49700,
      currency: session.currency ?? "usd",
      status: session.payment_status === "paid" ? "succeeded" : "pending",
      stripe_payment_id: paymentIntentId,
      stripe_checkout_session_id: session.id,
      product_slug: "wave-starter",
      description: "Wave Starter",
      metadata: {
        crm_sync_status: "queued",
        offer_slug: "wave-starter",
        source: session.metadata?.source ?? "otdaisurfer-pricing",
      },
    }, { onConflict: "stripe_checkout_session_id" });

  if (error) throw error;
}

type HubSpotRecord = {
  id: string;
};

async function hubSpotRequest(path: string, init: RequestInit) {
  if (!HUBSPOT_ACCESS_TOKEN) throw new Error("HubSpot access token unavailable");

  const response = await fetch(`https://api.hubapi.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`HubSpot ${response.status}: ${body}`);
  }

  return response.json();
}

async function findOrCreateHubSpotContact(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  const search = await hubSpotRequest(`${HUBSPOT_API_BASE}/contacts/search`, {
    method: "POST",
    body: JSON.stringify({
      filterGroups: [{
        filters: [{
          propertyName: "email",
          operator: "EQ",
          value: cleanEmail,
        }],
      }],
      limit: 1,
      properties: ["email"],
    }),
  }) as { results?: HubSpotRecord[] };

  if (search.results?.[0]?.id) return search.results[0].id;

  const created = await hubSpotRequest(`${HUBSPOT_API_BASE}/contacts`, {
    method: "POST",
    body: JSON.stringify({ properties: { email: cleanEmail } }),
  }) as HubSpotRecord;

  return created.id;
}

async function findHubSpotWaveStarterDeal(sessionId: string) {
  const dealname = `Wave Starter - ${sessionId}`;
  const search = await hubSpotRequest(`${HUBSPOT_API_BASE}/deals/search`, {
    method: "POST",
    body: JSON.stringify({
      filterGroups: [{
        filters: [{
          propertyName: "dealname",
          operator: "EQ",
          value: dealname,
        }],
      }],
      limit: 1,
      properties: ["dealname"],
    }),
  }) as { results?: HubSpotRecord[] };

  return search.results?.[0]?.id ?? null;
}

async function createHubSpotWaveStarterDeal(
  session: StripeType.Checkout.Session,
  contactId: string,
) {
  const deal = await hubSpotRequest(`${HUBSPOT_API_BASE}/deals`, {
    method: "POST",
    body: JSON.stringify({
      properties: {
        dealname: `Wave Starter - ${session.id}`,
        pipeline: "default",
        dealstage: "closedwon",
        dealtype: "newbusiness",
        amount: "497",
        deal_currency_code: "USD",
        hubspot_owner_id: HUBSPOT_OWNER_ID,
      },
      associations: [{
        to: { id: contactId },
        types: [{
          associationCategory: "HUBSPOT_DEFINED",
          associationTypeId: 3,
        }],
      }],
    }),
  }) as HubSpotRecord;

  return deal.id;
}

async function createHubSpotWaveStarterLineItem(dealId: string) {
  const lineItem = await hubSpotRequest(`${HUBSPOT_API_BASE}/line_items`, {
    method: "POST",
    body: JSON.stringify({
      properties: {
        name: "🌊 Wave Starter",
        quantity: "1",
        price: "497",
        hs_sku: "wave-starter",
        hs_line_item_currency_code: "USD",
        hs_product_id: HUBSPOT_WAVE_STARTER_PRODUCT_ID,
      },
      associations: [{
        to: { id: dealId },
        types: [{
          associationCategory: "HUBSPOT_DEFINED",
          associationTypeId: 20,
        }],
      }],
    }),
  }) as HubSpotRecord;

  return lineItem.id;
}

async function markWaveStarterCrmSynced(
  session: StripeType.Checkout.Session,
  contactId: string,
  dealId: string,
  lineItemId: string | null,
) {
  if (!admin) throw new Error("Supabase admin unavailable");

  const { error } = await admin
    .from("payments")
    .update({
      metadata: {
        crm_sync_status: "synced",
        offer_slug: "wave-starter",
        source: session.metadata?.source ?? "otdaisurfer-pricing",
        hubspot_contact_id: contactId,
        hubspot_deal_id: dealId,
        hubspot_line_item_id: lineItemId,
        hubspot_product_id: HUBSPOT_WAVE_STARTER_PRODUCT_ID,
      },
    })
    .eq("stripe_checkout_session_id", session.id);

  if (error) throw error;
}

async function syncWaveStarterToHubSpot(session: StripeType.Checkout.Session) {
  if (!HUBSPOT_ACCESS_TOKEN) throw new Error("HubSpot access token unavailable");

  const email = session.customer_details?.email ?? session.customer_email ?? "";
  if (!email) throw new Error("Wave Starter checkout is missing a customer email");

  const contactId = await findOrCreateHubSpotContact(email);
  let dealId = await findHubSpotWaveStarterDeal(session.id);
  let lineItemId: string | null = null;

  if (!dealId) {
    dealId = await createHubSpotWaveStarterDeal(session, contactId);
    lineItemId = await createHubSpotWaveStarterLineItem(dealId);
  }

  await markWaveStarterCrmSynced(session, contactId, dealId, lineItemId);
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

      if (session.metadata?.offer_slug === "wave-starter") {
        await recordWaveStarterPayment(session);
        try {
          await syncWaveStarterToHubSpot(session);
        } catch (err) {
          console.error("Wave Starter HubSpot sync failed", err);
        }
      } else if (session.metadata?.product_slug === "ai-surfer-membership") {
        const email = session.customer_details?.email ?? session.customer_email ?? "";
        const tier = session.metadata?.tier;
        const customerId = customerIdFrom(session.customer);

        if (email && tier) {
          await upsertCheckoutMembership(email, customerId, tier);
        }
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
