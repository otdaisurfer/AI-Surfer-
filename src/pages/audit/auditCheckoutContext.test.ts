import { describe, expect, it } from "vitest";
import { buildAuditCheckoutPath, resolveAuditSubmissionId } from "./auditCheckoutContext";

const submissionId = "5ed95f2f-1321-4aa8-bc88-f8f952cc6975";

describe("AEO checkout submission context", () => {
  it("puts the submission id in the protected checkout URL", () => {
    expect(buildAuditCheckoutPath(submissionId)).toBe(
      `/audit/checkout?submission_id=${submissionId}`,
    );
  });

  it("restores the submission id from the URL when sessionStorage is unavailable in a new tab", () => {
    expect(
      resolveAuditSubmissionId(`?submission_id=${submissionId}`, null),
    ).toBe(submissionId);
  });

  it("falls back to the stored checkout context for existing same-tab sessions", () => {
    expect(
      resolveAuditSubmissionId(
        "",
        JSON.stringify({ submissionId, email: "surfer@example.com" }),
      ),
    ).toBe(submissionId);
  });

  it("rejects malformed submission ids", () => {
    expect(resolveAuditSubmissionId("?submission_id=not-a-uuid", null)).toBeNull();
  });
});
