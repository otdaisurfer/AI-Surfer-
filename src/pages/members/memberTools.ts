export type MemberToolId =
  | "prompt-wave-builder"
  | "follow-up-maker"
  | "offer-builder"
  | "thirty-day-plan"
  | "offer-wave-builder"
  | "revenue-tide-planner"
  | "content-wave-generator"
  | "sales-wave-script-builder"
  | "sales-page-wave-builder"
  | "lead-magnet-wave-builder"
  | "friday-revenue-scorecard";

export type MemberToolInput = {
  business: string;
  audience: string;
  goal: string;
  offer: string;
  monthlyRevenueGoal?: string;
  averageSale?: string;
  recurringPrice?: string;
  qualifiedConversations?: string;
  leads?: string;
  oneTimeSales?: string;
  recurringCustomers?: string;
  weeklyRevenue?: string;
};

export const memberTools = [
  { id: "prompt-wave-builder", icon: "🌊", name: "Prompt Wave Builder", description: "Turn a business goal into a clear, reusable AI prompt." },
  { id: "follow-up-maker", icon: "💬", name: "Follow-Up Message Maker", description: "Create a warm follow-up that moves a lead toward action." },
  { id: "offer-builder", icon: "🏄‍♀️", name: "Offer Builder", description: "Shape what you sell into a simple, compelling offer." },
  { id: "thirty-day-plan", icon: "🗓️", name: "My 30-Day Wave Plan", description: "Get four focused weeks of practical growth actions." },
  { id: "offer-wave-builder", icon: "🌺", name: "Offer Wave Builder", description: "Create three packages, recurring revenue, and a launch plan." },
  { id: "revenue-tide-planner", icon: "💰", name: "Revenue Tide Planner", description: "Turn a monthly income goal into weekly sales and lead targets." },
  { id: "content-wave-generator", icon: "📣", name: "Content Wave Generator", description: "Build a seven-day campaign with hooks, reels, and calls to action." },
  { id: "sales-wave-script-builder", icon: "🤝", name: "Sales Wave Script Builder", description: "Build a sales conversation with discovery, objections, closes, and follow-up." },
  { id: "sales-page-wave-builder", icon: "💻", name: "Sales Page Wave Builder", description: "Create a clear sales page with positioning, fit, FAQs, and calls to action." },
  { id: "lead-magnet-wave-builder", icon: "🧲", name: "Lead Magnet Wave Builder", description: "Create a lead magnet, opt-in page, thank-you message, and follow-up." },
  { id: "friday-revenue-scorecard", icon: "📊", name: "Friday Revenue Scorecard", description: "Turn this week's activity into conversion rates, revenue pace, leaks, and next moves." },
] as const satisfies ReadonlyArray<{ id: MemberToolId; icon: string; name: string; description: string }>;

function cleanInput(input: MemberToolInput): MemberToolInput {
  const cleaned = Object.fromEntries(Object.entries(input).map(([key, value]) => [key, value?.trim?.() ?? value])) as MemberToolInput;
  if ([cleaned.business, cleaned.audience, cleaned.goal, cleaned.offer].some((value) => !value)) throw new Error("Complete all four fields to build your result.");
  if (cleaned.business.length > 80 || /[\r\n]/.test(cleaned.business)) throw new Error("Enter only your business name—not a previous result.");
  return cleaned;
}

function parseMoney(value: string | undefined): number {
  const normalized = (value ?? "").trim();
  if (!/^\$?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(normalized)) throw new Error("Enter valid U.S. dollar amounts, such as 500, $500, or $5,000.00.");
  return Number(normalized.replace(/[$,]/g, ""));
}

function parseCount(value: string | undefined, label: string): number {
  const normalized = (value ?? "").trim();
  if (!/^\d+$/.test(normalized)) throw new Error(`Enter a whole number for ${label}.`);
  return Number(normalized);
}

function lowerFirst(value: string) { return value.charAt(0).toLowerCase() + value.slice(1); }
function actionGoal(value: string) { return lowerFirst(value.replace(/^to\s+/i, "")); }
function gerundGoal(value: string) {
  const action = actionGoal(value);
  const replacements: Record<string, string> = { generate: "generating", increase: "increasing", improve: "improving", create: "creating", grow: "growing", get: "getting", make: "making", build: "building", attract: "attracting", reduce: "reducing", save: "saving", sell: "selling" };
  const [first, ...rest] = action.split(/\s+/);
  return replacements[first.toLowerCase()] ? [replacements[first.toLowerCase()], ...rest].join(" ") : action;
}
function money(value: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: Number.isInteger(value) ? 0 : 2, maximumFractionDigits: 2 }).format(value); }
function pct(value: number) { return `${Math.round(value * 100)}%`; }

export function generateMemberToolResult(toolId: MemberToolId, rawInput: MemberToolInput): string {
  const { business, audience, goal, offer } = cleanInput(rawInput);
  const action = actionGoal(goal);
  const ongoingGoal = gerundGoal(goal);

  switch (toolId) {
    case "prompt-wave-builder":
      return `PROMPT WAVE FOR ${business.toUpperCase()}\n\nAct as a practical growth strategist for ${business}. Our ideal audience is ${audience}. Our current offer is ${offer}, and our primary goal is to ${action}.\n\nCreate a focused action plan with the three highest-impact actions, a clear message, one low-cost reach tactic, a call to action, and three measurements. Keep every recommendation aligned with ${business}.`;
    case "follow-up-maker":
      return `FOLLOW-UP MESSAGE FOR ${business.toUpperCase()}\n\nHi [First Name],\n\nI wanted to follow up because you mentioned wanting help with ${ongoingGoal}. At ${business}, we help ${audience} move forward with ${offer} without making the process feel complicated.\n\nWould you like to take a quick look at the next step this week?\n\nQUICK TEXT VERSION\nHi [First Name]—just checking in about your goal of ${ongoingGoal}. ${business} offers ${offer} for ${audience}. Want me to send the simplest next step?`;
    case "offer-builder":
      return `THE ${business.toUpperCase()} OFFER\n\nWHO IT HELPS\n${audience}\n\nTHE PROBLEM\nThey want to ${action}, but need a clear and practical path forward.\n\nTHE OFFER\n${offer}\n\nTHE PROMISE\n${business} helps ${audience} make meaningful progress toward ${ongoingGoal}.\n\nWHAT TO INCLUDE\n• Starting assessment\n• Step-by-step delivery plan\n• One clear result\n• Support during implementation\n• Defined next step\n\nCALL TO ACTION\nReady to ${action}? Start with ${offer} from ${business}.`;
    case "thirty-day-plan":
      return `30-DAY WAVE PLAN FOR ${business.toUpperCase()}\n\nGOAL: ${action}\nAUDIENCE: ${audience}\nOFFER: ${offer}\n\nWEEK 1 — SECURE THE MESSAGE\nDefine the exact problem and promise.\n\nWEEK 2 — STABILIZE THE EXPERIENCE\nMake the offer and next step easy to find.\n\nWEEK 3 — DEPLOY THE CAMPAIGN\nShare useful posts and follow up with warm leads.\n\nWEEK 4 — CREATE REVENUE MOMENTUM\nTrack conversations and sales, repeat what works, and choose the next target.\n\nDAILY MINIMUM\nSpend focused time creating visibility, following up, and tracking what moved ${business} closer to ${ongoingGoal}.`;
    case "offer-wave-builder":
      return `OFFER WAVE FOR ${business.toUpperCase()}\n\nIDEAL CUSTOMER\n${audience}\n\nCORE RESULT\nHelp ${audience} ${action} through ${offer}.\n\nGOOD — STARTER WAVE\nA focused entry package with one urgent result.\n\nBETTER — GROWTH WAVE\nThe complete ${offer} experience with strategy and implementation support.\n\nBEST — BIG KAHUNA\nThe Growth Wave plus customization, priority support, implementation, and optimization.\n\nMONTHLY REVENUE\nAdd a care plan with reporting, optimization, support, or fresh assets.\n\nSALES ANGLE\n${business} turns ${offer} into a practical path for ${audience}.\n\n7-DAY LAUNCH\nProblem → choices → warm leads → useful tip → follow-up → objections → direct CTA.`;
    case "revenue-tide-planner": {
      const monthlyGoal = parseMoney(rawInput.monthlyRevenueGoal); const averageSale = parseMoney(rawInput.averageSale); const recurringPrice = parseMoney(rawInput.recurringPrice);
      if (![monthlyGoal, averageSale, recurringPrice].every((v) => Number.isFinite(v) && v > 0)) throw new Error("Enter amounts greater than zero for all three revenue fields.");
      const salesNeeded = Math.ceil(monthlyGoal / averageSale); const weeklySales = Math.ceil(salesNeeded / 4); const recurringMembers = Math.ceil(monthlyGoal / recurringPrice); const recurringRevenue = recurringMembers * recurringPrice; const balancedOneTimeSales = Math.ceil((monthlyGoal * .6) / averageSale); const balancedMembers = Math.ceil((monthlyGoal * .4) / recurringPrice); const weeklyLeads = Math.ceil(((balancedOneTimeSales + balancedMembers) * 5) / 4); const dailyLeads = Math.ceil(weeklyLeads / 5);
      return `REVENUE TIDE PLAN FOR ${business.toUpperCase()}\n\nMONTHLY GOAL\n${business} will target ${money(monthlyGoal)} from ${offer} for ${audience} while working to ${action}.\n\nPATH 1 — ONE-TIME SALES\nClose ${salesNeeded} one-time sales at ${money(averageSale)} each. That is ${weeklySales} sales per week.\n\nPATH 2 — RECURRING REVENUE\nBuild to ${recurringMembers} recurring members at ${money(recurringPrice)} per month for ${money(recurringRevenue)} in monthly recurring revenue.\n\nRECOMMENDED BALANCED MIX\nClose ${balancedOneTimeSales} one-time sales and add ${balancedMembers} recurring members.\n\nLEAD TARGET\nStart ${weeklyLeads} qualified conversations per week—about ${dailyLeads} per weekday—using a planning assumption of one sale for every five qualified conversations.\n\nORDER OF ATTACK\nSecure the promise, stabilize the buying step, deploy outreach, and track results every Friday.`;
    }
    case "content-wave-generator":
      return `7-DAY CONTENT WAVE FOR ${business.toUpperCase()}\n\nCAMPAIGN GOAL\nHelp ${audience} understand how ${offer} helps them ${action}.\n\nDAY 1 — PROBLEM HOOK\nDAY 2 — QUICK WIN\nDAY 3 — MYTH BUSTER\nDAY 4 — BEHIND THE SCENES\nDAY 5 — CUSTOMER STORY\nUse a real approved customer example before publishing.\nDAY 6 — FAQ POST\nDAY 7 — DIRECT INVITATION\n\nREEL IDEAS\n• Three signs you need ${offer}\n• One mistake blocking you from ${ongoingGoal}\n• A 20-second look at ${business}\n\nCALLS TO ACTION\n• Comment “WAVE”\n• Send a message\n• Visit ${business} to start ${ongoingGoal} today.`;
    case "sales-wave-script-builder":
      return `SALES WAVE SCRIPT FOR ${business.toUpperCase()}\n\nIDEAL CUSTOMER\n${audience}\n\nGOAL\nHelp them ${action} through ${offer}.\n\nOPENING\nStart by understanding what they want to improve.\n\nDISCOVERY QUESTIONS\n1. What is the biggest challenge?\n2. What have you tried?\n3. What is the problem costing you?\n4. What would success look like?\n5. How important is this now?\n\nOFFER EXPLANATION\n${business} uses ${offer} to help ${audience} get a clearer path toward ${ongoingGoal}.\n\nOBJECTION RESPONSES\nAddress fit, timing, investment, and workload.\n\nSOFT CLOSE\nWould it be helpful if I showed you the simplest way to start?\n\nDIRECT CLOSE\nIf you’re ready to ${action}, let’s get your ${offer} started.\n\nTEXT / DM VERSION\nWant me to send the simple way to get started?\n\nNOT READY YET FOLLOW-UP\nNo pressure. If ${ongoingGoal} is still a priority, I can show you the simplest next step.`;
    case "sales-page-wave-builder":
      return `SALES PAGE WAVE FOR ${business.toUpperCase()}\n\nIDEAL CUSTOMER\n${audience}\n\nHEADLINE\nA clearer path to ${action} with ${offer}.\n\nSUBHEADLINE\n${business} helps ${audience} move toward ${ongoingGoal}.\n\nTHE PROBLEM\nYou want to ${action}, but it is hard to know what to fix first.\n\nTHE OFFER\n${offer}\n\nWHAT YOU GET\n• Clear starting point\n• Focused review\n• Practical recommendations\n• Simple next-step plan\n\nGOOD FIT IF\nYou are part of ${audience} and ready to act.\n\nNOT A FIT IF\nYou want guaranteed results without implementation.\n\nFAQ\nWho is it for? ${audience}. What happens next? Start with ${offer}.\n\nOBJECTION HANDLING\nKeep the next step practical and proportionate.\n\nPRIMARY CTA\nReady to ${action}? Start with ${offer} from ${business}.\n\nCHECKOUT / BOOKING CTA\nTake the next step with ${offer} →\n\nMOBILE SHORT VERSION\nWant to ${action} without more complexity? ${business} helps ${audience} use ${offer} to find the clearest next move.`;
    case "lead-magnet-wave-builder":
      return `LEAD MAGNET WAVE FOR ${business.toUpperCase()}\n\nIDEAL CUSTOMER\n${audience}\n\nMAGNETIC TITLE\nThe ${offer} Quick-Start Guide: 5 Steps to ${action}\n\nPROMISE\nGive ${audience} a fast, useful win while naturally introducing ${offer}.\n\nRECOMMENDED FORMAT\nA short PDF, checklist, or mobile-friendly guide.\n\n5-PART OUTLINE\n1. Spot the biggest obstacle.\n2. Identify one quick improvement.\n3. Check where opportunities are slipping away.\n4. Choose the highest-impact next action.\n5. Use ${offer} from ${business} for a customized path.\n\nLANDING PAGE COPY\nWant to ${action}? Start with the five things that matter most.\n\nOPT-IN CTA\nSend Me the Free Quick-Start Guide →\n\nTHANK-YOU MESSAGE\nYour guide is ready. When you want a customized path, ${business} can help with ${offer}.\n\nFIRST FOLLOW-UP MESSAGE\nWhich checkpoint stood out most for your goal of ${ongoingGoal}?`;
    case "friday-revenue-scorecard": {
      const conversations = parseCount(rawInput.qualifiedConversations, "qualified conversations");
      const leads = parseCount(rawInput.leads, "leads");
      const oneTimeSales = parseCount(rawInput.oneTimeSales, "one-time sales");
      const recurringCustomers = parseCount(rawInput.recurringCustomers, "recurring customers");
      const weeklyRevenue = parseMoney(rawInput.weeklyRevenue);
      const monthlyGoal = parseMoney(rawInput.monthlyRevenueGoal);
      const customers = oneTimeSales + recurringCustomers;
      const leadRate = conversations ? leads / conversations : 0;
      const closeRate = conversations ? customers / conversations : 0;
      const monthlyPace = weeklyRevenue * 4;
      const pacePercent = monthlyGoal ? monthlyPace / monthlyGoal : 0;
      const strongest = closeRate >= .2 ? "Your conversation-to-customer conversion is carrying the week." : leadRate >= .5 ? "Your qualified conversations are turning into leads at a useful rate." : "Revenue is moving, but the funnel needs more volume and conversion.";
      const leak = leadRate < .5 ? "Too many qualified conversations are ending before they become leads." : closeRate < .2 ? "Enough leads are entering the funnel, but too few are becoming customers." : "No major leak is obvious from this week alone; protect follow-up consistency and keep collecting data.";
      return `FRIDAY REVENUE SCORECARD FOR ${business.toUpperCase()}\n\nAUDIENCE\n${audience}\n\nOFFER\n${offer}\n\nGOAL\n${action}\n\nTHIS WEEK\n${conversations} qualified conversations\n${leads} leads\n${oneTimeSales} one-time sales\n${recurringCustomers} recurring customers\n${money(weeklyRevenue)} revenue\n\nCONVERSION SNAPSHOT\nConversation → lead: ${pct(leadRate)}\nConversation → customer: ${pct(closeRate)}\n\nMONTHLY PACE\nAt this weekly pace, ${business} is tracking toward about ${money(monthlyPace)} for a four-week month, or ${pct(pacePercent)} of the ${money(monthlyGoal)} monthly goal.\n\nSTRONGEST SIGNAL\n${strongest}\n\nBIGGEST LEAK\n${leak}\n\n3 MOVES FOR NEXT WEEK\n1. Repeat the message or channel that produced the highest-quality conversations.\n2. Follow up with every open lead tied to ${offer} before starting cold outreach.\n3. Track the same five numbers next Friday so ${business} can improve ${ongoingGoal} from real data, not guesses.`;
    }
  }
}