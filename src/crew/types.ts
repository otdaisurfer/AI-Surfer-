export type MembershipTier =
  | "Member"
  | "Starter Access"
  | "Innovator Tier"
  | "Console Tier"
  | "Full Takeover"
  | "Owner";

export type CrewAgentSlug =
  | "wave-scout"
  | "sales-rider"
  | "content-creator"
  | "customer-care-cove"
  | "automation-architect"
  | "big-kahuna";

export type CrewAgentDefinition = {
  slug: CrewAgentSlug;
  name: string;
  icon: string;
  description: string;
  minimumTier: Exclude<MembershipTier, "Member" | "Owner">;
  guidedStarters: readonly string[];
};
