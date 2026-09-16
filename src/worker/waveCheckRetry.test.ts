import { describe, expect, it, vi } from "vitest";
import worker from "./waveCheckRetry";

vi.mock("../server/wave-check/hubspotRetry", () => ({
  drainHubSpotRetryQueue: vi.fn().mockResolvedValue(undefined),
}));

import { drainHubSpotRetryQueue } from "../server/wave-check/hubspotRetry";

describe("waveCheckRetry worker", () => {
  it("drains due HubSpot retries from the scheduled event", async () => {
    const pending: Promise<unknown>[] = [];
    const db = { prepare: vi.fn() };
    const env = {
      OTDAISURFER: db,
      HUBSPOT_ACCESS_TOKEN: "hubspot-token",
    };
    const ctx = {
      waitUntil(promise: Promise<unknown>) {
        pending.push(promise);
      },
    };

    await worker.scheduled({} as ScheduledController, env as never, ctx as never);
    await Promise.all(pending);

    expect(drainHubSpotRetryQueue).toHaveBeenCalledWith(db, "hubspot-token");
  });

  it("does not expose a public retry trigger", async () => {
    const response = await worker.fetch();
    expect(response.status).toBe(404);
  });
});
