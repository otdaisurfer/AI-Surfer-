// @vitest-environment jsdom
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import Pricing from "./Pricing";

function renderPricing() {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(<Pricing />);
  });
  return { container, root };
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("launch revenue conversion path", () => {
  it("routes high-ticket inquiries to distinct email subjects when booking is unavailable", () => {
    const { container, root } = renderPricing();
    const anchors = Array.from(container.querySelectorAll("a"));
    const builder = anchors.find((a) => a.textContent?.includes("Request a Strategy Call"));
    const tsunami = anchors.find((a) => a.textContent?.includes("Talk With AI Surfer"));
    const fallback = anchors.find((a) => a.getAttribute("href")?.startsWith("mailto:"));

    expect(builder?.getAttribute("href")).toBe("mailto:oceantidedropservice@gmail.com?subject=Wave%20Builder%20Strategy%20Call");
    expect(tsunami?.getAttribute("href")).toBe("mailto:oceantidedropservice@gmail.com?subject=Tsunami%20Growth%20Strategy%20Call");
    expect(fallback?.getAttribute("href")).toContain("oceantidedropservice@gmail.com");
    act(() => root.unmount());
  });

  it("emits privacy-safe funnel events for pricing, checkout, strategy calls, and the Wave Check", () => {
    const events: Array<{ name: string; detail: Record<string, unknown> }> = [];
    const listener = (event: Event) => {
      const custom = event as CustomEvent<Record<string, unknown>>;
      events.push({ name: custom.type, detail: custom.detail });
    };
    window.addEventListener("ai-surfer:funnel", listener);

    const { container, root } = renderPricing();
    const anchors = Array.from(container.querySelectorAll("a"));
    const starter = anchors.find((a) => a.textContent?.includes("Buy Wave Starter"));
    const builder = anchors.find((a) => a.textContent?.includes("Request a Strategy Call"));
    const waveCheck = anchors.find((a) => a.textContent?.includes("Start the free AI Wave Check"));

    act(() => starter?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true })));
    act(() => builder?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true })));
    act(() => waveCheck?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true })));

    const payloads = events.map((event) => event.detail);
    expect(payloads).toContainEqual(expect.objectContaining({ event: "pricing_view" }));
    expect(payloads).toContainEqual(expect.objectContaining({ event: "offer_click", offer: "Wave Starter", price: 497 }));
    expect(payloads).toContainEqual(expect.objectContaining({ event: "checkout_start", offer: "Wave Starter", price: 497 }));
    expect(payloads).toContainEqual(expect.objectContaining({ event: "strategy_call_click", offer: "Wave Builder", price: 1997 }));
    expect(payloads).toContainEqual(expect.objectContaining({ event: "wave_check_start" }));

    for (const payload of payloads) {
      expect(payload).not.toHaveProperty("email");
      expect(payload).not.toHaveProperty("name");
      expect(payload).not.toHaveProperty("phone");
    }

    window.removeEventListener("ai-surfer:funnel", listener);
    act(() => root.unmount());
  });
});
