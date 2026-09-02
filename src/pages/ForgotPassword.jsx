import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";
 

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

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      const data = await authService.forgotPassword(email);

      setMessage(
        data.message ||
          "Password reset link has been sent to your email"
      );

      setEmail("");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to process password reset request"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <h1>Forgot Password</h1>
          <p>
            Enter your email address and we'll send you a link to reset
            your password.
          </p>
        </div>

        {/* Alert Banners */}
        {message && (
          <div className="alert-message success-message">
            {message}
          </div>
        )}

        {error && (
          <div className="alert-message error-message">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Sending Link..." : "Send Reset Link"}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <p>
            Remembered your password?{" "}
            <Link to="/login" className="auth-link highlight">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;