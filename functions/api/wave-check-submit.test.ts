import { afterEach, describe, expect, it, vi } from "vitest";
import { handleWaveCheckSubmit } from "./wave-check-submit";

const submission = {
  submission_id: "123e4567-e89b-42d3-a456-426614174000",
  email: "Surfer@Example.com",
  answers: { businessType: "service" },
  score: 93,
  top_category: "Lead & Sales Follow-Up",
  opportunities: ["Follow up faster"],
  recommended_agent: "Sales Rider",
  confidence_label: "High opportunity",
  source: "wave-audit" as const,
  report_version: 1,
};

function request() {
  return new Request("https://example.test/api/wave-check-submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(submission),
  });
}

describe("handleWaveCheckSubmit", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("authenticates the Supabase REST request with the active legacy anon JWT", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await handleWaveCheckSubmit(request());

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(await response.json()).toMatchObject({
      status: "saved",
      hubspotStatus: "not_configured",
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers.apikey).toMatch(/^eyJ/);
    expect(headers.Authorization).toBe(`Bearer ${headers.apikey}`);
  });

  it("creates a normalized HubSpot lead after Supabase confirms the save", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 201 }))
      .mockResolvedValueOnce(Response.json({ results: [] }))
      .mockResolvedValueOnce(Response.json({ id: "123" }, { status: 201 }))
      .mockResolvedValueOnce(Response.json({ id: "note-123" }, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await handleWaveCheckSubmit(request(), "hubspot-token");

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      status: "saved",
      hubspotStatus: "synced",
    });
    expect(fetchMock).toHaveBeenCalledTimes(4);

    const [searchUrl, searchInit] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(searchUrl).toBe("https://api.hubapi.com/crm/v3/objects/contacts/search");
    expect(searchInit.headers).toMatchObject({ Authorization: "Bearer hubspot-token" });

    const [createUrl, createInit] = fetchMock.mock.calls[2] as [string, RequestInit];
    expect(createUrl).toBe("https://api.hubapi.com/crm/v3/objects/contacts");
    expect(JSON.parse(String(createInit.body))).toEqual({
      properties: {
        email: "surfer@example.com",
        lifecyclestage: "lead",
      },
    });

    const [noteUrl, noteInit] = fetchMock.mock.calls[3] as [string, RequestInit];
    expect(noteUrl).toBe("https://api.hubapi.com/crm/v3/objects/notes");
    const noteBody = JSON.parse(String(noteInit.body));
    expect(noteBody.properties.hs_note_body).toContain("Score: 93/100 (High opportunity)");
    expect(noteBody.properties.hs_note_body).toContain("Biggest Wave: Lead & Sales Follow-Up");
    expect(noteBody.properties.hs_note_body).toContain("Recommended Agent: Sales Rider");
    expect(noteBody.properties.hs_note_body).toContain(submission.submission_id);
    expect(noteBody.associations[0].to.id).toBe("123");
    expect(noteBody.associations[0].types[0].associationTypeId).toBe(202);
  });

  it("does not duplicate an existing HubSpot contact", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 201 }))
      .mockResolvedValueOnce(Response.json({ results: [{ id: "existing-contact" }] }))
      .mockResolvedValueOnce(Response.json({ id: "note-existing" }, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await handleWaveCheckSubmit(request(), "hubspot-token");

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ hubspotStatus: "synced" });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    const [noteUrl] = fetchMock.mock.calls[2] as [string, RequestInit];
    expect(noteUrl).toBe("https://api.hubapi.com/crm/v3/objects/notes");
  });

  it("keeps the customer report available when HubSpot is temporarily unavailable", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 201 }))
      .mockResolvedValueOnce(new Response("temporary failure", { status: 503 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await handleWaveCheckSubmit(request(), "hubspot-token");

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      status: "saved",
      hubspotStatus: "failed",
    });
  });

  it("releases the customer report when HubSpot stalls past the timeout", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 201 }))
      .mockImplementationOnce((_url: string, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true });
      }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await handleWaveCheckSubmit(request(), "hubspot-token", 5);

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      status: "saved",
      hubspotStatus: "failed",
    });
  });

  it("blocks a rate-limited client before Supabase or HubSpot writes", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const limiter = vi.fn().mockResolvedValue(false);

    const response = await handleWaveCheckSubmit(request(), "hubspot-token", 3000, limiter);

    expect(response.status).toBe(429);
    expect(await response.json()).toMatchObject({ error: "Too many Wave Check submissions. Please try again shortly." });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("queues CRM work even when the Pages runtime has no HubSpot token", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response(null, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const backgroundHandoff = vi.fn();

    const response = await handleWaveCheckSubmit(
      request(),
      undefined,
      3000,
      undefined,
      backgroundHandoff,
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      status: "saved",
      hubspotStatus: "queued",
    });
    expect(backgroundHandoff).toHaveBeenCalledWith(
      "surfer@example.com",
      submission.submission_id,
      expect.objectContaining({
        score: 93,
        topCategory: "Lead & Sales Follow-Up",
      }),
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("queues HubSpot work off the customer response path when a background handoff is provided", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response(null, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const backgroundHandoff = vi.fn();

    const response = await handleWaveCheckSubmit(
      request(),
      "hubspot-token",
      3000,
      undefined,
      backgroundHandoff,
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      status: "saved",
      hubspotStatus: "queued",
    });
    expect(backgroundHandoff).toHaveBeenCalledWith(
      "surfer@example.com",
      submission.submission_id,
      expect.objectContaining({
        score: 93,
        topCategory: "Lead & Sales Follow-Up",
        recommendedAgent: "Sales Rider",
      }),
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
