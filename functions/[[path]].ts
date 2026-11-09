interface AssetFetcher {
  fetch(input: Request | string | URL): Promise<Response>;
}

interface PagesContext {
  request: Request;
  next: () => Promise<Response>;
  env: {
    ASSETS: AssetFetcher;
  };
}

import { handleRouteStatus } from "./route-status";

function fetchSpaShell(context: PagesContext): Promise<Response> {
  const shellUrl = new URL(context.request.url);
  shellUrl.pathname = "/";
  shellUrl.search = "";
  shellUrl.hash = "";

  const shellRequest = new Request(shellUrl.toString(), {
    method: context.request.method === "HEAD" ? "HEAD" : "GET",
    headers: context.request.headers,
  });

  return context.env.ASSETS.fetch(shellRequest);
}

export const onRequest = (context: PagesContext): Promise<Response> =>
  handleRouteStatus(
    context.request,
    context.next,
    () => fetchSpaShell(context),
  );
