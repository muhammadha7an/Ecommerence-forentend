import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";
import AuthShell from "../components/AuthShell";
import PasswordInput from "../components/PasswordInput";
import Icon from "../components/Icon";

function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await authService.adminLogin(form);
      if (result.user?.role !== "admin") {
        throw new Error("Administrator access required");
      }
      navigate("/admin/dashboard", { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to sign in"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      variant="admin"
      title="Admin sign in"
      subtitle="Use your administrator account to continue."
      icon="shieldCheck"
      footer={
        <p>
          Not an administrator?{" "}
          <Link to="/login" className="ui-link">
            Customer sign in
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

      <form className="auth-form" onSubmit={submit}>
        <div className="ui-field">
          <label htmlFor="username" className="ui-label">
            Username
          </label>
          <div className="ui-input-icon">
            <Icon name="user" />
            <input
              id="username"
              className="ui-input"
              value={form.username}
              onChange={(event) =>
                setForm({ ...form, username: event.target.value })
              }
              required
              autoComplete="username"
            />
          </div>
        </div>

        <div className="ui-field">
          <label htmlFor="password" className="ui-label">
            Password
          </label>
          <PasswordInput
            id="password"
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
            required
            autoComplete="current-password"
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

export default AdminLogin;
