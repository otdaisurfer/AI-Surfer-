import type { NextFunction, Request, Response } from "express";

const DEFAULT_ALLOWED_ORIGINS = [
  "https://otdaisurfer.surf",
  "https://www.otdaisurfer.surf",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3001",
];

type RateEntry = {
  count: number;
  resetAt: number;
};

const rateEntries = new Map<string, RateEntry>();

function parseAllowedOrigins() {
  const configured = process.env.AI_SURFER_ALLOWED_ORIGINS
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return new Set(configured?.length ? configured : DEFAULT_ALLOWED_ORIGINS);
}

export function isAllowedOrigin(origin?: string | null) {
  if (!origin) return true;
  return parseAllowedOrigins().has(origin);
}

export function corsOrigin(origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
  if (isAllowedOrigin(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error("Origin not allowed by AI SURFER CORS policy"));
}

function getClientIp(req: Request) {
  const forwarded = req.headers["x-forwarded-for"];
  const firstForwarded = Array.isArray(forwarded)
    ? forwarded[0]
    : forwarded?.split(",")[0]?.trim();

  return (
    firstForwarded ||
    req.headers["cf-connecting-ip"]?.toString() ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

export function apiRateLimit(req: Request, res: Response, next: NextFunction) {
  const limit = Math.max(1, Number(process.env.AI_SURFER_RATE_LIMIT || 60));
  const windowSeconds = Math.max(1, Number(process.env.AI_SURFER_RATE_WINDOW_SECONDS || 60));
  const now = Date.now();
  const key = getClientIp(req);
  const current = rateEntries.get(key);

  const entry =
    !current || now >= current.resetAt
      ? { count: 0, resetAt: now + windowSeconds * 1000 }
      : current;

  entry.count += 1;
  rateEntries.set(key, entry);

  const remaining = Math.max(0, limit - entry.count);
  const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));

  res.setHeader("RateLimit-Limit", String(limit));
  res.setHeader("RateLimit-Remaining", String(remaining));
  res.setHeader("RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));

  if (entry.count > limit) {
    res.setHeader("Retry-After", String(retryAfterSeconds));
    return res.status(429).json({
      ok: false,
      error: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests. Please try again shortly.",
      retryAfterSeconds,
    });
  }

  next();
}

function extractApiKey(req: Request) {
  const directKey = req.headers["x-ai-surfer-key"]?.toString().trim();
  if (directKey) return directKey;

  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    return auth.slice("Bearer ".length).trim();
  }

  return "";
}

export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const configuredKey = process.env.AI_SURFER_API_KEY?.trim();
  const production = process.env.NODE_ENV === "production";
  const requireKey =
    process.env.AI_SURFER_REQUIRE_API_KEY === "true" ||
    (production && process.env.AI_SURFER_REQUIRE_API_KEY !== "false");

  if (!configuredKey) {
    if (!requireKey) {
      next();
      return;
    }

    return res.status(503).json({
      ok: false,
      error: "API_SECURITY_NOT_CONFIGURED",
      message: "This API is not accepting protected requests until its access key is configured.",
    });
  }

  const suppliedKey = extractApiKey(req);
  if (!suppliedKey || suppliedKey !== configuredKey) {
    return res.status(401).json({
      ok: false,
      error: "UNAUTHORIZED",
      message: "A valid AI SURFER API key is required.",
    });
  }

  next();
}
