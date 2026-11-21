export type CrewEnv = {
  OPENAI_API_KEY: string;
  OPENAI_MODEL?: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  RESEND_API_KEY?: string;
  FROM_EMAIL?: string;
};

export type ResolvedCrewEnv = CrewEnv & {
  OPENAI_API_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
};

const PUBLIC_SUPABASE_URL = "https://mkgnyarwiscttobnytin.supabase.co";
const PUBLIC_SUPABASE_ANON_KEY =
  "sb_publishable_Jp0Laxs-KoieNMD5hqLA0w_jCnrxATm";

export function requireCrewEnv(env: CrewEnv): ResolvedCrewEnv {
  const resolved: ResolvedCrewEnv = {
    ...env,
    OPENAI_API_KEY: env.OPENAI_API_KEY?.trim() || "",
    SUPABASE_URL: env.SUPABASE_URL?.trim() || PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY:
      env.SUPABASE_ANON_KEY?.trim() || PUBLIC_SUPABASE_ANON_KEY,
  };

  if (!resolved.OPENAI_API_KEY) {
    throw new Error("Crew runtime configuration is incomplete.");
  }

  return resolved;
}
