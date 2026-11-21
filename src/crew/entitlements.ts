import { CREW_AGENTS, isCrewAgentSlug } from "./catalog";
import type { CrewAgentSlug, MembershipTier } from "./types";

export const TIER_RANK: Readonly<Record<MembershipTier, number>> = {
  Member: 0,
  "Starter Access": 1,
  "Innovator Tier": 2,
  "Console Tier": 3,
  "Full Takeover": 4,
  Owner: 5,
};

export function hasCrewAccess(
  tier: MembershipTier,
  agentSlug: string,
): agentSlug is CrewAgentSlug {
  if (!isCrewAgentSlug(agentSlug)) return false;

  const agent = CREW_AGENTS.find((item) => item.slug === agentSlug);
  return Boolean(
    agent && TIER_RANK[tier] >= TIER_RANK[agent.minimumTier],
  );
}

export function unlockedCrewAgents(
  tier: MembershipTier,
): CrewAgentSlug[] {
  return CREW_AGENTS.filter((agent) => hasCrewAccess(tier, agent.slug)).map(
    (agent) => agent.slug,
  );
}
