import { z } from "zod";
import { extractBearerToken } from "../../../../../src/server/crew/runContract";
import { requireCrewEnv, type CrewEnv, type ResolvedCrewEnv } from "../../../../_shared/env";
import { verifySupabaseUser } from "../../../../_shared/supabase";

type Context = {
  request: Request;
  env: CrewEnv;
  params: { id?: string };
};

const SnapshotSchema = z.object({
  to: z.string().email(),
  recipientName: z.string().max(160).optional(),
  subject: z.string().trim().min(1).max(240),
  body: z.string().trim().min(1).max(50000),
  replyTo: z.string().email(),
});

function headers(env: CrewEnv, token: string, prefer?: string): Headers {
  const result = new Headers({
    apikey: env.SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  });
  if (prefer) result.set("Prefer", prefer);
  return result;
}

async function parseJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}


async function finalizeEmail(
  env: ResolvedCrewEnv,
  token: string,
  approvalId: string,
  succeeded: boolean,
  providerMessageId: string | null,
): Promise<boolean> {
  const response = await fetch(
    `${env.SUPABASE_URL}/rest/v1/rpc/finalize_crew_email`,
    {
      method: "POST",
      headers: headers(env, token),
      body: JSON.stringify({
        requested_approval_id: approvalId,
        requested_provider_message_id: providerMessageId,
        succeeded,
        requested_error_code: succeeded ? null : "provider_rejected",
      }),
    },
  );
  return response.ok;
}

export async function onRequestPost(context: Context): Promise<Response> {
  let env: ResolvedCrewEnv;
  try {
    env = requireCrewEnv(context.env);
  } catch {
    return Response.json({ error: "crew_not_configured" }, { status: 503 });
  }

  if (!env.RESEND_API_KEY || !env.FROM_EMAIL) {
    return Response.json(
      { error: "email_not_configured", message: "Email delivery is not configured yet." },
      { status: 503 },
    );
  }

  const token = extractBearerToken(context.request.headers.get("Authorization"));
  const approvalId = context.params.id;
  if (!token) return Response.json({ error: "authentication_required" }, { status: 401 });
  if (!approvalId) return Response.json({ error: "approval_not_found" }, { status: 404 });

  const user = await verifySupabaseUser({ env, token });
  if (!user) return Response.json({ error: "invalid_session" }, { status: 401 });

  const requestedKey =
    context.request.headers.get("Idempotency-Key") || crypto.randomUUID();

  const claimResponse = await fetch(
    `${env.SUPABASE_URL}/rest/v1/rpc/claim_approved_crew_email`,
    {
      method: "POST",
      headers: headers(env, token),
      body: JSON.stringify({
        requested_approval_id: approvalId,
        requested_idempotency_key: requestedKey,
      }),
    },
  );

  if (!claimResponse.ok) {
    return Response.json(
      { error: "email_not_approved", message: "Review and approve this exact draft before sending." },
      { status: 409 },
    );
  }

  const claimPayload = await parseJson(claimResponse);
  const claim = (Array.isArray(claimPayload) ? claimPayload[0] : claimPayload) as {
    id?: string;
    status?: string;
    idempotency_key?: string;
    provider_message_id?: string;
  } | null;

  if (!claim?.id || !claim.idempotency_key) {
    return Response.json({ error: "email_claim_failed" }, { status: 503 });
  }

  if (claim.status === "sent") {
    return Response.json({
      status: "sent",
      duplicate: true,
      providerMessageId: claim.provider_message_id ?? null,
    });
  }

  const approvalUrl = new URL(`${env.SUPABASE_URL}/rest/v1/approval_requests`);
  approvalUrl.searchParams.set("id", `eq.${approvalId}`);
  approvalUrl.searchParams.set("select", "approved_snapshot");
  approvalUrl.searchParams.set("limit", "1");

  const approvalResponse = await fetch(approvalUrl, {
    headers: headers(env, token),
  });
  const approvalPayload = await parseJson(approvalResponse);
  const row = (approvalPayload as Array<{ approved_snapshot?: unknown }> | null)?.[0];
  const snapshot = SnapshotSchema.safeParse(row?.approved_snapshot);

  if (!approvalResponse.ok || !snapshot.success) {
    return Response.json({ error: "invalid_approved_snapshot" }, { status: 409 });
  }

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": claim.idempotency_key,
    },
    body: JSON.stringify({
      from: env.FROM_EMAIL,
      to: snapshot.data.to,
      subject: snapshot.data.subject,
      text: snapshot.data.body,
      reply_to: snapshot.data.replyTo,
    }),
  });
  const resendPayload = await parseJson(resendResponse) as { id?: string } | null;

  if (!resendResponse.ok || !resendPayload?.id) {
    await finalizeEmail(env, token, approvalId, false, null);
    return Response.json(
      { error: "email_delivery_failed", message: "The email was not delivered. You can review and retry it." },
      { status: 502 },
    );
  }

  const finalized = await finalizeEmail(
    env,
    token,
    approvalId,
    true,
    resendPayload.id,
  );
  if (!finalized) {
    return Response.json(
      { error: "email_finalize_failed", message: "Delivery succeeded, but its status needs reconciliation." },
      { status: 503 },
    );
  }

  return Response.json({
    status: "sent",
    duplicate: false,
    providerMessageId: resendPayload.id,
  });
}
