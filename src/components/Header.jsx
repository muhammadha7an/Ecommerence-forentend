import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import authService from '../services/authService';
import Icon from './Icon.jsx';
import { useFreeShippingThreshold } from '../hooks/useShipping';
import { freeShippingPhrase } from '../utils/commerce';
import '../style/components/header.css';

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const accountRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const cartItems = useSelector((state) => state.cart?.items || []);
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);

  const totalCartCount = cartItems.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );
  const totalWishlistCount = wishlistItems.length;

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isAuthenticated = Boolean(token && user);
  const isAdmin = user?.role === 'admin';
  const dashboardPath = isAdmin ? '/admin/dashboard' : '/dashboard';
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  // Close all overlays when the route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsAccountOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname, location.search]);

  // Subtle elevation once the page scrolls
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock page scroll while the mobile drawer is open
  useEffect(() => {
    document.body.classList.toggle('is-scroll-locked', isMenuOpen);
    return () => document.body.classList.remove('is-scroll-locked');
  }, [isMenuOpen]);

  // Escape closes overlays; outside click closes the account menu
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        setIsAccountOpen(false);
        setIsSearchOpen(false);
      }
    };
    const onPointer = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setIsAccountOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
    };
  }, []);

  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus();
  }, [isSearchOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    authService.logout();
    closeMenu();
    setIsAccountOpen(false);
    navigate('/login');
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const term = searchTerm.trim();
    navigate(term ? `/shop?search=${encodeURIComponent(term)}` : '/shop');
    setSearchTerm('');
    setIsSearchOpen(false);
    closeMenu();
  };

  const freeShippingThreshold = useFreeShippingThreshold();

  const navClass = ({ isActive }) => `site-nav__link${isActive ? ' is-active' : ''}`;
  const drawerLinkClass = ({ isActive }) => `drawer__link${isActive ? ' is-active' : ''}`;

  return (
    <>
      <div className="announcement-bar">
        <p>
          <Icon name="truck" />
          Free shipping {freeShippingPhrase(freeShippingThreshold)}, with easy returns.
        </p>
      </div>

      <header className={`site-header${isScrolled ? ' is-scrolled' : ''}`}>
        <div className="site-header__inner">
          {/* Mobile menu toggle (left on small screens) */}
          <button
            type="button"
            className="header-icon-btn header-menu-toggle"
            onClick={toggleMenu}
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-drawer"
          >
            <Icon name="menu" />
          </button>

          {/* Logo */}
          <Link to="/" className="site-logo" onClick={closeMenu} aria-label="Aura home">
            Aura<span>.</span>
          </Link>

          {/* Desktop navigation */}
          <nav className="site-nav" aria-label="Main navigation">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="header-actions">
            <button
              type="button"
              className={`header-icon-btn header-search-toggle${isSearchOpen ? ' is-active' : ''}`}
              onClick={() => setIsSearchOpen((open) => !open)}
              aria-label={isSearchOpen ? 'Close search' : 'Search products'}
              aria-expanded={isSearchOpen}
            >
              <Icon name={isSearchOpen ? 'close' : 'search'} />
            </button>

            {/* Account */}
            <div className="header-account" ref={accountRef}>
              {isAuthenticated ? (
                <>
                  <button
                    type="button"
                    className={`header-account__trigger${isAccountOpen ? ' is-open' : ''}`}
                    onClick={() => setIsAccountOpen((open) => !open)}
                    aria-haspopup="menu"
                    aria-expanded={isAccountOpen}
                    aria-label="Account menu"
                  >
                    <span className="header-account__avatar">{userInitial}</span>
                    <span className="header-account__name">{user?.name?.split(' ')[0] || 'Account'}</span>
                    <Icon name="chevronDown" className="header-account__chevron" />
                  </button>

                  {isAccountOpen && (
                    <div className="account-menu" role="menu">
                      <div className="account-menu__head">
                        <strong>{user?.name || 'Customer'}</strong>
                        <span>{user?.email}</span>
                      </div>
                      <Link to={dashboardPath} className="account-menu__item" role="menuitem">
                        <Icon name="grid" />
                        {isAdmin ? 'Admin Dashboard' : 'User Dashboard'}
                      </Link>
                      {!isAdmin && (
                        <Link to="/dashboard/orders" className="account-menu__item" role="menuitem">
                          <Icon name="package" />
                          My Orders
                        </Link>
                      )}
                      <Link to="/account" className="account-menu__item" role="menuitem">
                        <Icon name="user" />
                        My Account
                      </Link>
                      <Link to="/wishlist" className="account-menu__item" role="menuitem">
                        <Icon name="heart" />
                        Wishlist
                      </Link>
                      <button
                        type="button"
                        className="account-menu__item account-menu__item--danger"
                        onClick={handleLogout}
                        role="menuitem"
                      >
                        <Icon name="logOut" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link to="/login" className="header-icon-btn header-login-link" aria-label="Sign in" title="Sign in">
                  <Icon name="user" />
                  <span className="header-login-link__text">Sign in</span>
                </Link>
              )}
            </div>

            <Link
              to="/wishlist"
              aria-label={`Wishlist, ${totalWishlistCount} items`}
              className="header-icon-btn header-wishlist-link"
              title="Wishlist"
            >
              <Icon name="heart" />
              {totalWishlistCount > 0 && <span className="header-count">{totalWishlistCount}</span>}
            </Link>

            <Link
              to="/cart"
              aria-label={`Cart, ${totalCartCount} items`}
              className="header-icon-btn header-cart-link"
              title="Cart"
            >
              <Icon name="bag" />
              {totalCartCount > 0 && (
                <span className="header-count header-count--accent">{totalCartCount}</span>
              )}
            </Link>
          </div>
        </div>

        {/* Search panel */}
        {isSearchOpen && (
          <div className="header-search">
            <form className="header-search__form" onSubmit={handleSearch} role="search">
              <Icon name="search" />
              <input
                ref={searchInputRef}
                type="search"
                placeholder="Search mugs, candles, notebooks…"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                aria-label="Search products"
              />
              <button type="submit" className="ui-btn ui-btn--sm">
                Search
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile drawer */}
      <div
        className={`drawer-backdrop${isMenuOpen ? ' is-open' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />
      <aside
        id="mobile-drawer"
        className={`drawer${isMenuOpen ? ' is-open' : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!isMenuOpen}
        inert={!isMenuOpen}
      >
        <div className="drawer__head">
          <Link to="/" className="site-logo" onClick={closeMenu}>
            Aura<span>.</span>
          </Link>
          <button type="button" className="header-icon-btn" onClick={closeMenu} aria-label="Close menu">
            <Icon name="close" />
          </button>
        </div>

        <form className="drawer__search" onSubmit={handleSearch} role="search">
          <Icon name="search" />
          <input
            type="search"
            placeholder="Search products"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label="Search products"
          />
        </form>

        {isAuthenticated && (
          <div className="drawer__user">
            <span className="header-account__avatar">{userInitial}</span>
            <div>
              <strong>{user?.name || 'Customer'}</strong>
              <span>{user?.email}</span>
            </div>
          </div>
        )}

        <nav className="drawer__nav" aria-label="Mobile main navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={drawerLinkClass} onClick={closeMenu}>
              {item.label}
              <Icon name="chevronRight" />
            </NavLink>
          ))}
        </nav>

        <div className="drawer__group">
          <span className="drawer__group-title">Your items</span>
          <Link to="/cart" onClick={closeMenu} className="drawer__row">
            <Icon name="bag" />
            <span>Cart</span>
            {totalCartCount > 0 && <span className="drawer__count">{totalCartCount}</span>}
          </Link>
          <Link to="/wishlist" onClick={closeMenu} className="drawer__row">
            <Icon name="heart" />
            <span>Wishlist</span>
            {totalWishlistCount > 0 && <span className="drawer__count">{totalWishlistCount}</span>}
          </Link>
        </div>

        <div className="drawer__group">
          <span className="drawer__group-title">Account</span>
          {isAuthenticated ? (
            <>
              <Link to={dashboardPath} onClick={closeMenu} className="drawer__row">
                <Icon name="grid" />
                <span>{isAdmin ? 'Admin Dashboard' : 'User Dashboard'}</span>
              </Link>
              <Link to="/account" onClick={closeMenu} className="drawer__row">
                <Icon name="user" />
                <span>My Account</span>
              </Link>
            </>
          ) : (
            <Link to="/login" onClick={closeMenu} className="drawer__row">
              <Icon name="user" />
              <span>Sign In</span>
            </Link>
          )}
        </div>

        <div className="drawer__footer">
          {isAuthenticated ? (
            <button type="button" className="ui-btn ui-btn--secondary ui-btn--block" onClick={handleLogout}>
              <Icon name="logOut" />
              Sign Out ({user?.name || 'User'})
            </button>
          ) : (
            <Link to="/signup" onClick={closeMenu} className="ui-btn ui-btn--block">
              Create Account
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
