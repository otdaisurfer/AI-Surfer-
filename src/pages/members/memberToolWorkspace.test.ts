import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  from: vi.fn(),
}));

vi.mock("../../lib/supabase", () => ({
  supabase: {
    auth: { getUser: mocks.getUser },
    from: mocks.from,
  },
}));

import {
  loadMemberToolWorkspace,
  saveMemberToolWorkspace,
} from "./memberToolWorkspace";

const baseInput = {
  business: "Tideway Bakery",
  audience: "busy parents",
  goal: "increase orders",
  offer: "breakfast boxes",
};

function loadQuery(result: unknown) {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue(result),
  };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  return query;
}

describe("member tool workspace persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not query workspaces when signed out", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });

    const result = await loadMemberToolWorkspace("offer-wave-builder");

    expect(result).toEqual({ status: "signed-out" });
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("maps a saved database row into MemberToolInput", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    const query = loadQuery({
      data: {
        business: "Tideway Bakery",
        audience: "busy parents",
        goal: "increase orders",
        offer: "breakfast boxes",
        monthly_revenue_goal: "5000",
        average_sale: "500",
        recurring_price: "100",
        qualified_conversations: "25",
        leads: "15",
        one_time_sales: "4",
        recurring_customers: "2",
        weekly_revenue: "1500",
        generated_result: "Saved wave",
      },
      error: null,
    });
    mocks.from.mockReturnValue(query);

    const result = await loadMemberToolWorkspace("friday-revenue-scorecard");

    expect(result).toEqual({
      status: "loaded",
      input: {
        ...baseInput,
        monthlyRevenueGoal: "5000",
        averageSale: "500",
        recurringPrice: "100",
        qualifiedConversations: "25",
        leads: "15",
        oneTimeSales: "4",
        recurringCustomers: "2",
        weeklyRevenue: "1500",
      },
      generatedResult: "Saved wave",
    });
  });

  it("returns empty when the authenticated user has no saved row", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    mocks.from.mockReturnValue(loadQuery({ data: null, error: null }));

    await expect(loadMemberToolWorkspace("offer-wave-builder")).resolves.toEqual({ status: "empty" });
  });

  it("upserts the authenticated user id, tool id, inputs, result, and updated_at", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    const upsert = vi.fn().mockResolvedValue({ error: null });
    mocks.from.mockReturnValue({ upsert });

    const result = await saveMemberToolWorkspace("offer-wave-builder", baseInput, "Fresh wave");

    expect(result).toEqual({ status: "saved" });
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({
      user_id: "user-1",
      tool_id: "offer-wave-builder",
      business: "Tideway Bakery",
      generated_result: "Fresh wave",
      updated_at: expect.any(String),
    }), { onConflict: "user_id,tool_id" });
  });

  it("does not write workspaces when signed out", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });

    await expect(saveMemberToolWorkspace("offer-wave-builder", baseInput, "Fresh wave"))
      .resolves.toEqual({ status: "signed-out" });
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("returns error instead of throwing when load fails", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    mocks.from.mockReturnValue(loadQuery({ data: null, error: { message: "boom" } }));

    await expect(loadMemberToolWorkspace("offer-wave-builder")).resolves.toEqual({ status: "error" });
  });

  it("returns error instead of throwing when save fails", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    mocks.from.mockReturnValue({ upsert: vi.fn().mockResolvedValue({ error: { message: "boom" } }) });

    await expect(saveMemberToolWorkspace("offer-wave-builder", baseInput, "Fresh wave"))
      .resolves.toEqual({ status: "error" });
  });
});