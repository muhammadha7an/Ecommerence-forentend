import { useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import authService from "../services/authService";

// import styles from '../style/AdminDashboardLayout.module.css';

function AdminDashboardLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const closeMenu = () => setIsOpen(false);

  const logout = () => {
    authService.logout();
    navigate("/admin/login");
  };

  const getNavLinkClass = ({ isActive }) =>
    isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem;

  return (
    <div className={styles.shell}>
      {/* Mobile Backdrop */}
      {isOpen && (
        <button
          className={styles.backdrop}
          type="button"
          aria-label="Close navigation menu"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}
        aria-label="Administrator Navigation"
      >
        <div className={styles.brandHeader}>
          <Link to="/admin/dashboard" className={styles.brandLink} onClick={closeMenu}>
            <div className={styles.brandLogo}>A</div>
            <div className={styles.brandText}>
              <span className={styles.brandName}>Aura</span>
              <span className={styles.brandTag}>ADMIN PANEL</span>
            </div>
          </Link>
        </div>

        <div className={styles.userCard}>
          <div className={styles.avatarWrapper}>
            <span className={styles.avatar}>
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </span>
            <span className={styles.statusIndicator} />
          </div>
          <div className={styles.userInfo}>
            <div className={styles.roleBadge}>Administrator</div>
            <strong className={styles.userName}>{user?.name || "Store Admin"}</strong>
            <span className={styles.userEmail}>{user?.email || "admin@aura.store"}</span>
          </div>
        </div>

        <nav className={styles.navMenu}>
          <NavLink end to="/admin/dashboard" className={getNavLinkClass} onClick={closeMenu}>
            <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
            <span>Overview</span>
          </NavLink>

          <NavLink to="/admin/products" className={getNavLinkClass} onClick={closeMenu}>
            <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span>Products</span>
          </NavLink>

          <NavLink to="/admin/categories" className={getNavLinkClass} onClick={closeMenu}>
            <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <span>Categories</span>
          </NavLink>

          <NavLink to="/admin/orders" className={getNavLinkClass} onClick={closeMenu}>
            <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span>Orders</span>
          </NavLink>

          <NavLink to="/admin/users" className={getNavLinkClass} onClick={closeMenu}>
            <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Users</span>
          </NavLink>
        </nav>

        <div className={styles.sidebarFooter}>
          <Link to="/" className={styles.storefrontBtn} onClick={closeMenu}>
            <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            <span>Public Store</span>
          </Link>

          <button type="button" className={styles.logoutBtn} onClick={logout}>
            <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className={styles.mainWrapper}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button
              type="button"
              className={styles.menuToggleBtn}
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close sidebar menu" : "Open sidebar menu"}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {isOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <>
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>

            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <span>Admin</span>
              <span className={styles.breadcrumbDivider}>/</span>
              <span className={styles.breadcrumbCurrent}>Management</span>
            </nav>
          </div>

          <div className={styles.topbarRight}>
            <Link
              to="/"
              className={styles.liveStoreBtn}
              target="_blank"
              rel="noreferrer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span>Live Store</span>
            </Link>

            <div className={styles.topbarDivider} />

            <div className={styles.topbarUser}>
              <span className={styles.topbarAvatar}>
                {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
              </span>
              <span className={styles.topbarName}>{user?.name || "Administrator"}</span>
            </div>

            <button
              type="button"
              className={styles.topbarLogoutBtn}
              onClick={logout}
              title="Admin Sign Out"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </header>

        <main className={styles.contentBody}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminDashboardLayout;