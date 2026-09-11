import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";
import AuthShell from "../components/AuthShell";
import PasswordInput from "../components/PasswordInput";
import Icon from "../components/Icon";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await authService.login(formData);
      navigate("/account");
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to track orders, manage your wishlist and check out faster."
      icon="user"
      footer={
        <p>
          Don't have an account?{" "}
          <Link to="/signup" className="ui-link">
            Create Account
          </Link>
        </p>
      }
    >
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
            value={formData.email}
            onChange={handleChange}
            placeholder="name@example.com"
            required
          />
        </div>

        <div className="ui-field">
          <div className="ui-label">
            <label htmlFor="password">Password</label>
            <Link to="/forgot-password" className="ui-link">
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
        </div>

        <button type="submit" className="ui-btn ui-btn--lg ui-btn--block" disabled={loading}>
          {loading ? (
            <>
              <span className="ui-spinner" aria-hidden="true" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>
    </AuthShell>
  );
}

export default Login;
