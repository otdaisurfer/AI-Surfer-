import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { launchHandler } from "./api/launch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "launch-desk-api", openaiConfigured: Boolean(process.env.OPENAI_API_KEY) });
});

app.post("/api/launch", launchHandler);

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

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => console.log(`🌊 AI Backend running on http://localhost:${PORT}`));
