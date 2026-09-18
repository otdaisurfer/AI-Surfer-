import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveWaveAuditLead } from "./leadCapture";

const { insertMock, fromMock } = vi.hoisted(() => {
  const insertMock = vi.fn();
  return {
    insertMock,
    fromMock: vi.fn(() => ({ insert: insertMock })),
  };
});

vi.mock("../../lib/supabase", () => ({
  supabase: { from: fromMock },
}));

const payload = {
  email: "surfer@example.com",
  answers: {
    businessType: "service",
    teamSize: "2-10",
    timeDrain: "repetitive",
    lostOpportunity: "leads",
    aiPriority: "sales",
  },
  result: {
    score: 82,
    topCategory: "Lead & Sales Follow-Up",
    opportunities: ["Faster lead response", "Automated follow-up"],
    recommendedAgent: "Sales Rider" as const,
    confidenceLabel: "High opportunity",
  },
  source: "wave-audit" as const,
  submissionId: "5ed95f2f-1321-4aa8-bc88-f8f952cc6975",
};

describe("saveWaveAuditLead", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    insertMock.mockReset();
    fromMock.mockClear();
  });

  it("posts a normalized lead to the same-origin Wave Check endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      status: "saved",
      submissionId: payload.submissionId,
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(saveWaveAuditLead({ ...payload, email: " Surfer@Example.COM " })).resolves.toEqual({
      status: "saved",
      submissionId: payload.submissionId,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/wave-check-submit", expect.objectContaining({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submission_id: payload.submissionId,
        email: "surfer@example.com",
        answers: payload.answers,
        score: 82,
        top_category: "Lead & Sales Follow-Up",
        opportunities: ["Faster lead response", "Automated follow-up"],
        recommended_agent: "Sales Rider",
        confidence_label: "High opportunity",
        source: "wave-audit",
        report_version: 1,
      }),
    }));
  });

  it("adds UTM attribution to saved Wave Check answers", async () => {
    window.history.replaceState({}, "", "/wave-check?utm_source=facebook&utm_medium=social&utm_campaign=first-client-launch");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      status: "saved",
      submissionId: payload.submissionId,
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    await saveWaveAuditLead(payload);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body));
    expect(body.answers).toMatchObject({
      ...payload.answers,
      _campaign_source: "facebook",
      _campaign_medium: "social",
      _campaign_name: "first-client-launch",
    });
    window.history.replaceState({}, "", "/");
  });

  it("retries a lost response with the same receipt", async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        status: "saved",
        submissionId: payload.submissionId,
      }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(saveWaveAuditLead(payload)).resolves.toEqual({
      status: "saved",
      submissionId: payload.submissionId,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]).toEqual(fetchMock.mock.calls[1]);
  });

  it("returns an honest uncertain state after two failed attempts and a failed fallback", async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockRejectedValueOnce(new TypeError("Failed to fetch"));
    insertMock.mockResolvedValue({ error: { code: "42501", message: "permission denied" } });
    vi.stubGlobal("fetch", fetchMock);

    await expect(saveWaveAuditLead(payload)).resolves.toEqual({
      status: "uncertain",
      submissionId: payload.submissionId,
      message: "We couldn't confirm the online save. Please try again so your Wave Check is not lost.",
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("falls back to a direct insert when Cloudflare serves the SPA for the API route", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("<!doctype html><div id=\"root\"></div>", {
      status: 200,
      headers: { "Content-Type": "text/html" },
    }));
    insertMock.mockResolvedValue({ error: null });
    vi.stubGlobal("fetch", fetchMock);

    await expect(saveWaveAuditLead(payload)).resolves.toEqual({
      status: "saved",
      submissionId: payload.submissionId,
    });

    expect(fromMock).toHaveBeenCalledWith("wave_audit_leads");
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        submission_id: payload.submissionId,
        email: "surfer@example.com",
      }),
    );
  });

  it("treats a duplicate receipt as already saved", async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockRejectedValueOnce(new TypeError("Failed to fetch"));
    insertMock.mockResolvedValue({ error: { code: "23505", message: "duplicate key" } });
    vi.stubGlobal("fetch", fetchMock);

    await expect(saveWaveAuditLead(payload)).resolves.toEqual({
      status: "saved",
      submissionId: payload.submissionId,
    });
  });
});
