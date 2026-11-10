import { requireCrewEnv, type CrewEnv } from "../../_shared/env";

type Context = { env: CrewEnv };

export async function onRequestGet(context: Context): Promise<Response> {
  try {
    const env = requireCrewEnv(context.env);
    return Response.json(
      {
        status: "ready",
        openaiConfigured: true,
        supabaseConfigured: Boolean(env.SUPABASE_URL && env.SUPABASE_ANON_KEY),
        emailConfigured: Boolean(env.RESEND_API_KEY && env.FROM_EMAIL),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      {
        status: "configuration_required",
        openaiConfigured: false,
        supabaseConfigured: true,
        emailConfigured: false,
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
