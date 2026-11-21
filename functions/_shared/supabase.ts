import type { MembershipTier } from "../../src/crew/types";
import type { ResolvedCrewEnv } from "./env";

type VerifiedUser = {
  id: string;
  email?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
};

type SupabaseRequest = {
  env: ResolvedCrewEnv;
  token: string;
};

function headers(env: ResolvedCrewEnv, token: string, extra?: HeadersInit): Headers {
  const result = new Headers(extra);
  result.set("apikey", env.SUPABASE_ANON_KEY);
  result.set("Authorization", `Bearer ${token}`);
  result.set("Content-Type", "application/json");
  return result;
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function verifySupabaseUser({
  env,
  token,
}: SupabaseRequest): Promise<VerifiedUser | null> {
  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: headers(env, token),
  });
  if (!response.ok) return null;
  return (await readJson(response)) as VerifiedUser;
}

export async function loadMembershipTier({
  env,
  token,
}: SupabaseRequest & { authId: string }): Promise<MembershipTier> {
  const url = new URL(`${env.SUPABASE_URL}/rest/v1/users`);
  url.searchParams.set("select", "tier");
  url.searchParams.set("limit", "1");

  const response = await fetch(url, {
    headers: headers(env, token),
  });
  if (!response.ok) return "Member";

  const rows = (await readJson(response)) as Array<{ tier?: MembershipTier }> | null;
  return rows?.[0]?.tier ?? "Member";
}

export async function loadBusinessProfile({
  env,
  token,
}: SupabaseRequest): Promise<Record<string, unknown> | null> {
  const url = new URL(`${env.SUPABASE_URL}/rest/v1/business_profiles`);
  url.searchParams.set("select", "*");
  url.searchParams.set("limit", "1");

  const response = await fetch(url, {
    headers: headers(env, token),
  });
  if (!response.ok) return null;
  const rows = (await readJson(response)) as Array<Record<string, unknown>> | null;
  return rows?.[0] ?? null;
}

export async function loadProjectHistory({
  env,
  token,
  projectId,
}: SupabaseRequest & { projectId: string }): Promise<Array<Record<string, unknown>>> {
  const url = new URL(`${env.SUPABASE_URL}/rest/v1/agent_messages`);
  url.searchParams.set("select", "role,content,created_at");
  url.searchParams.set("project_id", `eq.${projectId}`);
  url.searchParams.set("order", "created_at.asc");
  url.searchParams.set("limit", "24");

  const response = await fetch(url, {
    headers: headers(env, token),
  });
  if (!response.ok) return [];
  return ((await readJson(response)) as Array<Record<string, unknown>> | null) ?? [];
}

export async function reserveCrewRun({
  env,
  token,
  projectId,
  agentSlug,
  inputSummary,
}: SupabaseRequest & {
  projectId: string;
  agentSlug: string;
  inputSummary: string;
}): Promise<{ id: string; request_id: string }> {
  const response = await fetch(
    `${env.SUPABASE_URL}/rest/v1/rpc/reserve_crew_run`,
    {
      method: "POST",
      headers: headers(env, token),
      body: JSON.stringify({
        requested_agent_slug: agentSlug,
        requested_project_id: projectId,
        requested_input_summary: inputSummary,
      }),
    },
  );

  const payload = await readJson(response);
  if (!response.ok) {
    const code =
      typeof payload === "object" && payload && "message" in payload
        ? String(payload.message)
        : "run_reservation_failed";
    throw new Error(code);
  }
  return payload as { id: string; request_id: string };
}

export async function completeCrewRun({
  env,
  token,
  runId,
  status,
  output,
  errorCode,
}: SupabaseRequest & {
  runId: string;
  status: "complete" | "failed";
  output?: string;
  errorCode?: string;
}): Promise<void> {
  const url = new URL(`${env.SUPABASE_URL}/rest/v1/agent_runs`);
  url.searchParams.set("id", `eq.${runId}`);

  await fetch(url, {
    method: "PATCH",
    headers: headers(env, token, { Prefer: "return=minimal" }),
    body: JSON.stringify({
      status,
      output: output ? { text: output } : null,
      error_code: errorCode ?? null,
      finished_at: new Date().toISOString(),
    }),
  });
}
