const SUPABASE_URL = "https://mkgnyarwiscttobnytin.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJyZWZlcmVuY2Uta2V5Iiwicm9sZSI6ImFub24ifQ.placeholder";
const HUBSPOT_API_BASE = "https://api.hubapi.com/crm/v3/objects";
const DEFAULT_HUBSPOT_TIMEOUT_MS = 3000;
const RATE_LIMIT_WINDOW_SECONDS = 600;
const RATE_LIMIT_MAX_SUBMISSIONS = 8;
const RETRY_BASE_SECONDS = 60;
const RETRY_MAX_SECONDS = 21600;
const RETRY_BATCH_SIZE = 5;

type WaveCheckSubmission = {
  submission_id: string;
  email: string;
  answers: Record<string, string>;
  score: number;
  top_category: string;
  opportunities: string[];
  recommended_agent: string;
  confidence_label: string;
  source: "wave-audit";
  report_version: number;
};

type HubSpotSyncStatus = "synced" | "not_configured" | "failed";
type RateLimitCheck = (request: Request) => Promise<boolean>;
type BackgroundHubSpotHandoff = (email: string, submissionId: string) => void;

type D1StatementLike = {
  bind: (...values: unknown[]) => D1StatementLike;
  run: () => Promise<unknown>;
  first: <T>() => Promise<T | null>;
  all?: <T>() => Promise<{ results?: T[] }>;
};

type D1Like = { prepare: (query: string) => D1StatementLike };

type RetryRow = {
  submission_id: string;
  email: string;
  attempts: number;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isValidSubmission(value: unknown): value is WaveCheckSubmission {
  if (!value || typeof value !== "object") return false;
  const row = value as Partial<WaveCheckSubmission>;
  return Boolean(
    isUuid(row.submission_id) &&
    typeof row.email === "string" && row.email.trim().includes("@") &&
    row.answers && typeof row.answers === "object" &&
    Number.isInteger(row.score) && Number(row.score) >= 0 && Number(row.score) <= 100 &&
    typeof row.top_category === "string" && row.top_category.length > 0 &&
    Array.isArray(row.opportunities) &&
    typeof row.recommended_agent === "string" &&
    typeof row.confidence_label === "string" &&
    row.source === "wave-audit" &&
    row.report_version === 1
  );
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function makeD1RateLimitCheck(db?: D1Like): RateLimitCheck | undefined {
  if (!db) return undefined;
  return async (request) => {
    const clientIp = request.headers.get("CF-Connecting-IP");
    if (!clientIp) return true;
    const key = await sha256(clientIp);
    const now = Math.floor(Date.now() / 1000);
    const cutoff = now - RATE_LIMIT_WINDOW_SECONDS;
    await db.prepare(`CREATE TABLE IF NOT EXISTS wave_check_rate_limits (client_key TEXT PRIMARY KEY, window_start INTEGER NOT NULL, count INTEGER NOT NULL)`).run();
    await db.prepare(`INSERT INTO wave_check_rate_limits (client_key, window_start, count) VALUES (?, ?, 1)
      ON CONFLICT(client_key) DO UPDATE SET
      window_start = CASE WHEN wave_check_rate_limits.window_start < ? THEN excluded.window_start ELSE wave_check_rate_limits.window_start END,
      count = CASE WHEN wave_check_rate_limits.window_start < ? THEN 1 ELSE wave_check_rate_limits.count + 1 END`)
      .bind(key, now, cutoff, cutoff).run();
    const row = await db.prepare("SELECT count FROM wave_check_rate_limits WHERE client_key = ?").bind(key).first<{ count: number }>();
    return !row || row.count <= RATE_LIMIT_MAX_SUBMISSIONS;
  };
}

async function hubSpotRequest(path: string, accessToken: string, init: RequestInit, timeoutMs: number) {
  const response = await fetch(`${HUBSPOT_API_BASE}${path}`, {
    ...init,
    signal: AbortSignal.timeout(timeoutMs),
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`HubSpot ${response.status}: ${detail.slice(0, 500)}`);
  }
  return response.json() as Promise<{ id?: string; results?: Array<{ id: string }> }>;
}

async function syncHubSpotContact(email: string, accessToken?: string, timeoutMs = DEFAULT_HUBSPOT_TIMEOUT_MS): Promise<HubSpotSyncStatus> {
  if (!accessToken) return "not_configured";
  try {
    const search = await hubSpotRequest("/contacts/search", accessToken, {
      method: "POST",
      body: JSON.stringify({ filterGroups: [{ filters: [{ propertyName: "email", operator: "EQ", value: email }] }], limit: 1, properties: ["email"] }),
    }, timeoutMs);
    if (search.results?.[0]?.id) return "synced";
    await hubSpotRequest("/contacts", accessToken, {
      method: "POST",
      body: JSON.stringify({ properties: { email, lifecyclestage: "lead" } }),
    }, timeoutMs);
    return "synced";
  } catch (error) {
    console.error("Wave Check HubSpot sync failed", error);
    return "failed";
  }
}

async function ensureRetryTable(db: D1Like) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS wave_check_hubspot_retry (
    submission_id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    next_attempt_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`).run();
}

async function enqueueHubSpotRetry(db: D1Like, email: string, submissionId: string) {
  await ensureRetryTable(db);
  const now = Math.floor(Date.now() / 1000);
  await db.prepare(`INSERT INTO wave_check_hubspot_retry (submission_id, email, attempts, next_attempt_at, created_at, updated_at)
    VALUES (?, ?, 0, ?, ?, ?)
    ON CONFLICT(submission_id) DO UPDATE SET email = excluded.email, updated_at = excluded.updated_at`)
    .bind(submissionId, email, now + RETRY_BASE_SECONDS, now, now).run();
}

export async function drainHubSpotRetryQueue(db: D1Like | undefined, accessToken?: string, timeoutMs = DEFAULT_HUBSPOT_TIMEOUT_MS) {
  if (!db || !accessToken) return;
  await ensureRetryTable(db);
  const now = Math.floor(Date.now() / 1000);
  const statement = db.prepare(`SELECT submission_id, email, attempts FROM wave_check_hubspot_retry WHERE next_attempt_at <= ? ORDER BY next_attempt_at ASC LIMIT ?`).bind(now, RETRY_BATCH_SIZE);
  const rows = statement.all ? (await statement.all<RetryRow>()).results ?? [] : [];
  for (const row of rows) {
    const status = await syncHubSpotContact(row.email, accessToken, timeoutMs);
    if (status === "synced") {
      await db.prepare("DELETE FROM wave_check_hubspot_retry WHERE submission_id = ?").bind(row.submission_id).run();
      continue;
    }
    const attempts = row.attempts + 1;
    const delay = Math.min(RETRY_BASE_SECONDS * (2 ** attempts), RETRY_MAX_SECONDS);
    await db.prepare("UPDATE wave_check_hubspot_retry SET attempts = ?, next_attempt_at = ?, updated_at = ? WHERE submission_id = ?")
      .bind(attempts, now + delay, now, row.submission_id).run();
  }
}

async function runBackgroundHubSpotHandoff(db: D1Like | undefined, email: string, submissionId: string, accessToken?: string, timeoutMs = DEFAULT_HUBSPOT_TIMEOUT_MS) {
  const status = await syncHubSpotContact(email, accessToken, timeoutMs);
  if (status === "failed" && db) await enqueueHubSpotRetry(db, email, submissionId);
  await drainHubSpotRetryQueue(db, accessToken, timeoutMs);
}

export async function handleWaveCheckSubmit(
  request: Request,
  hubSpotAccessToken?: string,
  hubSpotTimeoutMs = DEFAULT_HUBSPOT_TIMEOUT_MS,
  rateLimitCheck?: RateLimitCheck,
  backgroundHubSpotHandoff?: BackgroundHubSpotHandoff,
): Promise<Response> {
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
  let submission: unknown;
  try { submission = await request.json(); } catch { return json({ error: "Invalid JSON." }, 400); }
  if (!isValidSubmission(submission)) return json({ error: "Invalid Wave Check submission." }, 400);
  if (rateLimitCheck && !(await rateLimitCheck(request))) return json({ error: "Too many Wave Check submissions. Please try again shortly." }, 429);

  const normalized: WaveCheckSubmission = { ...submission, email: submission.email.trim().toLowerCase() };
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/wave_audit_leads`, {
      method: "POST",
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(normalized),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      const duplicate = response.status === 409 && detail.includes("23505");
      if (!duplicate) return json({ error: "Unable to confirm Wave Check save." }, 502);
    }

    if (backgroundHubSpotHandoff && hubSpotAccessToken) {
      backgroundHubSpotHandoff(normalized.email, normalized.submission_id);
      return json({ status: "saved", submissionId: normalized.submission_id, hubspotStatus: "queued" });
    }

    const hubspotStatus = await syncHubSpotContact(normalized.email, hubSpotAccessToken, hubSpotTimeoutMs);
    return json({ status: "saved", submissionId: normalized.submission_id, hubspotStatus });
  } catch (error) {
    console.error("Wave Check same-origin save failed", error);
    return json({ error: "Unable to confirm Wave Check save." }, 502);
  }
}

type WaveCheckEnv = { HUBSPOT_ACCESS_TOKEN?: string; OTDAISURFER?: D1Like };

export const onRequestPost: PagesFunction<WaveCheckEnv> = async ({ request, env, waitUntil }) =>
  handleWaveCheckSubmit(
    request,
    env.HUBSPOT_ACCESS_TOKEN,
    DEFAULT_HUBSPOT_TIMEOUT_MS,
    makeD1RateLimitCheck(env.OTDAISURFER),
    env.HUBSPOT_ACCESS_TOKEN
      ? (email, submissionId) => waitUntil(runBackgroundHubSpotHandoff(env.OTDAISURFER, email, submissionId, env.HUBSPOT_ACCESS_TOKEN))
      : undefined,
  );
