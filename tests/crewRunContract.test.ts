import { describe, expect, it } from "vitest";
import {
  buildCrewPrompt,
  extractBearerToken,
  tierFromVerifiedUser,
} from "../src/server/crew/runContract";

describe("Crew run request contract", () => {
  it("requires an explicit bearer token", () => {
    expect(extractBearerToken(null)).toBeNull();
    expect(extractBearerToken("Basic abc")).toBeNull();
    expect(extractBearerToken("Bearer verified-token")).toBe("verified-token");
  });

  it("trusts owner status only from verified app metadata", () => {
    expect(
      tierFromVerifiedUser({ app_metadata: { role: "owner" } }, "Member"),
    ).toBe("Owner");
    expect(
      tierFromVerifiedUser({ app_metadata: {}, user_metadata: { role: "owner" } }, "Starter Access"),
    ).toBe("Starter Access");
  });

  it("builds a grounded prompt without exposing credentials", () => {
    const prompt = buildCrewPrompt({
      task: "Find prospects for my business.",
      businessProfile: {
        business_name: "Ocean Tide Drop AI SURFER",
        website: "https://otdaisurfer.surf",
        industry: "AI services",
      },
      projectHistory: [],
    });

    expect(prompt).toContain("Ocean Tide Drop AI SURFER");
    expect(prompt).toContain("Find prospects for my business.");
    expect(prompt).not.toContain("OPENAI_API_KEY");
  });
});
