import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import authService from "../services/authService";
import Icon from "./Icon.jsx";
import "../style/dashboard/console.css";

const pageTitles = [
  { match: /^\/dashboard\/orders\/.+/, title: "Order details" },
  { match: /^\/dashboard\/orders\/?$/, title: "My orders" },
  { match: /^\/dashboard\/profile/, title: "Account & profile" },
  { match: /^\/dashboard\/?$/, title: "Overview" },
];

function DashboardLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const cartItems = useSelector((state) => state.cart?.items || []);
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);

  const totalCart = cartItems.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const totalWishlist = wishlistItems.length;

  const currentTitle =
    pageTitles.find((item) => item.match.test(location.pathname))?.title || "Dashboard";

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

  const logout = () => {
    authService.logout();
    navigate("/login");
  };

  const closeMenu = () => setIsOpen(false);

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";
  const linkClass = ({ isActive }) => `console-nav__link${isActive ? " is-active" : ""}`;

  return (
    <div className="console">
      <button
        className={`console-backdrop ${isOpen ? "is-open" : ""}`}
        type="button"
        aria-label="Close navigation"
        tabIndex={isOpen ? 0 : -1}
        onClick={closeMenu}
      />

      {/* Sidebar */}
      <aside
        id="user-dashboard-sidebar"
        className={`console-sidebar ${isOpen ? "is-open" : ""}`}
        aria-label="Account navigation"
      >
        <div className="console-sidebar__brand">
          <Link to="/" className="console-sidebar__logo" onClick={closeMenu}>
            <span className="console-sidebar__wordmark">Aura<span>.</span></span>
            <small className="console-sidebar__tag">Account</small>
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
              <strong>{user?.name || "Customer"}</strong>
              <span>{user?.email || ""}</span>
            </div>
          </div>

          <nav className="console-nav" aria-label="User dashboard navigation">
            <span className="console-nav__label">My account</span>
            <NavLink end to="/dashboard" className={linkClass} onClick={closeMenu}>
              <Icon name="grid" />
              <span>Overview</span>
            </NavLink>
            <NavLink to="/dashboard/orders" className={linkClass} onClick={closeMenu}>
              <Icon name="package" />
              <span>My Orders</span>
            </NavLink>
            <NavLink to="/dashboard/profile" className={linkClass} onClick={closeMenu}>
              <Icon name="user" />
              <span>Account &amp; Profile</span>
            </NavLink>
          </nav>

          <nav className="console-nav" aria-label="Store shortcuts">
            <span className="console-nav__label">Shopping</span>
            <NavLink to="/wishlist" className={linkClass} onClick={closeMenu}>
              <Icon name="heart" />
              <span>Wishlist</span>
              {totalWishlist > 0 && <span className="console-nav__count">{totalWishlist}</span>}
            </NavLink>
            <NavLink to="/cart" className={linkClass} onClick={closeMenu}>
              <Icon name="bag" />
              <span>Cart</span>
              {totalCart > 0 && <span className="console-nav__count">{totalCart}</span>}
            </NavLink>
            <NavLink to="/shop" className={linkClass} onClick={closeMenu}>
              <Icon name="store" />
              <span>Shop Products</span>
            </NavLink>
          </nav>
        </div>

        <div className="console-sidebar__foot">
          <button className="console-nav__link console-nav__link--danger" type="button" onClick={logout}>
            <Icon name="logOut" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="console-main">
        <header className="console-topbar">
          <button
            className="console-topbar__icon console-topbar__toggle"
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="user-dashboard-sidebar"
          >
            <Icon name="menu" />
          </button>

          <nav className="console-topbar__crumbs" aria-label="Breadcrumb">
            <Link to="/">Store</Link>
            <Icon name="chevronRight" />
            <Link to="/dashboard" className="console-topbar__hide-sm">Account</Link>
            <Icon name="chevronRight" className="console-topbar__hide-sm" />
            <strong>{currentTitle}</strong>
          </nav>

          <div className="console-topbar__actions">
            <Link to="/wishlist" className="console-topbar__icon" title="Wishlist" aria-label="Wishlist">
              <Icon name="heart" />
              {totalWishlist > 0 && <span className="console-topbar__badge">{totalWishlist}</span>}
            </Link>

            <Link to="/cart" className="console-topbar__icon" title="Cart" aria-label="Cart">
              <Icon name="bag" />
              {totalCart > 0 && <span className="console-topbar__badge">{totalCart}</span>}
            </Link>

            <div className="console-topbar__divider" />

            <Link to="/dashboard/profile" className="console-topbar__user" title="My Account">
              <span className="console-avatar console-avatar--sm">{userInitial}</span>
              <span>{user?.name || "Customer"}</span>
            </Link>

            <button
              type="button"
              className="console-topbar__icon"
              onClick={logout}
              title="Sign Out"
              aria-label="Sign out"
            >
              <Icon name="logOut" />
            </button>
          </div>
        </header>

        <main className="console-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
