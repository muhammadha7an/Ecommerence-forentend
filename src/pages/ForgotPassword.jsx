import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";
import AuthShell from "../components/AuthShell";
import Icon from "../components/Icon";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      const data = await authService.forgotPassword(email.trim());

      // User exists
      setMessage(
        data.message || "Password reset link has been sent to your email"
      );

      setEmail("");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      // Backend response
      setError(
        err.response?.data?.message ||
          "Unable to process password reset request"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter the email you signed up with and we'll send you a secure link to reset it."
      icon="lock"
      footer={
        <p>
          Remembered your password?{" "}
          <Link to="/login" className="ui-link">
            Sign in
          </Link>
        </p>
      }
    >
      {message && (
        <div className="ui-alert ui-alert--success" role="status">
          <Icon name="mailCheck" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="ui-alert ui-alert--error" role="alert">
          <Icon name="alertCircle" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="ui-field">
          <label className="ui-label" htmlFor="email">Email address</label>
          <input
            id="email"
            className="ui-input"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
          />
        </div>

        <button type="submit" className="ui-btn ui-btn--lg ui-btn--block" disabled={loading}>
          {loading ? (
            <>
              <span className="ui-spinner" aria-hidden="true" />
              Sending link...
            </>
          ) : (
            "Send Reset Link"
          )}
        </button>
      </form>
    </AuthShell>
  );
}

export default ForgotPassword;
