import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";

const money = (amount) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format((amount || 0) / 100);
const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [overview, userData, orderData] = await Promise.all([
        authService.getAdminOverview(),
        authService.getAdminUsers(search),
        authService.getAdminOrders(),
      ]);
      setStats(overview.stats);
      setUsers(userData.users || []);
      setOrders(orderData.orders || []);
    } catch (requestError) {
      if (requestError.response?.status === 401) { authService.logout(); navigate("/login"); return; }
      setError(requestError.response?.data?.message || "Unable to load admin data");
    }
  }, [navigate, search]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    try {
      await authService.updateAdminOrderStatus(id, status);
      setOrders((current) => current.map((order) => order._id === id ? { ...order, orderStatus: status } : order));
    } catch (requestError) { setError(requestError.response?.data?.message || "Unable to update order"); }
  };

  const logout = () => { authService.logout(); navigate("/login"); };

  return <div className="dashboard-page"><div className="dashboard-container">
    <div className="dashboard-header"><div><span className="dashboard-welcome">Administration</span><h1>Store Dashboard</h1><p>Live figures from MongoDB.</p></div><div className="dashboard-actions"><Link className="dashboard-outline-btn" to="/account">Account</Link><button className="dashboard-logout-btn" onClick={logout}>Logout</button></div></div>
    {error && <div className="dashboard-panel dashboard-error">{error}</div>}
    <div className="dashboard-stats">{[["Users", stats?.totalUsers], ["Orders", stats?.totalOrders], ["Earnings", money(stats?.totalEarnings)], ["Pending", stats?.pendingOrders], ["Completed", stats?.completedOrders]].map(([label, value]) => <div className="dashboard-stat-card" key={label}><span>{label}</span><strong>{value ?? "-"}</strong></div>)}</div>
    <section className="dashboard-section"><div className="dashboard-section-heading"><div><h2>Users</h2><p>Registered customer accounts.</p></div><form onSubmit={(event) => { event.preventDefault(); load(); }}><input aria-label="Search users" placeholder="Search name or email" value={search} onChange={(event) => setSearch(event.target.value)} /></form></div><div className="dashboard-panel order-table-wrap"><table className="dashboard-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td>{user.name}</td><td>{user.email}</td><td>{user.role}</td><td>{new Date(user.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div></section>
    <section className="dashboard-section"><div className="dashboard-section-heading"><div><h2>Orders</h2><p>Review and update order status.</p></div></div><div className="dashboard-panel order-table-wrap"><table className="dashboard-table"><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr></thead><tbody>{orders.map((order) => <tr key={order._id}><td>#{String(order._id).slice(-8)}</td><td>{order.userId?.name || "Unknown"}<br /><small>{order.userId?.email}</small></td><td>{new Date(order.createdAt).toLocaleDateString()}</td><td>{money(order.totalAmount)}</td><td><select value={order.orderStatus || "pending"} onChange={(event) => updateStatus(order._id, event.target.value)}>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></td></tr>)}</tbody></table></div></section>
  </div></div>;
}

export default AdminDashboard;
