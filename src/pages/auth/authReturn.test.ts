import { describe, expect, it } from "vitest";
import { buildAuthRedirectUrl, safeAuthReturnPath } from "./authReturn";

describe("AEO checkout auth return", () => {
  it("keeps the paid AEO checkout as a safe post-auth destination", () => {
    expect(safeAuthReturnPath("/audit/checkout", "https://otdaisurfer.surf")).toBe("/audit/checkout");
  });

  it("preserves the paid audit intake session after authentication", () => {
    expect(
      safeAuthReturnPath(
        "/audit/intake?session_id=cs_live_example",
        "https://otdaisurfer.surf",
      ),
    ).toBe("/audit/intake?session_id=cs_live_example");
  });

  it("preserves a paid audit report route after authentication", () => {
    expect(
      safeAuthReturnPath(
        "/audit/report/order-123",
        "https://otdaisurfer.surf",
      ),
    ).toBe("/audit/report/order-123");
  });

  it("rejects an external return destination", () => {
    expect(
      safeAuthReturnPath("https://example.com/steal", "https://otdaisurfer.surf"),
    ).toBe("/members");
  });

  it("encodes the checkout destination into the signup confirmation redirect", () => {
    expect(
      buildAuthRedirectUrl(
        "https://otdaisurfer.surf",
        "/audit/checkout",
      ),
    ).toBe(
      "https://otdaisurfer.surf/login?returnTo=%2Faudit%2Fcheckout",
    );
  });
});
