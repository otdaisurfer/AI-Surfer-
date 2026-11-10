import type { MembershipTier } from "../../crew/types";

type VerifiedUserShape = {
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
};

type CrewPromptInput = {
  task: string;
  businessProfile: Record<string, unknown>;
  projectHistory: Array<Record<string, unknown>>;
};

export function extractBearerToken(header: string | null): string | null {
  if (!header) return null;
  const match = /^Bearer\s+([^\s]+)$/i.exec(header.trim());
  return match?.[1] ?? null;
}

export function tierFromVerifiedUser(
  user: VerifiedUserShape,
  databaseTier: MembershipTier,
): MembershipTier {
  return user.app_metadata?.role === "owner" ? "Owner" : databaseTier;
}

export function buildCrewPrompt({
  task,
  businessProfile,
  projectHistory,
}: CrewPromptInput): string {
  return [
    "Verified member business profile:",
    JSON.stringify(businessProfile, null, 2),
    "",
    "Recent project history:",
    JSON.stringify(projectHistory.slice(-12), null, 2),
    "",
    "Member task:",
    task.trim(),
    "",
    "Complete the task now. Ground business facts in the verified profile and current research. Include source URLs for researched claims.",
  ].join("\n");
}
