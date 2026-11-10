import { z } from "zod";
import { extractBearerToken } from "../../../../../src/server/crew/runContract";
import { requireCrewEnv, type CrewEnv, type ResolvedCrewEnv } from "../../../../_shared/env";
import { verifySupabaseUser } from "../../../../_shared/supabase";

type Context = {
  request: Request;
  env: CrewEnv;
  params: { id?: string };
};

const BodySchema = z.object({ expectedVersion: z.number().int().positive() });

function headers(env: CrewEnv, token: string): HeadersInit {
  return {
    apikey: env.SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function onRequestPost(context: Context): Promise<Response> {
  let env: ResolvedCrewEnv;
  try {
    env = requireCrewEnv(context.env);
  } catch {
    return Response.json({ error: "crew_not_configured" }, { status: 503 });
  }

  const token = extractBearerToken(context.request.headers.get("Authorization"));
  const approvalId = context.params.id;
  if (!token) return Response.json({ error: "authentication_required" }, { status: 401 });
  if (!approvalId) return Response.json({ error: "approval_not_found" }, { status: 404 });

  const user = await verifySupabaseUser({ env, token });
  if (!user) return Response.json({ error: "invalid_session" }, { status: 401 });

  const parsed = BodySchema.safeParse(await context.request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "invalid_approval_version" }, { status: 400 });
  }

  const response = await fetch(
    `${env.SUPABASE_URL}/rest/v1/rpc/approve_crew_email`,
    {
      method: "POST",
      headers: headers(env, token),
      body: JSON.stringify({
        requested_approval_id: approvalId,
        expected_version: parsed.data.expectedVersion,
      }),
    },
  );

  if (!response.ok) {
    return Response.json(
      { error: "approval_conflict", message: "This draft changed. Review it again before approving." },
      { status: 409 },
    );
  }

  return Response.json({ status: "approved", approvalId });
}
