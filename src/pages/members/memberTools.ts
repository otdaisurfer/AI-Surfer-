export type MemberToolId =
  | "prompt-wave-builder"
  | "follow-up-maker"
  | "offer-builder"
  | "thirty-day-plan"
  | "offer-wave-builder"
  | "revenue-tide-planner"
  | "content-wave-generator"
  | "sales-wave-script-builder"
  | "sales-page-wave-builder";

export type MemberToolInput = {
  business: string;
  audience: string;
  goal: string;
  offer: string;
  monthlyRevenueGoal?: string;
  averageSale?: string;
  recurringPrice?: string;
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
  {
    id: "offer-wave-builder",
    icon: "🌺",
    name: "Offer Wave Builder",
    description: "Create three packages, pricing guidance, recurring revenue, and a launch plan.",
  },
  {
    id: "revenue-tide-planner",
    icon: "💰",
    name: "Revenue Tide Planner",
    description: "Turn a monthly income goal into weekly sales and lead targets.",
  },
  {
    id: "content-wave-generator",
    icon: "📣",
    name: "Content Wave Generator",
    description: "Build a seven-day campaign with hooks, posts, reels, and calls to action.",
  },
  {
    id: "sales-wave-script-builder",
    icon: "🤝",
    name: "Sales Wave Script Builder",
    description: "Turn your offer into a natural sales conversation with discovery, objections, closes, and follow-up.",
  },
  {
    id: "sales-page-wave-builder",
    icon: "💻",
    name: "Sales Page Wave Builder",
    description: "Turn your offer into a clear sales page with positioning, fit, FAQs, and strong calls to action.",
  },
];

function cleanInput(input: MemberToolInput): MemberToolInput {
  const cleaned = Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key, value.trim()]),
  ) as MemberToolInput;

  if ([cleaned.business, cleaned.audience, cleaned.goal, cleaned.offer].some((value) => !value)) {
    throw new Error("Complete all four fields to build your result.");
  }

  if (cleaned.business.length > 80 || /[\r\n]/.test(cleaned.business)) {
    throw new Error("Enter only your business name—not a previous result.");
  }

  return cleaned;
}

function parseMoney(value: string | undefined): number {
  const normalized = (value ?? "").trim();
  const validUsd = /^\$?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/;

  if (!validUsd.test(normalized)) {
    throw new Error("Enter valid U.S. dollar amounts, such as 500, $500, or $5,000.00.");
  }

  return Number(normalized.replace(/[$,]/g, ""));
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

function money(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
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

    case "offer-wave-builder":
      return `OFFER WAVE FOR ${business.toUpperCase()}

IDEAL CUSTOMER
${audience}

CORE RESULT
Help ${audience} ${action} through ${offer}.

GOOD — STARTER WAVE
A focused entry package that solves one urgent part of the problem. Include a short assessment, one clear deliverable, and a next-step recommendation. Price it as the easiest low-risk way to begin.

BETTER — GROWTH WAVE
The complete ${offer} experience. Include the assessment, strategy, implementation support, and a 30-day progress check. Position this as the best-value choice for customers who want meaningful momentum.

BEST — BIG KAHUNA
A high-touch package with the full Growth Wave plus customization, priority support, implementation, and a 90-day optimization review. Price it for the value of speed, access, and hands-on help.

MONTHLY REVENUE
Add a care plan after delivery with monthly reporting, optimization, support, or fresh campaign assets. Aim for a recurring price equal to 10–20% of the Growth Wave package.

SALES ANGLE
You do not need more complexity—you need a clear path to ${action}. ${business} turns ${offer} into a practical system built for ${audience}.

7-DAY LAUNCH
Day 1: Name the customer problem. Day 2: Publish the three choices. Day 3: Invite five warm leads. Day 4: Share one useful tip. Day 5: Follow up. Day 6: Answer objections. Day 7: close the first spots with a direct call to action.`;

    case "revenue-tide-planner": {
      const monthlyGoal = parseMoney(rawInput.monthlyRevenueGoal);
      const averageSale = parseMoney(rawInput.averageSale);
      const recurringPrice = parseMoney(rawInput.recurringPrice);

      if (![monthlyGoal, averageSale, recurringPrice].every((value) => Number.isFinite(value) && value > 0)) {
        throw new Error("Enter amounts greater than zero for all three revenue fields.");
      }

      const salesNeeded = Math.ceil(monthlyGoal / averageSale);
      const weeklySales = Math.ceil(salesNeeded / 4);
      const recurringMembers = Math.ceil(monthlyGoal / recurringPrice);
      const recurringRevenue = recurringMembers * recurringPrice;
      const balancedOneTimeSales = Math.ceil((monthlyGoal * 0.6) / averageSale);
      const balancedMembers = Math.ceil((monthlyGoal * 0.4) / recurringPrice);
      const balancedCustomers = balancedOneTimeSales + balancedMembers;
      const weeklyLeads = Math.ceil((balancedCustomers * 5) / 4);
      const dailyLeads = Math.ceil(weeklyLeads / 5);

      return `REVENUE TIDE PLAN FOR ${business.toUpperCase()}

MONTHLY GOAL
${business} will target ${money(monthlyGoal)} from ${offer} for ${audience} while working to ${action}.

PATH 1 — ONE-TIME SALES
Close ${salesNeeded} one-time sales at ${money(averageSale)} each. That is ${weeklySales} sales per week.

PATH 2 — RECURRING REVENUE
Build to ${recurringMembers} recurring members at ${money(recurringPrice)} per month for ${money(recurringRevenue)} in monthly recurring revenue.

RECOMMENDED BALANCED MIX
Close ${balancedOneTimeSales} one-time sales and add ${balancedMembers} recurring members. This combines cash now with steadier monthly income.

LEAD TARGET
Start ${weeklyLeads} qualified conversations per week—about ${dailyLeads} per weekday—using a planning assumption of one sale for every five qualified conversations.

ORDER OF ATTACK
1. Secure one clear promise for ${offer}.
2. Stabilize the price and buying step.
3. Deploy direct outreach to ${audience}.
4. Track conversations, sales, and recurring revenue every Friday.

These are planning estimates, not guaranteed results. Replace the five-to-one conversation assumption with your real close rate as soon as you have it.`;
    }

    case "content-wave-generator":
      return `7-DAY CONTENT WAVE FOR ${business.toUpperCase()}

CAMPAIGN GOAL
Help ${audience} understand how ${offer} helps them ${action}.

DAY 1 — PROBLEM HOOK
“Trying to ${action} but not sure what to fix first?” Explain the cost of staying stuck, then invite readers to learn about ${offer}.

DAY 2 — QUICK WIN
Share three simple actions ${audience} can take today. End with: “Want the complete path? Ask ${business} about ${offer}.”

DAY 3 — MYTH BUSTER
Challenge one common belief that keeps your audience from ${ongoingGoal}. Replace it with a practical next step.

DAY 4 — BEHIND THE SCENES
Show how ${business} approaches ${offer}. Focus on clarity, care, and the result—not technical jargon.

DAY 5 — CUSTOMER STORY
Tell a short before-and-after story: the problem, the decision, the work, and the outcome. Use a real approved customer example before publishing.

DAY 6 — FAQ POST
Answer the three questions people ask before buying ${offer}: who it is for, what happens next, and how to get started.

DAY 7 — DIRECT INVITATION
“If ${action} is a priority this month, ${offer} gives ${audience} a clear next step. Message ‘WAVE’ and we’ll help you begin.”

REEL IDEAS
• Three signs you need ${offer}
• One mistake blocking you from ${ongoingGoal}
• A 20-second look at the ${business} process

CALLS TO ACTION
• Comment “WAVE” for the next step.
• Send us a message to see if ${offer} fits.
• Visit ${business} to start ${ongoingGoal} today.`;

    case "sales-wave-script-builder":
      return `SALES WAVE SCRIPT FOR ${business.toUpperCase()}

IDEAL CUSTOMER
${audience}

GOAL
Help them ${action} through ${offer}.

OPENING
“Thanks for taking a minute to talk. Before I explain ${offer}, I’d like to understand what is happening in your business right now and what you want to improve.”

DISCOVERY QUESTIONS
1. What is the biggest challenge you are running into when trying to ${action}?
2. What have you already tried, and what happened?
3. What is that problem costing you in leads, time, revenue, or missed opportunities?
4. If this were working better 30 days from now, what would success look like?
5. How important is solving this right now compared with your other priorities?

OFFER EXPLANATION
“Based on what you shared, ${offer} may be a strong next step. ${business} uses it to help ${audience} get a clearer path toward ${ongoingGoal}. We focus on the highest-impact opportunities first so you know what to do next instead of adding more complexity.”

OBJECTION RESPONSES
“IT SOUNDS EXPENSIVE.”
“I understand. The important question is whether the problem is costing you more than fixing it. We can look at the smallest useful starting point and make sure the next step makes business sense.”

“I NEED TO THINK ABOUT IT.”
“Absolutely. What part would you like to think through: the fit, the timing, the investment, or what happens next?”

“I DON’T HAVE TIME.”
“That is exactly why we keep the process focused. The goal is to reduce wasted effort and give you a clear next move, not create another project for you to manage.”

SOFT CLOSE
“Would it be helpful if I showed you the simplest way to start with ${offer}?”

DIRECT CLOSE
“If you’re ready to ${action}, let’s get your ${offer} started. We can take the next step now and make sure you know exactly what happens after that.”

TEXT / DM VERSION
“Hi [First Name] — based on what you shared about wanting to ${action}, I think ${offer} could give you a much clearer next step. Want me to send you the simple way to get started?”

NOT READY YET FOLLOW-UP
“Hi [First Name] — just checking back in on your goal of ${ongoingGoal}. No pressure at all. If it is still a priority, I can show you the simplest next step with ${offer} and answer anything that is still unclear.”`;

    case "sales-page-wave-builder":
      return `SALES PAGE WAVE FOR ${business.toUpperCase()}

IDEAL CUSTOMER
${audience}

HEADLINE
A clearer path to ${action} with ${offer}.

SUBHEADLINE
${business} helps ${audience} move toward ${ongoingGoal} with a practical offer built around the next steps that matter most.

THE PROBLEM
You want to ${action}, but it is hard to know what to fix first. Scattered tools, unclear priorities, and inconsistent follow-up can make progress slower than it needs to be.

THE OFFER
${offer}

WHY IT MATTERS
Instead of adding more complexity, ${offer} gives ${audience} a focused way to identify the right next move and create momentum toward ${ongoingGoal}.

WHAT YOU GET
• A clear starting point
• A focused review of the biggest opportunity
• Practical recommendations tied to your goal
• A simple next-step plan
• Guidance on what to do first, next, and later

GOOD FIT IF
• You are part of ${audience}
• ${ongoingGoal} is a real priority
• You want a practical path instead of more guesswork
• You are ready to take action on clear recommendations

NOT A FIT IF
• You are only looking for generic ideas with no intention to act
• You want guaranteed results without implementation
• You need a solution outside the scope of ${offer}

FAQ
WHO IS ${offer.toUpperCase()} FOR?
It is designed for ${audience} who want to ${action} with a clearer, more practical plan.

WHAT HAPPENS NEXT?
You begin with ${offer}, review the highest-impact opportunities, and leave with a defined next step.

DO I NEED TO BE AN AI OR TECH EXPERT?
No. ${business} keeps the process focused on the business outcome, not technical jargon.

HOW DO I GET STARTED?
Choose the next-step button, send a message, or book the appropriate starting conversation.

OBJECTION HANDLING
“I’M NOT SURE THIS IS FOR ME.”
Start by comparing your current challenge with the result ${offer} is designed to support. If the fit is not clear, do not force it.

“I DON’T HAVE TIME FOR ANOTHER PROJECT.”
The purpose is to reduce confusion and give you a smaller number of useful next actions, not create more busywork.

PRIMARY CTA
Ready to ${action}? Start with ${offer} from ${business}.

CHECKOUT / BOOKING CTA
Take the next step with ${offer} →

MOBILE SHORT VERSION
Want to ${action} without adding more complexity? ${business} helps ${audience} use ${offer} to find the clearest next move. Start with ${offer} today.`;
  }
}
