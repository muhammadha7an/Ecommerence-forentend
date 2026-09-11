import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import NewsletterForm from './NewsletterForm.jsx';
import '../style/components/footer.css';

const navSections = [
  {
    title: 'Shop',
    links: [
      { label: 'All products', to: '/shop' },
      { label: 'Categories', to: '/shop' },
      { label: 'Wishlist', to: '/wishlist' },
      { label: 'Cart', to: '/cart' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Our story', to: '/about' },
      { label: 'Our values', to: '/about' },
      { label: 'Contact us', to: '/contact' },
    ],
  },
  {
    title: 'Customer care',
    links: [
      { label: 'Help & FAQs', to: '/about' },
      { label: 'Track an order', to: '/dashboard/orders' },
      { label: 'My account', to: '/account' },
      { label: 'Returns & exchanges', to: '/contact' },
    ],
  },
];

const socialLinks = [
  { label: 'Instagram', icon: 'instagram', href: 'https://instagram.com' },
  { label: 'Facebook', icon: 'facebook', href: 'https://facebook.com' },
  { label: 'Twitter', icon: 'twitter', href: 'https://twitter.com' },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__top">
          {/* Brand + contact */}
          <div className="footer-brand">
            <Link to="/" className="footer-brand__logo">
              Aura<span>.</span>
            </Link>
            <p className="footer-brand__bio">
              Useful, well-made essentials for the home, desk and kitchen — chosen to last.
            </p>

            <ul className="footer-contact">
              <li>
                <Icon name="phone" />
                <a href="tel:+923001234567">+92 300 1234567</a>
              </li>
              <li>
                <Icon name="mail" />
                <a href="mailto:support@yourstore.com">support@yourstore.com</a>
              </li>
              <li>
                <Icon name="mapPin" />
                <span>Main Commercial Avenue, Block C, Lahore</span>
              </li>
            </ul>

            <div className="footer-social">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="footer-social__link"
                  aria-label={social.label}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon name={social.icon} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="footer-links">
            {navSections.map((section) => (
              <div key={section.title} className="footer-links__col">
                <h3>{section.title}</h3>
                <ul>
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.to}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter */}
          <div className="footer-newsletter">
            <h3>Stay in the loop</h3>
            <p>New arrivals, restocks and member-only offers, straight to your inbox.</p>
            <NewsletterForm variant="footer" source="footer" />
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>© {new Date().getFullYear()} Aura Storefront. All rights reserved.</p>
          <div className="footer-legal">
            <span className="footer-legal__secure">
              <Icon name="lock" />
              Secure payments by Stripe
            </span>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
