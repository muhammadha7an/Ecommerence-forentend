import { useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import authService from "../services/authService";

function AdminDashboardLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const closeMenu = () => setIsOpen(false);

  const logout = () => {
    authService.logout();
    navigate("/admin/login");
  };

  return (
    <div className="dashboard-shell admin-shell">
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <button
          className="dashboard-sidebar-backdrop"
          type="button"
          aria-label="Close navigation"
          onClick={closeMenu}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        id="admin-dashboard-sidebar"
        className={`dashboard-sidebar admin-sidebar ${isOpen ? "is-open" : ""}`}
      >
        <div className="dashboard-sidebar-brand">
          <Link to="/admin/dashboard" onClick={closeMenu}>
            <span>Aura.</span>
          </Link>
          <small>ADMINISTRATOR PANEL</small>
        </div>

        <div className="dashboard-sidebar-user admin-user-box">
          <div className="admin-badge-indicator">
            <span className="admin-badge-pill">Administrator</span>
          </div>
          <strong>{user?.name || "Store Admin"}</strong>
          <span>{user?.email || "admin@aura.store"}</span>
        </div>

        <nav className="dashboard-nav" aria-label="Admin dashboard navigation">
          <NavLink end to="/admin/dashboard" onClick={closeMenu}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Overview</span>
          </NavLink>

          <NavLink to="/admin/products" onClick={closeMenu}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span>Products</span>
          </NavLink>

          <NavLink to="/admin/categories" onClick={closeMenu}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>Categories</span>
          </NavLink>

          <NavLink to="/admin/orders" onClick={closeMenu}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>Orders</span>
          </NavLink>

          <NavLink to="/admin/users" onClick={closeMenu}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>Users</span>
          </NavLink>
        </nav>

        <div className="dashboard-sidebar-spacer" />

        <Link className="dashboard-sidebar-link storefront-link" to="/" onClick={closeMenu}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
          <span>View Public Store</span>
        </Link>

        <button className="dashboard-sidebar-logout" type="button" onClick={logout}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Admin Sign Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <div className="dashboard-shell-content">
        <header className="dashboard-topbar admin-topbar">
          <button
            className="dashboard-menu-toggle-btn"
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          <div className="topbar-breadcrumb">
            <span>Admin</span>
            <span>/</span>
            <span className="current">Management</span>
          </div>

          <div className="topbar-actions">
            <Link to="/" className="topbar-storefront-btn" target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              <span>Live Store</span>
            </Link>

            <div className="topbar-divider" />

            <div className="topbar-user">
              <span className="topbar-avatar admin-avatar">A</span>
              <span className="topbar-name">{user?.name || "Administrator"}</span>
            </div>

            <button
              type="button"
              className="topbar-logout-btn"
              onClick={logout}
              title="Admin Sign Out"
            >
              Sign Out
            </button>
          </div>
        </header>

        <main className="dashboard-main-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminDashboardLayout;
