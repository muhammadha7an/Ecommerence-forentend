import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import authService from "../services/authService";

function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const [state, setState] = useState({ loading: Boolean(token), allowed: false });

  useEffect(() => {
    if (!token) return undefined;

    let active = true;
    authService.getMe()
      .then(({ user }) => {
        if (active) setState({ loading: false, allowed: user?.role === "admin" });
      })
      .catch(() => {
        authService.logout();
        if (active) setState({ loading: false, allowed: false });
      });
    return () => { active = false; };
  }, [token]);

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  if (state.loading) {
    return <div className="dashboard-page"><div className="dashboard-panel">Checking administrator access...</div></div>;
  }

  if (!state.allowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default AdminRoute;
