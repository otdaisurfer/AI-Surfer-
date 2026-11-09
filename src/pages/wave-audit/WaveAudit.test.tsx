import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import WaveAudit from "./WaveAudit";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const { saveWaveAuditLead } = vi.hoisted(() => ({ saveWaveAuditLead: vi.fn() }));

vi.mock("../../features/wave-audit/leadCapture", () => ({ saveWaveAuditLead }));
vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ loading: false, user: null }),
}));

afterEach(() => {
  vi.useRealTimers();
  saveWaveAuditLead.mockReset();
});

describe("WaveAudit", () => {
  it("starts with the first business question and hides email capture", () => {
    const html = renderToString(
      <MemoryRouter>
        <WaveAudit />
      </MemoryRouter>,
    );

    expect(html).toContain("What type of business do you run?");
    expect(html).toMatch(/Question\s*<!-- -->1<!-- -->\s*of\s*<!-- -->5/);
    expect(html).not.toContain("Unlock My Full AI Wave Report");
  });

  it("unlocks the full report and routes into the paid implementation ladder after the audit is saved", async () => {
    vi.useFakeTimers();
    saveWaveAuditLead.mockResolvedValueOnce({
      status: "saved",
      submissionId: "5ed95f2f-1321-4aa8-bc88-f8f952cc6975",
    });
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    const clickChoice = async (label: string, advances = true) => {
      const button = [...container.querySelectorAll("button")].find((candidate) => candidate.textContent?.includes(label));
      expect(button, `choice ${label}`).toBeTruthy();
      await act(async () => button?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
      if (advances) await act(async () => vi.advanceTimersByTime(180));
    };

    await act(async () => root.render(<MemoryRouter><WaveAudit /></MemoryRouter>));
    await clickChoice("E-commerce");
    await clickChoice("Just me");
    await clickChoice("A little of everything");
    await clickChoice("Finding new leads");
    await clickChoice("Sales & follow-up", false);

    const input = container.querySelector<HTMLInputElement>("#wave-audit-email");
    expect(input).toBeTruthy();
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    await act(async () => {
      valueSetter?.call(input, "surfer@example.com");
      input?.dispatchEvent(new Event("input", { bubbles: true }));
    });

    const form = container.querySelector("form");
    await act(async () => form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));

    expect(container.textContent).toContain("Your Full AI Wave Report");
    expect(container.textContent).toContain("30-Day Wave Plan");
    expect(container.textContent).toContain("Catch Your Next Wave");
    expect(container.textContent).toContain("Wave Starter");
    expect(container.textContent).toContain("$497");
    expect(container.textContent).toContain("Wave Builder");
    expect(container.textContent).toContain("$1,997");
    expect(container.textContent).toContain("Tsunami Growth");
    expect(container.textContent).toContain("$3,997");

    const offerLinks = [...container.querySelectorAll<HTMLAnchorElement>("a")];
    const starter = offerLinks.find((link) => link.textContent?.includes("Buy Wave Starter"));
    const builder = offerLinks.find((link) => link.textContent?.includes("Book Wave Builder Strategy Call"));
    const tsunami = offerLinks.find((link) => link.textContent?.includes("Book Tsunami Growth Strategy Call"));

    expect(starter?.href).toContain("buy.stripe.com");
    expect(builder?.href).toContain("calendly.com/oceantidedrop/new-meeting");
    expect(tsunami?.href).toContain("calendly.com/oceantidedrop/new-meeting");
    expect(container.textContent).not.toContain("Get My $97 AEO Wave Audit");
    expect(saveWaveAuditLead).toHaveBeenCalledWith(expect.objectContaining({
      email: "surfer@example.com",
      submissionId: expect.any(String),
    }));

    await act(async () => root.unmount());
    container.remove();
  });

  it("keeps the report locked while save confirmation is pending", async () => {
    vi.useFakeTimers();
    saveWaveAuditLead.mockReturnValueOnce(new Promise(() => undefined));
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    const clickChoice = async (label: string, advances = true) => {
      const button = [...container.querySelectorAll("button")].find((candidate) => candidate.textContent?.includes(label));
      await act(async () => button?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
      if (advances) await act(async () => vi.advanceTimersByTime(180));
    };

    await act(async () => root.render(<MemoryRouter><WaveAudit /></MemoryRouter>));
    await clickChoice("E-commerce");
    await clickChoice("Just me");
    await clickChoice("A little of everything");
    await clickChoice("Finding new leads");
    await clickChoice("Sales & follow-up", false);

    const input = container.querySelector<HTMLInputElement>("#wave-audit-email");
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    await act(async () => {
      valueSetter?.call(input, "surfer@example.com");
      input?.dispatchEvent(new Event("input", { bubbles: true }));
    });

    await act(async () => container.querySelector("form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));

    expect(container.textContent).not.toContain("Your Full AI Wave Report");
    expect(container.textContent).toContain("Saving...");

    await act(async () => root.unmount());
    container.remove();
  });
});
