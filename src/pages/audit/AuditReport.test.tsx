import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import AuditReport from "./AuditReport";

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ session: { access_token: "test-token" } }),
}));

describe("AuditReport", () => {
  it("renders the protected AI Fin report-generation shell", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/audit/report/order-123"]}>
        <Routes>
          <Route path="/audit/report/:orderId" element={<AuditReport />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(html).toContain("Building Your AEO Wave Audit");
    expect(html).toContain("AI Fin is turning your score into a practical plan");
  });
});
