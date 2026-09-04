import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";

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
      setError(requestError.response?.data?.message || requestError.message || "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  return <div className="admin-login-page"><form className="admin-login-card" onSubmit={submit}><span className="dashboard-welcome">Aura administration</span><h1>Admin sign in</h1><p>Use your administrator account to continue.</p>{error && <div className="dashboard-error">{error}</div>}<label>Username<input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} required autoComplete="username" /></label><label>Password<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required autoComplete="current-password" /></label><button className="dashboard-view-btn" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button><Link to="/login">Customer sign in</Link></form></div>;
}

export default AdminLogin;
