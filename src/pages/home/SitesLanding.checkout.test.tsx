import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import SitesLanding from "./SitesLanding";

describe("Lead Leak Review checkout visibility", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(async () => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    sessionStorage.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => root.render(<SitesLanding />));
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    sessionStorage.clear();
  });

  function expectCheckout() {
    const links = container.querySelectorAll<HTMLAnchorElement>('[data-funnel-cta="lead-leak-paid-review"]');
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute("href")).toBe("https://buy.stripe.com/cNi4gz1lp9to46K2xx4gg0c");
    expect(links[0].textContent).toContain("$197");
  }

  async function openFinder() {
    const button = Array.from(container.querySelectorAll("button")).find((item) => item.textContent?.includes("Open My Lead Leak Finder"));
    expect(button).toBeDefined();
    await act(async () => button!.click());
  }

  it("keeps the paid review available before and while the free assessment is open", async () => {
    expectCheckout();
    await openFinder();
    expect(container.querySelector(".lead-leak-form")).not.toBeNull();
    expectCheckout();
  });

  it("keeps the paid review available after completing the free assessment", async () => {
    await openFinder();
    const answers = ["Website", "Next day or later", "Owner", "One", "Booked appointment"];
    const fields = container.querySelectorAll<HTMLInputElement | HTMLSelectElement>(".lead-leak-form input, .lead-leak-form select");
    await act(async () => {
      fields.forEach((field, index) => {
        if (field.tagName === "SELECT") {
          field.value = answers[index];
          field.dispatchEvent(new Event("change", { bubbles: true }));
        } else {
          const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
          setter.call(field, answers[index]);
          field.dispatchEvent(new Event("input", { bubbles: true }));
        }
      });
    });
    await act(async () => container.querySelector<HTMLFormElement>(".lead-leak-form")!.requestSubmit());
    expect(container.querySelector(".lead-leak-result")?.textContent).toContain("Your Lead Leak Finder has started.");
    expect(JSON.parse(sessionStorage.getItem("ai-surfer-lead-leak-answers")!)).toEqual({
      source: "Website", responseTime: "Next day or later", owner: "Owner", followUps: "One", conversion: "Booked appointment",
    });
    expectCheckout();
  });
});
