-- Make Stripe checkout session IDs idempotent for payment/webhook retries.
create unique index if not exists payments_stripe_checkout_session_id_key
  on public.payments (stripe_checkout_session_id);
