interface BrowserRunBinding {
  quickAction(action: string, options: Record<string, unknown>): Promise<Response>;
}

interface Env {
  BROWSER: BrowserRunBinding;
}

const allowedHosts = new Set(["otdaisurfer.surf", "www.otdaisurfer.surf"]);

function resolveTarget(request: Request): URL | Response {
  const requestUrl = new URL(request.url);
  const rawTarget = requestUrl.searchParams.get("url") || "https://otdaisurfer.surf/";

  let target: URL;
  try {
    target = new URL(rawTarget);
  } catch {
    return Response.json({ error: "Invalid url parameter." }, { status: 400 });
  }

  if (!allowedHosts.has(target.hostname) || !["http:", "https:"].includes(target.protocol)) {
    return Response.json(
      { error: "Browser Run is restricted to the AI SURFER website." },
      { status: 403 },
    );
  }

  return target;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method !== "GET") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    if (url.pathname === "/health") {
      return Response.json({
        status: "ok",
        service: "ai-surfer-browser",
        browserRun: true,
      });
    }

    if (url.pathname === "/screenshot") {
      const target = resolveTarget(request);
      if (target instanceof Response) return target;

      return env.BROWSER.quickAction("screenshot", {
        url: target.toString(),
        screenshotOptions: { fullPage: true },
      });
    }

    return Response.json(
      {
        service: "AI SURFER Browser Run",
        routes: ["GET /health", "GET /screenshot?url=https://otdaisurfer.surf/"],
      },
      { status: 200 },
    );
  },
};
