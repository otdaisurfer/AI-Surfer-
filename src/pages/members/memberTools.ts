export type MemberToolId =
  | "prompt-wave-builder"
  | "follow-up-maker"
  | "offer-builder"
  | "thirty-day-plan";

export type MemberToolInput = {
  business: string;
  audience: string;
  goal: string;
  offer: string;
};

export const memberTools: Array<{
  id: MemberToolId;
  icon: string;
  name: string;
  description: string;
}> = [
  {
    id: "prompt-wave-builder",
    icon: "🌊",
    name: "Prompt Wave Builder",
    description: "Turn a business goal into a clear, reusable AI prompt.",
  },
  {
    id: "follow-up-maker",
    icon: "💬",
    name: "Follow-Up Message Maker",
    description: "Create a warm follow-up that moves a lead toward action.",
  },
  {
    id: "offer-builder",
    icon: "🏄‍♀️",
    name: "Offer Builder",
    description: "Shape what you sell into a simple, compelling offer.",
  },
  {
    id: "thirty-day-plan",
    icon: "🗓️",
    name: "My 30-Day Wave Plan",
    description: "Get four focused weeks of practical growth actions.",
  },
];

function cleanInput(input: MemberToolInput): MemberToolInput {
  const cleaned = Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key, value.trim()]),
  ) as MemberToolInput;

  if (Object.values(cleaned).some((value) => !value)) {
    throw new Error("Complete all four fields to build your result.");
  }

  if (cleaned.business.length > 80 || /[\r\n]/.test(cleaned.business)) {
    throw new Error("Enter only your business name—not a previous result.");
  }

  return cleaned;
}

function lowerFirst(value: string): string {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function actionGoal(value: string): string {
  return lowerFirst(value.replace(/^to\s+/i, ""));
}

function gerundGoal(value: string): string {
  const action = actionGoal(value);
  const replacements: Record<string, string> = {
    generate: "generating",
    increase: "increasing",
    improve: "improving",
    create: "creating",
    grow: "growing",
    get: "getting",
    make: "making",
    build: "building",
    attract: "attracting",
    reduce: "reducing",
    save: "saving",
    sell: "selling",
  };
  const [firstWord, ...rest] = action.split(/\s+/);
  const gerund = replacements[firstWord.toLowerCase()];

  return gerund ? [gerund, ...rest].join(" ") : action;
}

export function generateMemberToolResult(
  toolId: MemberToolId,
  rawInput: MemberToolInput,
): string {
  const { business, audience, goal, offer } = cleanInput(rawInput);
  const action = actionGoal(goal);
  const ongoingGoal = gerundGoal(goal);

  switch (toolId) {
    case "prompt-wave-builder":
      return `PROMPT WAVE FOR ${business.toUpperCase()}

Act as a practical growth strategist for ${business}. Our ideal audience is ${audience}. Our current offer is ${offer}, and our primary goal is to ${action}.

Create a focused action plan that includes:
1. The three highest-impact actions to take first.
2. A clear message that explains why ${offer} matters to ${audience}.
3. One low-cost way to reach more of this audience this week.
4. A simple call to action that moves people toward the goal: ${action}.
5. Three measurements that will show whether the plan is working.

Use plain language, short sections, and steps a small business can complete without a large team. Keep every recommendation aligned with ${business}.`;

    case "follow-up-maker":
      return `FOLLOW-UP MESSAGE FOR ${business.toUpperCase()}

Hi [First Name],

I wanted to follow up because you mentioned wanting help with ${ongoingGoal}. At ${business}, we help ${audience} move forward with ${offer}—without making the process feel complicated or overwhelming.

If this is still a priority, I’d be happy to show you the simplest next step and answer any questions. There’s no pressure; I just don’t want you to miss an option that could help.

Would you like to take a quick look at the next step this week?

Thanks,
[Your Name]
${business}

QUICK TEXT VERSION
Hi [First Name]—just checking in about your goal of ${ongoingGoal}. ${business} offers ${offer} for ${audience}. Want me to send the simplest next step?`;

    case "offer-builder":
      return `THE ${business.toUpperCase()} OFFER

WHO IT HELPS
${audience}

THE PROBLEM
They want to ${action}, but need a clear and practical path forward.

THE OFFER
${offer}

THE PROMISE
${business} helps ${audience} make meaningful progress toward ${ongoingGoal} with a solution that is clear, supportive, and built for real-world use.

WHAT TO INCLUDE
• A simple starting assessment or conversation
• A step-by-step delivery plan
• One clear result or milestone
• Friendly support during implementation
• A defined next step after completion

CALL TO ACTION
Ready to ${action}? Start with ${offer} from ${business}. Reply “READY” or choose the next-step button to begin.`;

    case "thirty-day-plan":
      return `30-DAY WAVE PLAN FOR ${business.toUpperCase()}

GOAL: ${action}
AUDIENCE: ${audience}
OFFER: ${offer}

WEEK 1 — SECURE THE MESSAGE
Define the exact problem ${offer} solves for ${audience}. Write one clear promise, one call to action, and answers to the five questions customers ask most often.

WEEK 2 — STABILIZE THE EXPERIENCE
Review every place customers meet ${business}. Make the offer, price or next step easy to find. Test links and remove anything that creates confusion.

WEEK 3 — DEPLOY THE CAMPAIGN
Share the offer in three useful posts, send personal follow-ups to warm leads, and invite past customers or supporters to refer one person who fits the audience.

WEEK 4 — CREATE REVENUE MOMENTUM
Follow up with every response, track conversations and sales, repeat the best-performing message, and choose the next 30-day target.

DAILY MINIMUM
Spend 20 minutes creating visibility, 20 minutes following up, and 10 minutes tracking what moved ${business} closer to ${ongoingGoal}.`;
  }
}
