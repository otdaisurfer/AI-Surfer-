export const DEFAULT_AUTH_DESTINATION = "/members";

export function safeAuthReturnPath(value: unknown, origin: string) {
  if (typeof value !== "string" || value.includes("\\")) {
    return DEFAULT_AUTH_DESTINATION;
  }

  try {
    const candidate = new URL(value, origin);
    const isProtectedPath =
      candidate.pathname === "/members" ||
      candidate.pathname.startsWith("/members/") ||
      candidate.pathname === "/launch-desk" ||
      candidate.pathname === "/audit/checkout" ||
      candidate.pathname === "/audit/intake" ||
      candidate.pathname.startsWith("/audit/report/");

    if (candidate.origin !== origin || !isProtectedPath) {
      return DEFAULT_AUTH_DESTINATION;
    }

    return `${candidate.pathname}${candidate.search}${candidate.hash}`;
  } catch {
    return DEFAULT_AUTH_DESTINATION;
  }
}

export function buildAuthRedirectUrl(origin: string, destination: string) {
  const redirect = new URL("/login", origin);
  redirect.searchParams.set("returnTo", safeAuthReturnPath(destination, origin));
  return redirect.toString();
}
