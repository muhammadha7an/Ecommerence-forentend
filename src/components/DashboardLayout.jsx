import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import authService from "../services/authService";

function DashboardLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const logout = () => {
    authService.logout();
    navigate("/login");
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <div className="dashboard-shell">
      <button className="dashboard-menu-toggle" type="button" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen} aria-controls="user-dashboard-sidebar">
        {isOpen ? "Close menu" : "Open menu"}
      </button>
      {isOpen && <button className="dashboard-sidebar-backdrop" type="button" aria-label="Close navigation" onClick={closeMenu} />}
      <aside id="user-dashboard-sidebar" className={`dashboard-sidebar ${isOpen ? "is-open" : ""}`}>
        <div className="dashboard-sidebar-brand"><span>Aura.</span><small>USER DASHBOARD</small></div>
        <div className="dashboard-sidebar-user"><strong>{user?.name || "Customer"}</strong><span>{user?.email || ""}</span></div>
        <nav className="dashboard-nav" aria-label="User dashboard navigation">
          <NavLink end to="/dashboard" onClick={closeMenu}>Dashboard</NavLink>
          <NavLink to="/dashboard/orders" onClick={closeMenu}>My Orders</NavLink>
          <NavLink to="/dashboard/profile" onClick={closeMenu}>Profile</NavLink>
          <NavLink to="/account" onClick={closeMenu}>Account Settings</NavLink>
        </nav>
        <button className="dashboard-sidebar-logout" type="button" onClick={logout}>Logout</button>
      </aside>
      <main className="dashboard-shell-content"><Outlet /></main>
    </div>
  );
}

export default DashboardLayout;
