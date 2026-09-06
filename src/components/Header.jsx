import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import authService from '../services/authService';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    authService.logout();
    closeMenu();
    navigate('/login');
  };

  return (
    <header className={`site-header ${isMenuOpen ? 'menu-open' : ''}`}>
      {/* Logo */}
      <Link to="/" className="site-logo" onClick={closeMenu}>
        Aura<span>.</span>
      </Link>

      {/* Main nav links (Desktop + Mobile slide-out) */}
      <nav className="main-nav" aria-label="Main navigation">
        <Link to="/" onClick={closeMenu}>
          Home
        </Link>
        <Link to="/shop" onClick={closeMenu}>
          Shop
        </Link>
        <Link to="/about" onClick={closeMenu}>
          About
        </Link>
        <Link to="/contact" onClick={closeMenu}>
          Contact
        </Link>

        {/* Mobile-only section in menu */}
        <div className="mobile-menu-extras">
          <Link to="/cart" onClick={closeMenu} className="mobile-menu-item">
            <span>Cart</span>
            {totalCartCount > 0 && (
              <span className="mobile-badge">{totalCartCount}</span>
            )}
          </Link>

          <Link to="/wishlist" onClick={closeMenu} className="mobile-menu-item">
            <span>Wishlist</span>
            {totalWishlistCount > 0 && (
              <span className="mobile-badge">{totalWishlistCount}</span>
            )}
          </Link>

          {isAuthenticated ? (
            <>
              <Link to={dashboardPath} onClick={closeMenu} className="mobile-menu-item highlight">
                {isAdmin ? 'Admin Dashboard' : 'User Dashboard'}
              </Link>
              <Link to="/account" onClick={closeMenu} className="mobile-menu-item">
                My Account
              </Link>
              <button
                type="button"
                className="mobile-menu-logout"
                onClick={handleLogout}
              >
                Sign Out ({user?.name || 'User'})
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu} className="mobile-menu-item">
                Sign In
              </Link>
              <Link to="/signup" onClick={closeMenu} className="mobile-menu-item highlight">
                Create Account
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Right side actions (Desktop & Icons) */}
      <div className="header-actions">
        {isAuthenticated && (
          <Link
            to={dashboardPath}
            aria-label="Dashboard"
            className="icon-btn desktop-only dashboard-link-icon"
            title={isAdmin ? 'Admin Dashboard' : 'User Dashboard'}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </Link>
        )}

        <Link
          to={isAuthenticated ? '/account' : '/login'}
          aria-label="Account"
          className="icon-btn desktop-only"
          title="Account"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </Link>

        <Link
          to="/wishlist"
          aria-label="Wishlist"
          className="icon-btn desktop-only wishlist-btn"
          title="Wishlist"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          {totalWishlistCount > 0 && (
            <span className="cart-count">{totalWishlistCount}</span>
          )}
        </Link>

        <Link to="/cart" aria-label="Cart" className="icon-btn cart-btn" title="Cart">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          {totalCartCount > 0 && (
            <span className="cart-count">{totalCartCount}</span>
          )}
        </Link>

        {/* Mobile Hamburger Toggle */}
        <button
          className="icon-btn mobile-toggle"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            /* X Close Icon */
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            /* Hamburger Menu Icon */
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}