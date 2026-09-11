import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";
import AuthShell from "../components/AuthShell";
import PasswordInput from "../components/PasswordInput";
import Icon from "../components/Icon";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
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

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const data = await authService.signup(formData);

      setMessage(data.message || "Account created successfully!");

      setFormData({
        name: "",
        email: "",
        password: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="It takes less than a minute. Your cart and wishlist come with you."
      icon="user"
      footer={
        <p>
          Already have an account?{" "}
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
          <label className="ui-label" htmlFor="name">Full name</label>
          <input
            id="name"
            className="ui-input"
            type="text"
            name="name"
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />
        </div>

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
          <label className="ui-label" htmlFor="password">Password</label>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
            minLength="6"
            required
          />
          <span className="ui-hint">Use 6 or more characters.</span>
        </div>

        <button type="submit" className="ui-btn ui-btn--lg ui-btn--block" disabled={loading}>
          {loading ? (
            <>
              <span className="ui-spinner" aria-hidden="true" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>
    </AuthShell>
  );
}

export default Signup;
