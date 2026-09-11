import { Link } from "react-router-dom";
import Icon from "./Icon.jsx";
import "../style/pages/auth.css";

/*
 * AuthShell — shared layout for Login, Signup, Forgot/Reset Password and Admin Login.
 * Presentation only: every page keeps its own state, validation and API calls.
 */
function AuthShell({ title, subtitle, icon = "user", children, footer, variant = "customer" }) {
  const isAdmin = variant === "admin";

  return (
    <div className={`auth-page ${isAdmin ? "auth-page--admin" : ""}`}>
      <div className="auth-layout">
        <section className="auth-panel">
          {isAdmin && (
            <Link to="/" className="auth-panel__logo">
              Aura<span>.</span>
            </Link>
          )}

          <div className="auth-card">
            <div className="auth-card__head">
              <span className="auth-card__icon">
                <Icon name={icon} />
              </span>
              <h1>{title}</h1>
              {subtitle && <p>{subtitle}</p>}
            </div>

            {children}

            {footer && <div className="auth-card__footer">{footer}</div>}
          </div>
        </section>

        <aside className="auth-aside" aria-hidden="true">
          <img
            src={
              isAdmin
                ? "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000"
                : "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=1000"
            }
            alt=""
          />
          <div className="auth-aside__copy">
            {isAdmin ? (
              <>
                <strong>Aura Administration</strong>
                <p>Manage products, orders, customers and newsletter subscribers from one place.</p>
              </>
            ) : (
              <>
                <strong>Simple things, thoughtfully chosen.</strong>
                <ul>
                  <li><Icon name="package" /> Track every order in one place</li>
                  <li><Icon name="heart" /> Save favourites to your wishlist</li>
                  <li><Icon name="lock" /> Secure Stripe checkout</li>
                </ul>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default AuthShell;
