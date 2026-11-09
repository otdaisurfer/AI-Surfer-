import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { buildAuditCheckoutPath, resolveAuditSubmissionId } from "../pages/audit/auditCheckoutContext";

const AEO_CHECKOUT_CONTEXT_KEY = "ai-surfer:aeo-checkout-context";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 24,
          background: "#050914",
          color: "white",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
        }}
      >
        🌊 Checking your session...
      </div>
    );
  }

  if (!session) {
    let from = `${location.pathname}${location.search}${location.hash}`;

    if (location.pathname === "/audit/checkout" && !location.search) {
      const submissionId = resolveAuditSubmissionId(
        "",
        window.sessionStorage.getItem(AEO_CHECKOUT_CONTEXT_KEY),
      );
      if (submissionId) from = buildAuditCheckoutPath(submissionId);
    }

    return <Navigate to="/login" replace state={{ from }} />;
  }

  return <>{children}</>;
}
