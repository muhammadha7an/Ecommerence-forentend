import { useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import authService from "../services/authService";

function DashboardLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const cartItems = useSelector((state) => state.cart?.items || []);
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);

  const totalCart = cartItems.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const totalWishlist = wishlistItems.length;

  const logout = () => {
    authService.logout();
    navigate("/login");
  };

  const closeMenu = () => setIsOpen(false);

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="dashboard-shell">
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <button
          className="dashboard-sidebar-backdrop"
          type="button"
          aria-label="Close navigation"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        id="user-dashboard-sidebar"
        className={`dashboard-sidebar ${isOpen ? "is-open" : ""}`}
      >
        <div className="dashboard-sidebar-brand">
          <Link to="/" onClick={closeMenu}>
            <span>Aura.</span>
          </Link>
          <small>USER DASHBOARD</small>
        </div>

        <div className="dashboard-sidebar-user">
          <div className="dashboard-user-badge">
            <span className="user-avatar-circle">{userInitial}</span>
            <div className="user-meta">
              <strong>{user?.name || "Customer"}</strong>
              <span>{user?.email || ""}</span>
            </div>
          </div>
        </div>

        <nav className="dashboard-nav" aria-label="User dashboard navigation">
          <NavLink end to="/dashboard" onClick={closeMenu}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Overview</span>
          </NavLink>

          <NavLink to="/dashboard/orders" onClick={closeMenu}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>My Orders</span>
          </NavLink>

          <NavLink to="/wishlist" onClick={closeMenu} className="nav-with-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span>Wishlist</span>
            {totalWishlist > 0 && <span className="nav-count">{totalWishlist}</span>}
          </NavLink>

          <NavLink to="/cart" onClick={closeMenu} className="nav-with-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span>Cart</span>
            {totalCart > 0 && <span className="nav-count">{totalCart}</span>}
          </NavLink>

          <NavLink to="/account" onClick={closeMenu}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Account & Profile</span>
          </NavLink>

          <NavLink to="/shop" onClick={closeMenu}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span>Shop Products</span>
          </NavLink>
        </nav>

        <div className="dashboard-sidebar-spacer" />

        <button className="dashboard-sidebar-logout" type="button" onClick={logout}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Sign Out</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="dashboard-shell-content">
        {/* Topbar */}
        <header className="dashboard-topbar">
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
            <Link to="/">Store</Link>
            <span>/</span>
            <span className="current">User Dashboard</span>
          </div>

          <div className="topbar-actions">
            <Link to="/wishlist" className="topbar-icon-btn" title="Wishlist">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              {totalWishlist > 0 && <span className="topbar-badge">{totalWishlist}</span>}
            </Link>

            <Link to="/cart" className="topbar-icon-btn" title="Cart">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              {totalCart > 0 && <span className="topbar-badge">{totalCart}</span>}
            </Link>

            <div className="topbar-divider" />

            <Link to="/account" className="topbar-user" title="My Account">
              <span className="topbar-avatar">{userInitial}</span>
              <span className="topbar-name">{user?.name || "Customer"}</span>
            </Link>

            <button
              type="button"
              className="topbar-logout-btn"
              onClick={logout}
              title="Sign Out"
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

export default DashboardLayout;
