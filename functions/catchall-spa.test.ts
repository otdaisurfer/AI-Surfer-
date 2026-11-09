import { describe, expect, it, vi } from "vitest";
import { onRequest } from "./[[path]]";

function request(path: string) {
  return new Request(`https://otdaisurfer.surf${path}`);
}

describe("Pages catch-all SPA fallback", () => {
  it.each(["/wave-audit", "/audit/checkout"])(
    "serves the app shell when known React route %s misses the static asset server",
    async (path) => {
      const next = vi.fn(async () => new Response("asset not found", { status: 404 }));
      const assetFetch = vi.fn(async () =>
        new Response("app shell", {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }),
      );

      const response = await onRequest({
        request: request(path),
        next,
        env: { ASSETS: { fetch: assetFetch } },
      });

      expect(response.status).toBe(200);
      expect(await response.text()).toBe("app shell");
      expect(assetFetch).toHaveBeenCalledOnce();

      const input = assetFetch.mock.calls[0]?.[0];
      const shellUrl = input instanceof Request ? input.url : String(input);
      expect(new URL(shellUrl).pathname).toBe("/");
    },
  );
});
