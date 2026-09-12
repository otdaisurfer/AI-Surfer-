import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import MemberToolDock from "./MemberToolDock";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe("MemberToolDock", () => {
  it("renders all four tools with a launch control", () => {
    const markup = renderToStaticMarkup(<MemberToolDock />);

    expect(markup).toContain("Members Tool Dock");
    expect(markup).toContain("Prompt Wave Builder");
    expect(markup).toContain("Follow-Up Message Maker");
    expect(markup).toContain("Offer Builder");
    expect(markup).toContain("My 30-Day Wave Plan");
    expect(markup.match(/>Open Tool</g)).toHaveLength(4);
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
});
