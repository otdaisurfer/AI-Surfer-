import { serve } from "https://deno.land/std/http/server.ts";
import Stripe from "https://esm.sh/stripe?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const signature = req.headers.get("stripe-signature")!;
  const body = await req.text();

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const email = session.customer_details?.email || session.customer_email;
    const tier = session.metadata?.tier;
    const productSlug = session.metadata?.product_slug;

    if (email && tier && productSlug === "ai-surfer-membership") {
      await supabase
        .from("users")
        .update({
          tier,
          subscription_status: "active",
          stripe_customer_email: email,
          updated_at: new Date().toISOString(),
        })
        .eq("email", email);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const customerId = typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;

    if (customerId) {
      const customer = await stripe.customers.retrieve(customerId);
      const email = !customer.deleted ? customer.email : null;

      if (email) {
        await supabase
          .from("users")
          .update({
            tier: "free",
            subscription_status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("email", email);
      }
    }
  }

  return new Response("ok", { status: 200 });
});