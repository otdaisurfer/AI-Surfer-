import type {
  CrewAgentDefinition,
  CrewAgentSlug,
  MembershipTier,
} from "./types";

export const CREW_AGENTS = [
  {
    slug: "wave-scout",
    name: "Wave Scout",
    icon: "🔎",
    description:
      "Find qualified business prospects, AI opportunities, competitors, and visibility gaps.",
    minimumTier: "Starter Access",
    guidedStarters: [
      "Find qualified prospects for my business.",
      "Research my competitors and visibility gaps.",
      "Show me the strongest AI opportunities in my market.",
    ],
  },
  {
    slug: "sales-rider",
    name: "Sales Rider",
    icon: "💰",
    description:
      "Turn qualified opportunities into personalized outreach and follow-up.",
    minimumTier: "Starter Access",
    guidedStarters: [
      "Draft personalized outreach for a saved lead.",
      "Build a three-email follow-up sequence.",
      "Turn these lead notes into a sales plan.",
    ],
  },
  {
    slug: "content-creator",
    name: "Content Creator",
    icon: "✍️",
    description:
      "Create campaigns, posts, articles, emails, offers, and content calendars.",
    minimumTier: "Innovator Tier",
    guidedStarters: [
      "Build a thirty-day content calendar.",
      "Turn this offer into a campaign.",
      "Write an article and social posts in my brand voice.",
    ],
  },
  {
    slug: "customer-care-cove",
    name: "Customer Care Cove",
    icon: "💬",
    description:
      "Draft customer responses, FAQs, and thoughtful support solutions.",
    minimumTier: "Innovator Tier",
    guidedStarters: [
      "Draft a helpful reply to this customer.",
      "Create FAQs for my main offer.",
      "Turn these support questions into a knowledge base.",
    ],
  },
  {
    slug: "automation-architect",
    name: "Automation Architect",
    icon: "⚙️",
    description:
      "Design practical workflows, triggers, safeguards, and implementation plans.",
    minimumTier: "Console Tier",
    guidedStarters: [
      "Map this repetitive process into an automation.",
      "Find the best workflow to save my team time.",
      "Design an implementation plan with a manual fallback.",
    ],
  },
  {
    slug: "big-kahuna",
    name: "Big Kahuna",
    icon: "🐋",
    description:
      "Create AI growth strategy and coordinate projects across the specialist crew.",
    minimumTier: "Full Takeover",
    guidedStarters: [
      "Build my 30/60/90-day AI growth strategy.",
      "Prioritize the biggest opportunities across my business.",
      "Coordinate a project using the full AI SURFER crew.",
    ],
  },
] as const satisfies readonly CrewAgentDefinition[];

export function isCrewAgentSlug(value: string): value is CrewAgentSlug {
  return CREW_AGENTS.some((agent) => agent.slug === value);
}

export function crewAgentBySlug(
  slug: string,
): CrewAgentDefinition | undefined {
  return CREW_AGENTS.find((agent) => agent.slug === slug);
}

export function minimumTierForAgent(
  slug: CrewAgentSlug,
): MembershipTier | undefined {
  return crewAgentBySlug(slug)?.minimumTier;
}
