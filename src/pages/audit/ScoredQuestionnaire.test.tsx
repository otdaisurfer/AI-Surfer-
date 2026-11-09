import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import ScoredQuestionnaire from "./ScoredQuestionnaire";

describe("ScoredQuestionnaire", () => {
  it("renders all six AEO score sections and 30 scored questions", () => {
    const html = renderToStaticMarkup(<ScoredQuestionnaire answers={{}} onChange={vi.fn()} />);
    expect(html).toContain("Conversational Intent");
    expect(html).toContain("Entity Authority");
    expect(html).toContain("Technical AI Readiness");
    expect(html).toContain("Content Authority");
    expect(html).toContain("AI Visibility");
    expect(html).toContain("Citation Opportunities");
    expect((html.match(/data-aeo-question=/g) || []).length).toBe(30);
  });
});
