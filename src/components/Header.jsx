import { useState } from 'react';
import { Link } from 'react-router-dom'

const menuItems = [
  ['Home', '/'],
  ['Shop', '/shop'],
  ['About', '/about'],
  ['Contact', '/contact'],
  ['Cart', '/cart'],
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={`site-header ${isMenuOpen ? 'menu-open' : ''}`}>
      {/* Logo */}
      <Link to="/" className="site-logo">
        Aura<span>.</span>
      </Link>       

      {/* Main nav links */}
      <nav className="main-nav" aria-label="Main navigation">
        {menuItems.map(([label, href]) => (
          <Link key={label} to={href} onClick={() => setIsMenuOpen(false)}>
            {label}
          </Link>
        ))}
      </nav>

      {/* Right side actions */}
      <div className="header-actions">
        <Link to="/search" aria-label="Search" className="icon-btn desktop-only">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </Link>
        
        <Link to="/account" aria-label="Account" className="icon-btn desktop-only">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </Link>
        
        <Link to="/wishlist" aria-label="Wishlist" className="icon-btn desktop-only">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </Link>
        
        <Link to="/cart" aria-label="Cart" className="icon-btn cart-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <span className="cart-count">2</span>
        </Link>

        {/* Mobile Hamburger Toggle */}
        <button 
          className="icon-btn mobile-toggle" 
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            /* X Close Icon */
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            /* Hamburger Menu Icon */
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
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