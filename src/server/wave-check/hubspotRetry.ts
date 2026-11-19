const HUBSPOT_API_BASE = "https://api.hubapi.com/crm/v3/objects";
export const DEFAULT_HUBSPOT_TIMEOUT_MS = 3000;
const RETRY_BASE_SECONDS = 60;
const RETRY_MAX_SECONDS = 21600;
const RETRY_BATCH_SIZE = 5;

export type HubSpotSyncStatus = "synced" | "not_configured" | "failed";

export type WaveCheckHubSpotContext = {
  submissionId: string;
  score: number;
  topCategory: string;
  recommendedAgent: string;
  confidenceLabel: string;
  opportunities: string[];
};

export type D1StatementLike = {
  bind: (...values: unknown[]) => D1StatementLike;
  run: () => Promise<unknown>;
  first: <T>() => Promise<T | null>;
  all?: <T>() => Promise<{ results?: T[] }>;
};

export type D1Like = {
  prepare: (query: string) => D1StatementLike;
  batch: (statements: D1StatementLike[]) => Promise<unknown[]>;
};

type RetryRow = {
  submission_id: string;
  email: string;
  attempts: number;
  context_json: string | null;
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

async function createWaveCheckNote(
  contactId: string,
  context: WaveCheckHubSpotContext,
  accessToken: string,
  timeoutMs: number,
) {
  const opportunityLines = context.opportunities.length
    ? context.opportunities.map((item) => `• ${item}`).join("\n")
    : "• No opportunity details supplied";

  const body = [
    "Free AI Wave Check",
    `Score: ${context.score}/100 (${context.confidenceLabel})`,
    `Biggest Wave: ${context.topCategory}`,
    `Recommended Agent: ${context.recommendedAgent}`,
    "Opportunities:",
    opportunityLines,
    `Submission receipt: ${context.submissionId}`,
  ].join("\n");

  await hubSpotRequest("/notes", accessToken, {
    method: "POST",
    body: JSON.stringify({
      properties: {
        hs_timestamp: new Date().toISOString(),
        hs_note_body: body,
      },
      associations: [{
        to: { id: contactId },
        types: [{
          associationCategory: "HUBSPOT_DEFINED",
          associationTypeId: 202,
        }],
      }],
    }),
  }, timeoutMs);
}

export async function syncHubSpotContact(
  email: string,
  accessToken?: string,
  timeoutMs = DEFAULT_HUBSPOT_TIMEOUT_MS,
  context?: WaveCheckHubSpotContext,
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

    let contactId = search.results?.[0]?.id ?? null;

    if (!contactId) {
      const created = await hubSpotRequest("/contacts", accessToken, {
        method: "POST",
        body: JSON.stringify({
          properties: {
            email,
            lifecyclestage: "lead",
          },
        }),
      }, timeoutMs);
      contactId = created.id ?? null;
    }

    if (!contactId) throw new Error("HubSpot contact sync returned no contact id");

    if (context) {
      await createWaveCheckNote(contactId, context, accessToken, timeoutMs);
    }

    return "synced";
  } catch (error) {
    console.error("Wave Check HubSpot sync failed", error);
    return "failed";
  }
}

async function ensureRetryTable(db: D1Like) {
  // Versioned tables are invisible to legacy Pages and Worker consumers.
  // Never copy v2 records into the legacy queue: it discards diagnostic context.
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS wave_check_hubspot_retry_v2_context (
      submission_id TEXT PRIMARY KEY,
      context_json TEXT NOT NULL
    )
  `).run();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS wave_check_hubspot_retry_v2 (
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
  context?: WaveCheckHubSpotContext,
) {
  await ensureRetryTable(db);
  const statements: D1StatementLike[] = [];
  if (context) {
    statements.push(db.prepare(`
      INSERT INTO wave_check_hubspot_retry_v2_context (submission_id, context_json)
      VALUES (?, ?)
      ON CONFLICT(submission_id) DO UPDATE SET context_json = excluded.context_json
    `).bind(submissionId, JSON.stringify(context)));
  }
  const now = Math.floor(Date.now() / 1000);

  statements.push(db.prepare(`
    INSERT INTO wave_check_hubspot_retry_v2 (
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
  ));
  await db.batch(statements);
}

function decodeRetryContext(json: string, submissionId: string): WaveCheckHubSpotContext {
  const value: unknown = JSON.parse(json);
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid retry context");
  }
  const context = value as Record<string, unknown>;
  if (context.submissionId !== submissionId
    || typeof context.score !== "number" || !Number.isFinite(context.score)
    || typeof context.topCategory !== "string"
    || typeof context.recommendedAgent !== "string"
    || typeof context.confidenceLabel !== "string"
    || !Array.isArray(context.opportunities)
    || !context.opportunities.every((item) => typeof item === "string")) {
    throw new Error("Invalid retry context");
  }
  return context as WaveCheckHubSpotContext;
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
    SELECT retry.submission_id, retry.email, retry.attempts, context.context_json
    FROM wave_check_hubspot_retry_v2 AS retry
    LEFT JOIN wave_check_hubspot_retry_v2_context AS context
      ON context.submission_id = retry.submission_id
    WHERE retry.next_attempt_at <= ?
    ORDER BY retry.next_attempt_at ASC
    LIMIT ?
  `).bind(now, RETRY_BATCH_SIZE);

  const rows = statement.all
    ? (await statement.all<RetryRow>()).results ?? []
    : [];

  for (const row of rows) {
    let status: HubSpotSyncStatus = "failed";
    try {
      const context = row.context_json === null
        ? undefined
        : decodeRetryContext(row.context_json, row.submission_id);
      status = await syncHubSpotContact(row.email, accessToken, timeoutMs, context);
    } catch {
      // Preserve malformed queued context for diagnosis; never discard a report.
      console.error("Wave Check retry context could not be decoded");
    }
    if (status === "synced") {
      await db.batch([
        db.prepare("DELETE FROM wave_check_hubspot_retry_v2 WHERE submission_id = ?").bind(row.submission_id),
        db.prepare("DELETE FROM wave_check_hubspot_retry_v2_context WHERE submission_id = ?").bind(row.submission_id),
      ]);
      continue;
    }

    const attempts = row.attempts + 1;
    const delay = Math.min(
      RETRY_BASE_SECONDS * (2 ** attempts),
      RETRY_MAX_SECONDS,
    );

    await db.prepare(`
      UPDATE wave_check_hubspot_retry_v2
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
