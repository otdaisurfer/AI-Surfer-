import { describe, expect, it } from "vitest";
import { AEO_AUDIT_QUESTIONS, scoreAeoAudit } from "./scoring";

describe("paid AEO audit scoring", () => {
  it("defines exactly 30 scored questions across six categories", () => {
    expect(AEO_AUDIT_QUESTIONS).toHaveLength(30);
    const categories = AEO_AUDIT_QUESTIONS.reduce<Record<string, number>>((acc, q) => {
      acc[q.category] = (acc[q.category] || 0) + 1;
      return acc;
    }, {});
    expect(categories).toEqual({
      conversational_intent: 5,
      entity_authority: 5,
      technical_readiness: 5,
      content_authority: 5,
      ai_visibility: 5,
      citation_opportunities: 5,
    });
  });

  it("caps the six categories at 15,20,15,15,20,15 for a 100-point total", () => {
    const answers = Object.fromEntries(AEO_AUDIT_QUESTIONS.map((q) => [q.id, q.maxPoints]));
    expect(scoreAeoAudit(answers)).toMatchObject({
      conversational_intent: 15,
      entity_authority: 20,
      technical_readiness: 15,
      content_authority: 15,
      ai_visibility: 20,
      citation_opportunities: 15,
      total_score: 100,
      score_level: "AI Surf Ready",
    });
  });
});
