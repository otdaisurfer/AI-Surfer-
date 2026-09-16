import { supabase } from "../../lib/supabase";
import type { MemberToolId, MemberToolInput } from "./memberTools";

export type MemberToolWorkspaceLoadResult =
  | { status: "signed-out" }
  | { status: "empty" }
  | { status: "loaded"; input: MemberToolInput; generatedResult: string }
  | { status: "error" };

export type MemberToolWorkspaceSaveResult =
  | { status: "signed-out" }
  | { status: "saved" }
  | { status: "error" };

type WorkspaceRow = {
  business: string;
  audience: string;
  goal: string;
  offer: string;
  monthly_revenue_goal: string;
  average_sale: string;
  recurring_price: string;
  qualified_conversations: string;
  leads: string;
  one_time_sales: string;
  recurring_customers: string;
  weekly_revenue: string;
  generated_result: string;
};

function rowToInput(row: WorkspaceRow): MemberToolInput {
  return {
    business: row.business,
    audience: row.audience,
    goal: row.goal,
    offer: row.offer,
    monthlyRevenueGoal: row.monthly_revenue_goal,
    averageSale: row.average_sale,
    recurringPrice: row.recurring_price,
    qualifiedConversations: row.qualified_conversations,
    leads: row.leads,
    oneTimeSales: row.one_time_sales,
    recurringCustomers: row.recurring_customers,
    weeklyRevenue: row.weekly_revenue,
  };
}

async function currentUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user.id;
}

export async function loadMemberToolWorkspace(
  toolId: MemberToolId,
): Promise<MemberToolWorkspaceLoadResult> {
  const userId = await currentUserId();
  if (!userId) return { status: "signed-out" };

  const { data, error } = await supabase
    .from("member_tool_workspaces")
    .select("*")
    .eq("user_id", userId)
    .eq("tool_id", toolId)
    .maybeSingle();

  if (error) return { status: "error" };
  if (!data) return { status: "empty" };

  const row = data as WorkspaceRow;
  return {
    status: "loaded",
    input: rowToInput(row),
    generatedResult: row.generated_result,
  };
}

export async function saveMemberToolWorkspace(
  toolId: MemberToolId,
  input: MemberToolInput,
  generatedResult: string,
): Promise<MemberToolWorkspaceSaveResult> {
  const userId = await currentUserId();
  if (!userId) return { status: "signed-out" };

  const { error } = await supabase.from("member_tool_workspaces").upsert({
    user_id: userId,
    tool_id: toolId,
    business: input.business,
    audience: input.audience,
    goal: input.goal,
    offer: input.offer,
    monthly_revenue_goal: input.monthlyRevenueGoal ?? "",
    average_sale: input.averageSale ?? "",
    recurring_price: input.recurringPrice ?? "",
    qualified_conversations: input.qualifiedConversations ?? "",
    leads: input.leads ?? "",
    one_time_sales: input.oneTimeSales ?? "",
    recurring_customers: input.recurringCustomers ?? "",
    weekly_revenue: input.weeklyRevenue ?? "",
    generated_result: generatedResult,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id,tool_id" });

  return error ? { status: "error" } : { status: "saved" };
}