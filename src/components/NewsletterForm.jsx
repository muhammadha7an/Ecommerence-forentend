import { useId, useState } from "react";
import authService from "../services/authService";
import Icon from "./Icon.jsx";
import "../style/components/newsletter.css";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/*
 * NewsletterForm — the ONLY newsletter subscription UI logic.
 * Used by the Home page section and the Footer, both calling
 * POST /api/subscribers through authService.subscribeNewsletter.
 *
 * variant: "feature" (large, Home page) | "footer" (compact, dark)
 */
function NewsletterForm({ variant = "feature", source = "website" }) {
  const inputId = useId();
  const messageId = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error | exists
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const value = email.trim().toLowerCase();

    if (!EMAIL_PATTERN.test(value)) {
      setStatus("error");
      setMessage("Enter a valid email address, like name@example.com.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const data = await authService.subscribeNewsletter(value, source);
      setStatus("success");
      setMessage(
        data.message ||
          (data.emailSent
            ? "You're subscribed. A confirmation email is on its way."
            : "You're subscribed.")
      );
      setEmail("");
    } catch (error) {
      const statusCode = error.response?.status;
      if (statusCode === 409) {
        setStatus("exists");
        setMessage(error.response?.data?.message || "This email is already subscribed.");
        return;
      }
      setStatus("error");
      setMessage(
        error.response?.data?.message ||
          "We couldn't subscribe you right now. Check your connection and try again."
      );
    }
  };

  const reset = () => {
    setStatus("idle");
    setMessage("");
  };

  const rootClass = `newsletter newsletter--${variant}`;

  if (status === "success") {
    return (
      <div className={rootClass}>
        <div className="newsletter__success" role="status">
          <span className="newsletter__success-icon">
            <Icon name="mailCheck" />
          </span>
          <div>
            <strong>Thanks for subscribing</strong>
            <p>{message}</p>
            <button type="button" className="newsletter__reset" onClick={reset}>
              Subscribe another email
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isLoading = status === "loading";
  const hasFeedback = status === "error" || status === "exists";

  return (
    <div className={rootClass}>
      <form className="newsletter__form" onSubmit={handleSubmit} noValidate>
        <label htmlFor={inputId} className="visually-hidden">
          Email address
        </label>
        <div className="newsletter__field">
          <Icon name="mail" className="newsletter__field-icon" />
          <input
            id={inputId}
            type="email"
            inputMode="email"
            autoComplete="email"
            className="newsletter__input"
            placeholder="Your email address"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (hasFeedback) reset();
            }}
            aria-invalid={status === "error"}
            aria-describedby={hasFeedback ? messageId : undefined}
            disabled={isLoading}
            required
          />
        </div>
        <button type="submit" className="newsletter__submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="ui-spinner" aria-hidden="true" />
              <span>Subscribing</span>
            </>
          ) : (
            <>
              <span>Subscribe</span>
              <Icon name="send" />
            </>
          )}
        </button>
      </form>

      {hasFeedback && (
        <p
          id={messageId}
          className={`newsletter__message ${status === "exists" ? "is-info" : "is-error"}`}
          role="alert"
        >
          <Icon name={status === "exists" ? "info" : "alertCircle"} />
          {message}
        </p>
      )}

      <p className="newsletter__note">New arrivals and store updates only. No spam.</p>
    </div>
  );
}

export default NewsletterForm;
