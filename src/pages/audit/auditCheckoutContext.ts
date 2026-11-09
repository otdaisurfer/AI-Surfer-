const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validSubmissionId(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

export function buildAuditCheckoutPath(submissionId: string) {
  if (!validSubmissionId(submissionId)) return "/audit/checkout";
  return `/audit/checkout?submission_id=${encodeURIComponent(submissionId)}`;
}

export function resolveAuditSubmissionId(search: string, storedContext: string | null) {
  const fromUrl = new URLSearchParams(search).get("submission_id");
  if (validSubmissionId(fromUrl)) return fromUrl;

  if (!storedContext) return null;

  try {
    const parsed = JSON.parse(storedContext) as { submissionId?: unknown };
    return validSubmissionId(parsed.submissionId) ? parsed.submissionId : null;
  } catch {
    return null;
  }
}

export function buildStoredAuditCheckoutContext(destination: string, email?: string | null) {
  try {
    const target = new URL(destination, "https://ai-surfer.local");
    if (target.pathname !== "/audit/checkout") return null;

    const submissionId = resolveAuditSubmissionId(target.search, null);
    if (!submissionId) return null;

    return JSON.stringify({ submissionId, email: email ?? "" });
  } catch {
    return null;
  }
}
