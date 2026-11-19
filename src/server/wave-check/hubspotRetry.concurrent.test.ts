// @vitest-environment node
import { DatabaseSync } from "node:sqlite";
import { afterEach, describe, expect, it, vi } from "vitest";
import { drainHubSpotRetryQueue, enqueueHubSpotRetry, type D1Like } from "./hubspotRetry";

const context = {
  submissionId: "concurrent-receipt",
  score: 88,
  topCategory: "Follow-up",
  recommendedAgent: "Sales Rider",
  confidenceLabel: "High opportunity",
  opportunities: ["Reply quickly"],
};

function createDatabase() {
  const sqlite = new DatabaseSync(":memory:");
  const db: D1Like = {
    async batch(statements) {
      sqlite.exec("BEGIN");
      try {
        const results = [];
        for (const statement of statements) results.push(await statement.run());
        sqlite.exec("COMMIT");
        return results;
      } catch (error) {
        sqlite.exec("ROLLBACK");
        throw error;
      }
    },
    prepare(query) {
      const statement = sqlite.prepare(query);
      let values: unknown[] = [];
      const wrapper = {
        bind(...args: unknown[]) {
          values = args;
          return wrapper;
        },
        async run() {
          return statement.run(...values);
        },
        async first<T>() {
          return (statement.get(...values) ?? null) as T | null;
        },
        async all<T>() {
          return { results: statement.all(...values) as T[] };
        },
      };
      return wrapper;
    },
  };
  return { db, sqlite };
}

afterEach(() => vi.unstubAllGlobals());

describe("Wave Check concurrent retry drains", () => {
  it("claims a due receipt once when Pages and Worker drains overlap", async () => {
    const { db, sqlite } = createDatabase();
    await enqueueHubSpotRetry(db, "wave@example.com", context.submissionId, context);
    sqlite.prepare("UPDATE wave_check_hubspot_retry_v2 SET next_attempt_at = 0").run();

    let releaseFetch!: (response: Response) => void;
    const fetchMock = vi.fn(() => new Promise<Response>((resolve) => {
      releaseFetch = resolve;
    }));
    vi.stubGlobal("fetch", fetchMock);

    const firstDrain = drainHubSpotRetryQueue(db, "test-token");
    const secondDrain = drainHubSpotRetryQueue(db, "test-token");

    // Let both queue reads and the atomic claim settle before completing HTTP.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    releaseFetch(Response.json({ results: [{ id: "contact-1" }] }));
    await Promise.all([firstDrain, secondDrain]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(sqlite.prepare("SELECT count(*) AS count FROM wave_check_hubspot_retry_v2").get()?.count).toBe(0);
    expect(sqlite.prepare("SELECT count(*) AS count FROM wave_check_hubspot_retry_v2_context").get()?.count).toBe(0);
    sqlite.close();
  });
});
