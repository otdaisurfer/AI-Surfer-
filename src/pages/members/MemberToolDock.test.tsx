import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const workspaceMocks = vi.hoisted(() => ({
  load: vi.fn(),
  save: vi.fn(),
}));

vi.mock("./memberToolWorkspace", () => ({
  loadMemberToolWorkspace: workspaceMocks.load,
  saveMemberToolWorkspace: workspaceMocks.save,
}));

import MemberToolDock from "./MemberToolDock";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

beforeEach(() => {
  workspaceMocks.load.mockReset();
  workspaceMocks.save.mockReset();
  workspaceMocks.load.mockResolvedValue({ status: "signed-out" });
  workspaceMocks.save.mockResolvedValue({ status: "signed-out" });
});

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe("MemberToolDock", () => {
  it("renders all eleven tools with a launch control", () => {
    const markup = renderToStaticMarkup(<MemberToolDock />);

    expect(markup).toContain("Members Tool Dock");
    expect(markup).toContain("Prompt Wave Builder");
    expect(markup).toContain("Follow-Up Message Maker");
    expect(markup).toContain("Offer Builder");
    expect(markup).toContain("My 30-Day Wave Plan");
    expect(markup).toContain("Offer Wave Builder");
    expect(markup).toContain("Revenue Tide Planner");
    expect(markup).toContain("Content Wave Generator");
    expect(markup).toContain("Sales Wave Script Builder");
    expect(markup).toContain("Sales Page Wave Builder");
    expect(markup).toContain("Lead Magnet Wave Builder");
    expect(markup).toContain("Friday Revenue Scorecard");
    expect(markup.match(/>Open Tool</g)).toHaveLength(11);
  });

  it("shows short examples that clarify what belongs in each field", async () => {
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
    });
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => root.render(<MemberToolDock />));
    await act(async () => container.querySelector("article button")?.dispatchEvent(new MouseEvent("click", { bubbles: true })));

    expect(container.textContent).toContain("Name only — not a previous result");
    expect(container.textContent).toContain("Start with an action word");

    await act(async () => root.unmount());
  });

  it.each([
    "Prompt Wave Builder",
    "Follow-Up Message Maker",
    "Offer Builder",
    "My 30-Day Wave Plan",
    "Offer Wave Builder",
    "Revenue Tide Planner",
    "Content Wave Generator",
    "Sales Wave Script Builder",
    "Sales Page Wave Builder",
    "Lead Magnet Wave Builder",
    "Friday Revenue Scorecard",
  ])("brings %s into view and focuses its first field", async (toolName) => {
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => root.render(<MemberToolDock />));
    const card = Array.from(container.querySelectorAll("article")).find((item) =>
      item.textContent?.includes(toolName),
    );
    const button = card?.querySelector("button");

    await act(async () => button?.click());

    expect(card?.textContent).toContain("Tool Open ↓");
    expect(container.querySelector("h3")?.textContent).toContain(toolName);
    expect(document.activeElement).toBe(container.querySelector('input[name="business"]'));
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });

    await act(async () => root.unmount());
  });

  it("generates a result for a non-revenue tool without hidden revenue fields", async () => {
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
    });
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => root.render(<MemberToolDock />));
    const card = Array.from(container.querySelectorAll("article")).find((item) =>
      item.textContent?.includes("Content Wave Generator"),
    );
    await act(async () => card?.querySelector("button")?.click());

    const values = ["Tideway Bakery", "busy parents", "increase orders", "breakfast boxes"];
    const inputs = Array.from(container.querySelectorAll("input"));
    for (const [index, input] of inputs.entries()) {
      await act(async () => {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
        setter?.call(input, values[index]);
        input.dispatchEvent(new Event("input", { bubbles: true }));
      });
    }
    const generateButton = Array.from(container.querySelectorAll("button")).find((button) =>
      button.textContent?.includes("Build My Result"),
    );
    await act(async () => generateButton?.click());

    expect(container.textContent).toContain("Your result is ready");
    expect(container.textContent).toContain("7-DAY CONTENT WAVE");
    expect(container.querySelector('[role="alert"]')).toBeNull();

    await act(async () => root.unmount());
  });

  it("continues to the next workflow tool without making members retype core business details", async () => {
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
    });
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => root.render(<MemberToolDock />));
    const offerCard = Array.from(container.querySelectorAll("article")).find((item) =>
      item.textContent?.includes("Offer Wave Builder"),
    );
    await act(async () => offerCard?.querySelector("button")?.click());

    const values = ["Tideway Bakery", "busy parents", "increase orders", "breakfast boxes"];
    const inputs = Array.from(container.querySelectorAll("input")).slice(0, 4);
    for (const [index, input] of inputs.entries()) {
      await act(async () => {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
        setter?.call(input, values[index]);
        input.dispatchEvent(new Event("input", { bubbles: true }));
      });
    }

    const generateButton = Array.from(container.querySelectorAll("button")).find((button) =>
      button.textContent?.includes("Build My Result"),
    );
    await act(async () => generateButton?.click());

    const continueButton = Array.from(container.querySelectorAll("button")).find((button) =>
      button.textContent?.includes("Continue to Revenue Tide Planner"),
    );
    expect(continueButton).toBeDefined();
    await act(async () => continueButton?.click());

    expect(container.querySelector("h3")?.textContent).toContain("Revenue Tide Planner");
    expect(Array.from(container.querySelectorAll("input")).slice(0, 4).map((input) => input.value)).toEqual(values);

    await act(async () => root.unmount());
  });

  it("restores a saved workspace when a signed-in member manually opens a tool", async () => {
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
    workspaceMocks.load.mockResolvedValue({
      status: "loaded",
      input: { business: "Saved Bakery", audience: "saved parents", goal: "grow orders", offer: "saved boxes" },
      generatedResult: "SAVED OFFER WAVE",
    });
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    await act(async () => root.render(<MemberToolDock />));
    const card = Array.from(container.querySelectorAll("article")).find((item) => item.textContent?.includes("Offer Wave Builder"));
    await act(async () => { card?.querySelector("button")?.click(); await new Promise((resolve) => setTimeout(resolve, 0)); });

    expect(Array.from(container.querySelectorAll("input")).slice(0, 4).map((field) => field.value)).toEqual([
      "Saved Bakery", "saved parents", "grow orders", "saved boxes",
    ]);
    expect(container.textContent).toContain("SAVED OFFER WAVE");
    expect(container.textContent).toContain("Restored from your workspace");
    await act(async () => root.unmount());
  });

  it("keeps the tool usable when restore fails", async () => {
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
    workspaceMocks.load.mockResolvedValue({ status: "error" });
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    await act(async () => root.render(<MemberToolDock />));
    const card = Array.from(container.querySelectorAll("article")).find((item) => item.textContent?.includes("Content Wave Generator"));
    await act(async () => { card?.querySelector("button")?.click(); await new Promise((resolve) => setTimeout(resolve, 0)); });

    expect(container.querySelector("h3")?.textContent).toContain("Content Wave Generator");
    expect(container.textContent).toContain("Couldn't restore your saved workspace");
    await act(async () => root.unmount());
  });


  it("preserves current shared fields during a direct Continue to handoff", async () => {
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
    workspaceMocks.load
      .mockResolvedValueOnce({ status: "signed-out" })
      .mockResolvedValueOnce({
        status: "loaded",
        input: {
          business: "Old Business", audience: "old audience", goal: "old goal", offer: "old offer",
          monthlyRevenueGoal: "7000", averageSale: "700", recurringPrice: "140",
        },
        generatedResult: "OLD REVENUE PLAN",
      });
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    await act(async () => root.render(<MemberToolDock />));
    const card = Array.from(container.querySelectorAll("article")).find((item) => item.textContent?.includes("Offer Wave Builder"));
    await act(async () => { card?.querySelector("button")?.click(); await new Promise((resolve) => setTimeout(resolve, 0)); });

    const values = ["Current Bakery", "current parents", "increase orders", "current boxes"];
    for (const [index, input] of Array.from(container.querySelectorAll("input")).slice(0, 4).entries()) {
      await act(async () => {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
        setter?.call(input, values[index]);
        input.dispatchEvent(new Event("input", { bubbles: true }));
      });
    }
    const generateButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent?.includes("Build My Result"));
    await act(async () => generateButton?.click());
    const continueButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent?.includes("Continue to Revenue Tide Planner"));
    await act(async () => { continueButton?.click(); await new Promise((resolve) => setTimeout(resolve, 0)); });

    expect(Array.from(container.querySelectorAll("input")).slice(0, 4).map((field) => field.value)).toEqual(values);
    expect(Array.from(container.querySelectorAll("input"))[4]?.value).toBe("7000");
    expect(container.textContent).toContain("OLD REVENUE PLAN");
    await act(async () => root.unmount());
  });

});