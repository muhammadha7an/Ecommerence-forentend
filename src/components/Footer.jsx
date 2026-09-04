

const navSections = [
  {
    title: 'Shop',
    links: [
      { label: 'New Arrivals', href: '#' },
      { label: 'Best Sellers', href: '#' },
      { label: 'Categories', href: '#' },
      { label: 'Deals & Sales', href: '#' },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'Our Story', href: '#' },
      { label: 'Our Values', href: '#' },
      { label: 'Sustainability', href: '#' },
      { label: 'Careers', href: '#' },
    ],
  },
  {
    title: 'Customer Service',
    links: [
      { label: 'Shipping & Delivery', href: '#' },
      { label: 'Returns & Exchanges', href: '#' },
      { label: 'Order Tracking', href: '#' },
      { label: 'Help & FAQs', href: '#' },
    ],
  },
];

export default function Footer() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter submission logic
  };

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-main">
          {/* Brand Info */}
          <div className="footer-brand">
            <a href="/" className="site-logo">
              Aura<span>.</span>
            </a>
            <p className="footer-bio">
              Crafting high-quality, sustainable essentials designed to elevate your everyday living.
            </p>
            <div className="social-links">
              <a href="#" className="social-icon" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" className="social-icon" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="#" className="social-icon" aria-label="Twitter">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation Link Columns */}
          {navSections.map((section) => (
            <div key={section.title} className="footer-col">
              <h3>{section.title}</h3>
              <ul>
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter Column */}
          <div className="footer-col newsletter-col">
            <h3>Stay Connected</h3>
            <p>Subscribe to receive updates, access to exclusive deals, and more.</p>
            <form className="newsletter-form" onSubmit={handleSubmit}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                required 
                aria-label="Email address" 
              />
              <button type="submit" className="newsletter-btn" aria-label="Subscribe">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Bottom copyright & legal links */}
        <div className="footer-bottom">
          <p>© 2026 Aura Storefront. All rights reserved.</p>
          <div className="footer-legal-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
}