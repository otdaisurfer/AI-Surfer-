// @vitest-environment jsdom

import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import WaveStarterSuccess from "./WaveStarterSuccess";

async function renderSuccess(url: string) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[url]}>
        <WaveStarterSuccess />
      </MemoryRouter>,
    );
  });

  return { container, root };
}

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("Wave Starter verified success page", () => {
  it("shows payment received only after Stripe verification succeeds", async () => {
    vi.stubGlobal("fetch", vi.fn(async () =>
      new Response(JSON.stringify({
        ok: true,
        verified: true,
        offer: "Wave Starter",
        amount: 497,
        currency: "USD",
        sessionId: "cs_live_verified",
      }), { status: 200, headers: { "Content-Type": "application/json" } }),
    ));

    const { container, root } = await renderSuccess(
      "/wave-starter/success?session_id=cs_live_verified",
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(container.textContent).toContain("Payment verified");
    expect(container.textContent).toContain("Wave Starter Payment Received");
    expect(container.textContent).toContain("USD $497");
    expect(fetch).toHaveBeenCalledWith(
      "/api/wave-starter-session?session_id=cs_live_verified",
      { headers: { Accept: "application/json" } },
    );

    act(() => root.unmount());
  });

  it("does not claim payment success when verification fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () =>
      new Response(JSON.stringify({
        ok: false,
        error: "Checkout session could not be verified.",
      }), { status: 404, headers: { "Content-Type": "application/json" } }),
    ));

    const { container, root } = await renderSuccess(
      "/wave-starter/success?session_id=cs_live_missing",
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(container.textContent).toContain("Verification needed");
    expect(container.textContent).not.toContain("Payment verified");
    expect(container.textContent).not.toContain("Wave Starter Payment Received");

    act(() => root.unmount());
  });

  it("asks the customer to wait instead of paying twice while Stripe is processing", async () => {
    vi.stubGlobal("fetch", vi.fn(async () =>
      new Response(JSON.stringify({
        ok: true,
        verified: false,
        status: "open",
        paymentStatus: "unpaid",
      }), { status: 200, headers: { "Content-Type": "application/json" } }),
    ));

    const { container, root } = await renderSuccess(
      "/wave-starter/success?session_id=cs_live_pending",
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(container.textContent).toContain("Payment still processing");
    expect(container.textContent).toContain("Do not submit a second payment");

    act(() => root.unmount());
  });

  it("does not call verification without a checkout session ID", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { container, root } = await renderSuccess("/wave-starter/success");

    expect(container.textContent).toContain("Verification needed");
    expect(fetchMock).not.toHaveBeenCalled();

    act(() => root.unmount());
  });
});
