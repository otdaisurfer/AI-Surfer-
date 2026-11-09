import React from "react";
import { Outlet, Link } from "react-router-dom";

export default function Layout() {
  return (
    <div>
      <header style={{ padding: 16, display: "flex", gap: 12 }}>
        <Link to="/">Home</Link>
        <Link to="/members/pricing"">Pricing</Link>
        <Link to="/shop">Shop</Link>
        <Link to="/members">Members</Link>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}