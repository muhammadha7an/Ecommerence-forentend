import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";
import styles from "../style/AdminLogin.module.css";

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
    <div className={styles.pageContainer}>
      <form className={styles.loginCard} onSubmit={submit}>
        <span className={styles.welcomeBadge}>Aura Administration</span>
        <h1 className={styles.title}>Admin Sign In</h1>
        <p className={styles.description}>
          Use your administrator account to continue.
        </p>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.fieldGroup}>
          <label htmlFor="username" className={styles.label}>
            Username
          </label>
          <input
            id="username"
            className={styles.input}
            value={form.username}
            onChange={(event) =>
              setForm({ ...form, username: event.target.value })
            }
            required
            autoComplete="username"
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <input
            id="password"
            type="password"
            className={styles.input}
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
            required
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <Link to="/login" className={styles.switchLink}>
          Customer sign in
        </Link>
      </form>
    </div>
  );
}

export default AdminLogin;