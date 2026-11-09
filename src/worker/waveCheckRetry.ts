import {
  drainHubSpotRetryQueue,
  type D1Like,
} from "../server/wave-check/hubspotRetry";

type Env = {
  OTDAISURFER: D1Like;
  HUBSPOT_ACCESS_TOKEN?: string;
};

export default {
  async scheduled(
    _controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    if (!env.HUBSPOT_ACCESS_TOKEN) return;

    ctx.waitUntil(
      drainHubSpotRetryQueue(
        env.OTDAISURFER,
        env.HUBSPOT_ACCESS_TOKEN,
      ),
    );
  },

  async fetch(): Promise<Response> {
    return new Response("Not Found", { status: 404 });
  },
};
