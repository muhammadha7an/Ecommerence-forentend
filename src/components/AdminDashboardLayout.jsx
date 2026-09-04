import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import authService from "../services/authService";

function AdminDashboardLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const closeMenu = () => setIsOpen(false);

  const logout = () => {
    authService.logout();
    navigate("/admin/login");
  };

  return (
    <div className="dashboard-shell admin-shell">
      <button className="dashboard-menu-toggle" type="button" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen} aria-controls="admin-dashboard-sidebar">
        {isOpen ? "Close menu" : "Open menu"}
      </button>
      {isOpen && <button className="dashboard-sidebar-backdrop" type="button" aria-label="Close navigation" onClick={closeMenu} />}
      <aside id="admin-dashboard-sidebar" className={`dashboard-sidebar admin-sidebar ${isOpen ? "is-open" : ""}`}>
        <div className="dashboard-sidebar-brand"><span>Aura.</span><small>ADMIN PANEL</small></div>
        <nav className="dashboard-nav" aria-label="Admin dashboard navigation">
          <NavLink end to="/admin/dashboard" onClick={closeMenu}>Dashboard</NavLink>
          <NavLink to="/admin/users" onClick={closeMenu}>Users</NavLink>
          <NavLink to="/admin/orders" onClick={closeMenu}>Orders</NavLink>
          <NavLink to="/admin/products" onClick={closeMenu}>Products</NavLink>
          <NavLink to="/admin/categories" onClick={closeMenu}>Categories</NavLink>
        </nav>
        <div className="dashboard-sidebar-spacer" />
        <NavLink className="dashboard-sidebar-link" to="/account" onClick={closeMenu}>Account Settings</NavLink>
        <button className="dashboard-sidebar-logout" type="button" onClick={logout}>Logout</button>
      </aside>
      <main className="dashboard-shell-content"><Outlet /></main>
    </div>
  );
}

export default AdminDashboardLayout;
