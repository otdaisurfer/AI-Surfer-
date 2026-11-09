type Next = () => Promise<Response>;
type SpaFallback = () => Promise<Response>;

const EXACT_APP_ROUTES = new Set([
  "/",
  "/pricing",
  "/services",
  "/privacy",
  "/terms",
  "/wave-starter/success",
  "/ai-fin/owner",
  "/wave-audit",
  "/wave-check",
  "/login",
  "/reset-password",
  "/launch-desk",
  "/members",
  "/dashboard",
  "/ai-dashboard",
]);

export function isKnownAppRoute(pathname: string): boolean {
  if (EXACT_APP_ROUTES.has(pathname)) return true;
  if (pathname.startsWith("/members/")) return true;
  if (pathname.startsWith("/audit/")) return true;
  return false;
}

const STATIC_JOURNAL_ROUTES = new Set([
  "/blog",
  "/blog/our-story",
  "/blog/building-ai-surfer-one-wave-at-a-time-episode-1",
]);

function isKnownRoute(pathname: string): boolean {
  if (STATIC_JOURNAL_ROUTES.has(pathname.replace(/\/$/, ""))) return true;
  if (isKnownAppRoute(pathname)) return true;
  if (pathname.startsWith("/api/")) return true;
  return /\/[^/]+\.[^/]+$/.test(pathname);
}

export async function handleRouteStatus(
  request: Request,
  next: Next,
  spaFallback?: SpaFallback,
): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const canUseSpaFallback = request.method === "GET" || request.method === "HEAD";
  const legacyPath = pathname.replace(/\/$/, "");
  if (canUseSpaFallback && (legacyPath === "/reviews" || legacyPath === "/home")) {
    url.pathname = legacyPath === "/reviews" ? "/pricing" : "/";
    return Response.redirect(url.toString(), 301);
  }
  const response = await next();

  if (
    response.status === 404 &&
    canUseSpaFallback &&
    isKnownAppRoute(pathname) &&
    spaFallback
  ) {
    const shell = await spaFallback();
    if (shell.status === 200) return shell;
  }

  if (response.status !== 200 || isKnownRoute(pathname)) return response;

  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "no-store");
  return new Response(response.body, {
    status: 404,
    statusText: "Not Found",
    headers,
  });
}
