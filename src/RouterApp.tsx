import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import MembersLayout from "./components/members/MembersLayout";
import Login from "./pages/auth/Login";
import ResetPassword from "./pages/auth/ResetPassword";
import MembersDashboard from "./pages/members/MembersDashboard";
import MemberProduct from "./pages/members/MemberProduct";
import SitesLanding from "./pages/home/SitesLanding";
import NotFound from "./pages/not-found/NotFound";
import Pricing from "./pages/pricing/Pricing";
import WaveAudit from "./pages/wave-audit/WaveAudit";
import AuditCheckout from "./pages/audit/AuditCheckout";
import AuditSuccess from "./pages/audit/AuditSuccess";
import AuditIntake from "./pages/audit/AuditIntake";
import AuditReport from "./pages/audit/AuditReport";
import LaunchDesk from "./launch-desk/LaunchDesk";
import SiteLogoHeader from "./components/SiteLogoHeader";

function SiteChrome() {
  const { pathname } = useLocation();
  if (pathname === "/") return null;

  return <SiteLogoHeader />;
}

export default function RouterApp() {
  return (
    <>
      <SiteChrome />
      <div data-site-route-content="true">
        <Routes>
          <Route path="/" element={<SitesLanding />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/wave-audit" element={<WaveAudit />} />
          <Route path="/wave-check" element={<WaveAudit />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/audit/success" element={<AuditSuccess />} />
          <Route path="/audit/checkout" element={<ProtectedRoute><AuditCheckout /></ProtectedRoute>} />
          <Route path="/audit/intake" element={<ProtectedRoute><AuditIntake /></ProtectedRoute>} />
          <Route path="/audit/report/:orderId" element={<ProtectedRoute><AuditReport /></ProtectedRoute>} />

          <Route path="/launch-desk" element={<ProtectedRoute><LaunchDesk /></ProtectedRoute>} />
          <Route path="/members" element={<ProtectedRoute><MembersLayout /></ProtectedRoute>}>
            <Route index element={<MembersDashboard />} />
            <Route path="products/:slug" element={<MemberProduct />} />
          </Route>

          <Route path="/dashboard" element={<Navigate to="/members" replace />} />
          <Route path="/ai-dashboard" element={<Navigate to="/members" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
}
