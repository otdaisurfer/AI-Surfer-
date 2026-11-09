const SITE_HEALTH_TARGET = "https://otdaisurfer.surf/";

interface SiteHealthEnv {
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_BROWSER_TOKEN?: string;
  SITE_HEALTH_API_KEY?: string;
}

interface SiteHealthContext {
  request: Request;
  env: SiteHealthEnv;
}

interface AccessibilityNode {
  children?: AccessibilityNode[];
}

interface BrowserRunSnapshot {
  success?: boolean;
  result?: {
    screenshot?: string;
    markdown?: string;
    accessibilityTree?: AccessibilityNode;
  };
  meta?: {
    status?: number;
    title?: string;
  };
}

type FetchBrowserRun = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json",
    },
  });
}

function countAccessibilityNodes(root?: AccessibilityNode): number {
  if (!root) return 0;

  let count = 0;
  const pending = [root];

  while (pending.length > 0) {
    const node = pending.pop();
    if (!node) continue;
    count += 1;
    pending.push(...(node.children ?? []));
  }

  return count;
}

function isAuthorized(request: Request, apiKey?: string): boolean {
  if (!apiKey) return false;
  return request.headers.get("Authorization") === `Bearer ${apiKey}`;
}

export async function handleSiteHealth(
  request: Request,
  env: SiteHealthEnv,
  fetchBrowserRun: FetchBrowserRun = fetch,
): Promise<Response> {
  if (!isAuthorized(request, env.SITE_HEALTH_API_KEY)) {
    return jsonResponse({ ok: false, error: "Unauthorized health check." }, 401);
  }

  if (!env.CLOUDFLARE_ACCOUNT_ID || !env.CLOUDFLARE_BROWSER_TOKEN) {
    return jsonResponse(
      { ok: false, error: "Cloudflare Browser Run is not configured." },
      503,
    );
  }

  const endpoint =
    `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(env.CLOUDFLARE_ACCOUNT_ID)}` +
    "/browser-rendering/snapshot";

  let browserResponse: Response;
  try {
    browserResponse = await fetchBrowserRun(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.CLOUDFLARE_BROWSER_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: SITE_HEALTH_TARGET,
        formats: ["screenshot", "markdown", "accessibilityTree"],
        gotoOptions: {
          waitUntil: "networkidle2",
          timeout: 30000,
        },
        screenshotOptions: {
          fullPage: true,
        },
        viewport: {
          width: 1440,
          height: 900,
          deviceScaleFactor: 1,
        },
      }),
    });
  } catch {
    return jsonResponse(
      { ok: false, error: "Cloudflare Browser Run could not be reached." },
      502,
    );
  }

  let snapshot: BrowserRunSnapshot;
  try {
    snapshot = (await browserResponse.json()) as BrowserRunSnapshot;
  } catch {
    snapshot = {};
  }

  if (!browserResponse.ok || snapshot.success !== true || !snapshot.result) {
    return jsonResponse(
      {
        ok: false,
        error: "Cloudflare Browser Run could not complete the health check.",
        upstreamStatus: browserResponse.status,
      },
      502,
    );
  }

  const screenshot = snapshot.result.screenshot ?? "";
  const markdown = snapshot.result.markdown ?? "";
  const accessibilityNodes = countAccessibilityNodes(
    snapshot.result.accessibilityTree,
  );
  const httpStatus = snapshot.meta?.status ?? null;
  const issues: string[] = [];

  if (httpStatus === null || httpStatus < 200 || httpStatus >= 400) {
    issues.push("The rendered page did not return a healthy HTTP status.");
  }
  if (!screenshot) issues.push("Browser Run did not capture a screenshot.");
  if (!markdown.trim()) issues.push("Browser Run did not extract readable content.");
  if (accessibilityNodes === 0) {
    issues.push("Browser Run did not find an accessibility tree.");
  }

  const browserMsHeader = browserResponse.headers.get("X-Browser-Ms-Used");
  const browserMsUsed = browserMsHeader ? Number.parseInt(browserMsHeader, 10) : null;

  return jsonResponse(
    {
      ok: true,
      target: SITE_HEALTH_TARGET,
      checkedAt: new Date().toISOString(),
      status: issues.length === 0 ? "healthy" : "degraded",
      browserMsUsed: Number.isFinite(browserMsUsed) ? browserMsUsed : null,
      page: {
        httpStatus,
        title: snapshot.meta?.title ?? null,
      },
      signals: {
        hasScreenshot: screenshot.length > 0,
        markdownCharacters: markdown.length,
        accessibilityNodes,
      },
      issues,
      evidence: {
        screenshot,
        markdown,
      },
    },
    200,
  );
}

export const onRequestPost = (context: SiteHealthContext): Promise<Response> =>
  handleSiteHealth(context.request, context.env);
