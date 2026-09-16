const HUBSPOT_API_BASE = "https://api.hubapi.com/crm/v3/objects";
export const DEFAULT_HUBSPOT_TIMEOUT_MS = 3000;
const RETRY_BASE_SECONDS = 60;
const RETRY_MAX_SECONDS = 21600;
const RETRY_BATCH_SIZE = 5;

export type HubSpotSyncStatus = "synced" | "not_configured" | "failed";

export type D1StatementLike = {
  bind: (...values: unknown[]) => D1StatementLike;
  run: () => Promise<unknown>;
  first: <T>() => Promise<T | null>;
  all?: <T>() => Promise<{ results?: T[] }>;
};

export type D1Like = {
  prepare: (query: string) => D1StatementLike;
};

type RetryRow = {
  submission_id: string;
  email: string;
  attempts: number;
};

async function hubSpotRequest(
  path: string,
  accessToken: string,
  init: RequestInit,
  timeoutMs: number,
) {
  const response = await fetch(`${HUBSPOT_API_BASE}${path}`, {
    ...init,
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`HubSpot ${response.status}: ${detail.slice(0, 500)}`);
  }

  return response.json() as Promise<{ id?: string; results?: Array<{ id: string }> }>;
}

export async function syncHubSpotContact(
  email: string,
  accessToken?: string,
  timeoutMs = DEFAULT_HUBSPOT_TIMEOUT_MS,
): Promise<HubSpotSyncStatus> {
  if (!accessToken) return "not_configured";

  try {
    const search = await hubSpotRequest("/contacts/search", accessToken, {
      method: "POST",
      body: JSON.stringify({
        filterGroups: [{
          filters: [{
            propertyName: "email",
            operator: "EQ",
            value: email,
          }],
        }],
        limit: 1,
        properties: ["email"],
      }),
    }, timeoutMs);

    if (search.results?.[0]?.id) return "synced";

    await hubSpotRequest("/contacts", accessToken, {
      method: "POST",
      body: JSON.stringify({
        properties: {
          email,
          lifecyclestage: "lead",
        },
      }),
    }, timeoutMs);

    return "synced";
  } catch (error) {
    console.error("Wave Check HubSpot sync failed", error);
    return "failed";
  }
}

async function ensureRetryTable(db: D1Like) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS wave_check_hubspot_retry (
      submission_id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      next_attempt_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `).run();
}

export async function enqueueHubSpotRetry(
  db: D1Like,
  email: string,
  submissionId: string,
) {
  await ensureRetryTable(db);
  const now = Math.floor(Date.now() / 1000);

  await db.prepare(`
    INSERT INTO wave_check_hubspot_retry (
      submission_id,
      email,
      attempts,
      next_attempt_at,
      created_at,
      updated_at
    ) VALUES (?, ?, 0, ?, ?, ?)
    ON CONFLICT(submission_id) DO UPDATE SET
      email = excluded.email,
      updated_at = excluded.updated_at
  `).bind(
    submissionId,
    email,
    now + RETRY_BASE_SECONDS,
    now,
    now,
  ).run();
}

export async function drainHubSpotRetryQueue(
  db: D1Like | undefined,
  accessToken?: string,
  timeoutMs = DEFAULT_HUBSPOT_TIMEOUT_MS,
) {
  if (!db || !accessToken) return;
  await ensureRetryTable(db);

  const now = Math.floor(Date.now() / 1000);
  const statement = db.prepare(`
    SELECT submission_id, email, attempts
    FROM wave_check_hubspot_retry
    WHERE next_attempt_at <= ?
    ORDER BY next_attempt_at ASC
    LIMIT ?
  `).bind(now, RETRY_BATCH_SIZE);

  const rows = statement.all
    ? (await statement.all<RetryRow>()).results ?? []
    : [];

  for (const row of rows) {
    const status = await syncHubSpotContact(row.email, accessToken, timeoutMs);
    if (status === "synced") {
      await db.prepare(
        "DELETE FROM wave_check_hubspot_retry WHERE submission_id = ?",
      ).bind(row.submission_id).run();
      continue;
    }

    const attempts = row.attempts + 1;
    const delay = Math.min(
      RETRY_BASE_SECONDS * (2 ** attempts),
      RETRY_MAX_SECONDS,
    );

    await db.prepare(`
      UPDATE wave_check_hubspot_retry
      SET attempts = ?, next_attempt_at = ?, updated_at = ?
      WHERE submission_id = ?
    `).bind(
      attempts,
      now + delay,
      now,
      row.submission_id,
    ).run();
  }
}
