import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { launchHandler } from "./api/launch";
import { aiFinLeadHandler } from "./api/aiFinLeads";
import { aiFinAuditStartHandler } from "./api/aiFinAudits";
import { aiFinHandoffHandler } from "./api/aiFinHandoffs";
import { aiFinFollowUpHandler } from "./api/aiFinFollowUps";
import { aiFinOnboardingHandler } from "./api/aiFinOnboarding";
import { apiRateLimit, corsOrigin, requireApiKey } from "./security";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: corsOrigin,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-AI-Surfer-Key"],
    maxAge: 86400,
  }),
);
app.use(express.json({ limit: "1mb" }));

// Health stays public. All /api routes are rate-limited and protected.
app.use("/api", apiRateLimit);
app.use("/api", requireApiKey);

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "launch-desk-api",
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
    supabaseConfigured: Boolean(
      (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL) &&
      (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY),
    ),
  });
});

app.post("/api/launch", launchHandler);
app.post("/api/ai-fin/leads", aiFinLeadHandler);
app.post("/api/ai-fin/audit/start", aiFinAuditStartHandler);
app.post("/api/ai-fin/handoff", aiFinHandoffHandler);
app.post("/api/ai-fin/follow-up", aiFinFollowUpHandler);
app.post("/api/ai-fin/onboarding", aiFinOnboardingHandler);

app.get("/api/dashboard", (_req, res) => {
  res.json({
    system: "Ocean Tide Drop AI",
    agents: [
      { name: "WaveCloser", status: "active", jobs: 12 },
      { name: "LeadHunter", status: "active", jobs: 34 },
      { name: "PricingBrain", status: "learning", jobs: 8 },
      { name: "RetentionAI", status: "active", jobs: 21 }
    ],
    metrics: { leads: 18, conversions: 6, revenue: 3480, uptime: 99.98 }
  });
});

app.use((error: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error instanceof Error && error.message.includes("CORS")) {
    return res.status(403).json({
      ok: false,
      error: "ORIGIN_NOT_ALLOWED",
      message: "This origin is not allowed to call the AI SURFER API.",
    });
  }

  next(error);
});

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => console.log(`🌊 AI Backend running on http://localhost:${PORT}`));
