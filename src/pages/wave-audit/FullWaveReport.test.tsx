import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import FullWaveReport from "./FullWaveReport";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function reportElement(
  saveStatus: "saving" | "saved" | "uncertain" = "saved",
  onRetrySave?: () => void,
) {
  return (
    <MemoryRouter>
      <FullWaveReport
        email="surfer@example.com"
        submissionId="5ed95f2f-1321-4aa8-bc88-f8f952cc6975"
        saveStatus={saveStatus}
        onRetrySave={onRetrySave ?? (() => undefined)}
        answers={{
          businessType: "ecommerce",
          teamSize: "solo",
          timeDrain: "multiple",
          lostOpportunity: "leads",
          aiPriority: "sales",
        }}
        result={{
          score: 99,
          topCategory: "Lead & Sales Follow-Up",
          opportunities: ["Faster response", "Consistent follow-up"],
          recommendedAgent: "Sales Rider",
          confidenceLabel: "High opportunity",
        }}
      />
    </MemoryRouter>
  );
}

function renderReport() {
  return renderToString(reportElement());
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("FullWaveReport", () => {
  it("renders the unlocked report and portable report controls", () => {
    const html = renderReport();

    expect(html).toContain("Your Full AI Wave Report");
    expect(html).toContain("30-Day Wave Plan");
    expect(html).toContain("Copy Report");
    expect(html).toContain("Download Report");
    expect(html).toContain("Saved securely");
    expect(html).not.toContain("on the way");
  });

  it("offers the approved paid implementation ladder instead of the retired $97 audit", () => {
    const html = renderReport();

    expect(html).toContain("Catch Your Next Wave");
    expect(html).toContain("Wave Starter");
    expect(html).toContain("$497");
    expect(html).toContain("Wave Builder");
    expect(html).toContain("$1,997");
    expect(html).toContain("Tsunami Growth");
    expect(html).toContain("$3,997");
    expect(html).not.toContain("Get My $97 AEO Wave Audit");
  });

  it("routes the $497 offer to Stripe and higher tiers to strategy-call handoffs", () => {
    const html = renderReport();

    expect(html).toContain("https://buy.stripe.com/aFa8wP7JN3500Uy1tt4gg0b");
    expect(html).toContain("https://calendly.com/oceantidedrop/new-meeting");
    expect(html.match(/https:\/\/calendly\.com\/oceantidedrop\/new-meeting/g)?.length).toBeGreaterThanOrEqual(2);
    expect(html).not.toContain('href="/audit/checkout"');
  });

  it("offers a safe retry when save confirmation is uncertain", async () => {
    const onRetrySave = vi.fn();
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => root.render(reportElement("uncertain", onRetrySave)));

    const retryButton = [...container.querySelectorAll("button")].find(
      (button) => button.textContent?.includes("Retry Save"),
    );
    expect(retryButton).toBeTruthy();

    await act(async () => {
      retryButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(onRetrySave).toHaveBeenCalledOnce();

    await act(async () => root.unmount());
  });
});
