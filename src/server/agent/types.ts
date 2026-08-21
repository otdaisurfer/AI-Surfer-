import { z } from "zod";

export const LaunchBriefSchema = z.object({
  productBrief: z.string().min(20),
  audience: z.string().min(3),
  launchDate: z.string().min(4),
  constraints: z.string().default("None specified"),
  assets: z.string().default("None specified"),
  channels: z.array(z.string()).min(1),
});

export type LaunchBrief = z.infer<typeof LaunchBriefSchema>;

export const LaunchTaskSchema = z.object({
  title: z.string(),
  priority: z.enum(["P0", "P1", "P2"]),
  dependency: z.string(),
  ownerRole: z.string(),
  rationale: z.string(),
});

export type LaunchTask = z.infer<typeof LaunchTaskSchema>;

export const ReadinessSchema = z.object({
  score: z.number().min(0).max(100),
  status: z.enum(["ready", "at-risk", "blocked"]),
  categories: z.array(z.object({ category: z.string(), score: z.number(), gap: z.string() })),
  blockers: z.array(z.string()),
});

export type Readiness = z.infer<typeof ReadinessSchema>;
