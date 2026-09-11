import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import authService from "../services/authService";
import Icon from "./Icon.jsx";
import "../style/dashboard/console.css";
import "../style/admin/admin.css";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "grid", end: true },
  { to: "/admin/products", label: "Products", icon: "tag" },
  { to: "/admin/categories", label: "Categories", icon: "folder" },
  { to: "/admin/orders", label: "Orders", icon: "package" },
  { to: "/admin/users", label: "Users", icon: "users" },
  { to: "/admin/subscribers", label: "Subscribers", icon: "mail" },
  { to: "/admin/contact-messages", label: "Contact Messages", icon: "inbox" },
  { to: "/admin/settings", label: "Settings", icon: "settings" },
];

const pageTitles = [
  { match: /^\/admin\/products\/add/, title: "Add product" },
  { match: /^\/admin\/products\/edit/, title: "Edit product" },
  { match: /^\/admin\/products/, title: "Products" },
  { match: /^\/admin\/categories/, title: "Categories" },
  { match: /^\/admin\/orders/, title: "Orders" },
  { match: /^\/admin\/users/, title: "Users" },
  { match: /^\/admin\/subscribers/, title: "Subscribers" },
  { match: /^\/admin\/contact-messages/, title: "Contact messages" },
  { match: /^\/admin\/settings/, title: "Settings" },
  { match: /^\/admin\/dashboard/, title: "Overview" },
];

function AdminDashboardLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const currentTitle =
    pageTitles.find((item) => item.match.test(location.pathname))?.title || "Management";

  useEffect(() => {
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.classList.add("is-scroll-locked");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("is-scroll-locked");
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  const logout = () => {
    authService.logout();
    navigate("/admin/login");
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "A";
  const linkClass = ({ isActive }) => `console-nav__link${isActive ? " is-active" : ""}`;

  return (
    <div className="console console--admin">
      <button
        className={`console-backdrop ${isOpen ? "is-open" : ""}`}
        type="button"
        aria-label="Close navigation menu"
        tabIndex={isOpen ? 0 : -1}
        onClick={closeMenu}
      />

      {/* Sidebar */}
      <aside
        id="admin-sidebar"
        className={`console-sidebar ${isOpen ? "is-open" : ""}`}
        aria-label="Administrator navigation"
      >
        <div className="console-sidebar__brand">
          <Link to="/admin/dashboard" className="console-sidebar__logo" onClick={closeMenu}>
            <span className="console-sidebar__wordmark">Aura<span>.</span></span>
            <small className="console-sidebar__tag">Admin</small>
          </Link>
          <button
            type="button"
            className="ui-btn ui-btn--ghost ui-btn--icon ui-btn--sm console-sidebar__close"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="console-sidebar__scroll">
          <div className="console-user">
            <span className="console-avatar">{userInitial}</span>
            <div className="console-user__meta">
              <strong>{user?.name || "Store Admin"}</strong>
              <span>{user?.email || "Administrator"}</span>
            </div>
          </div>

          <nav className="console-nav" aria-label="Admin sections">
            <span className="console-nav__label">Store management</span>
            {navItems.map((item) => (
              <NavLink key={item.to} end={item.end} to={item.to} className={linkClass} onClick={closeMenu}>
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="console-sidebar__foot">
          <Link to="/" className="console-nav__link" onClick={closeMenu}>
            <Icon name="externalLink" />
            <span>Public Store</span>
          </Link>
          <button type="button" className="console-nav__link console-nav__link--danger" onClick={logout}>
            <Icon name="logOut" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main workspace */}
      <div className="console-main">
        <header className="console-topbar">
          <button
            type="button"
            className="console-topbar__icon console-topbar__toggle"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close sidebar menu" : "Open sidebar menu"}
            aria-expanded={isOpen}
            aria-controls="admin-sidebar"
          >
            <Icon name="menu" />
          </button>

          <nav className="console-topbar__crumbs" aria-label="Breadcrumb">
            <Link to="/admin/dashboard">Admin</Link>
            <Icon name="chevronRight" />
            <strong>{currentTitle}</strong>
          </nav>

          <div className="console-topbar__actions">
            <Link
              to="/"
              className="ui-btn ui-btn--secondary ui-btn--sm console-topbar__hide-sm"
              target="_blank"
              rel="noreferrer"
            >
              <Icon name="globe" />
              Live Store
            </Link>

            <div className="console-topbar__divider" />

            <div className="console-topbar__user">
              <span className="console-avatar console-avatar--sm console-avatar--ink">{userInitial}</span>
              <span>{user?.name || "Administrator"}</span>
            </div>

            <button
              type="button"
              className="console-topbar__icon"
              onClick={logout}
              title="Admin Sign Out"
              aria-label="Sign out"
            >
              <Icon name="logOut" />
            </button>
          </div>
        </header>

        <main className="console-body admin-dashboard-scope">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminDashboardLayout;
