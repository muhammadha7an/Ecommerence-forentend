import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import authService from "../services/authService";
import AuthShell from "../components/AuthShell";
import PasswordInput from "../components/PasswordInput";
import Icon from "../components/Icon";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const data = await authService.resetPassword(token, password);

      setMessage(data.message || "Password updated successfully!");

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a password you haven't used before. The reset link expires after 15 minutes."
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
          <Icon name="checkCircle" />
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
          <label className="ui-label" htmlFor="password">New password</label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            minLength="6"
            required
          />
        </div>

        <div className="ui-field">
          <label className="ui-label" htmlFor="confirmPassword">Confirm password</label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat the new password"
            minLength="6"
            required
          />
        </div>

        <button type="submit" className="ui-btn ui-btn--lg ui-btn--block" disabled={loading}>
          {loading ? (
            <>
              <span className="ui-spinner" aria-hidden="true" />
              Updating password...
            </>
          ) : (
            "Reset Password"
          )}
        </button>
      </form>
    </AuthShell>
  );
}

export default ResetPassword;
