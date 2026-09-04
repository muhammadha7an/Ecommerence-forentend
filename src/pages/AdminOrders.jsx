import { useEffect, useState } from "react";
import authService from "../services/authService";

const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
const money = (amount) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format((amount || 0) / 100);

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { authService.getAdminOrders().then((data) => setOrders(data.orders || [])).catch((requestError) => setError(requestError.response?.data?.message || "Unable to load orders")).finally(() => setLoading(false)); }, []);

  const updateStatus = async (id, orderStatus) => {
    try { await authService.updateAdminOrderStatus(id, orderStatus); setOrders((current) => current.map((order) => order._id === id ? { ...order, orderStatus } : order)); }
    catch (requestError) { setError(requestError.response?.data?.message || "Unable to update order"); }
  };

  return <div className="dashboard-page"><div className="dashboard-container"><div className="dashboard-header"><div><span className="dashboard-welcome">Admin panel</span><h1>Orders</h1><p>Review every customer order.</p></div></div>{error && <div className="dashboard-panel dashboard-error">{error}</div>}{loading ? <div className="dashboard-panel">Loading orders...</div> : <div className="dashboard-panel order-table-wrap"><table className="dashboard-table"><thead><tr><th>Order</th><th>Customer</th><th>Products</th><th>Date</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead><tbody>{orders.map((order) => <tr key={order._id}><td>#{String(order._id).slice(-8)}</td><td>{order.userId?.name || "Unknown"}<br /><small>{order.userId?.email}</small></td><td>{order.items?.map((item) => `${item.name} x${item.quantity}`).join(", ")}</td><td>{new Date(order.createdAt).toLocaleDateString()}</td><td>{money(order.totalAmount)}</td><td>{order.paymentStatus || "unpaid"}</td><td><select value={order.orderStatus || "pending"} onChange={(event) => updateStatus(order._id, event.target.value)}>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></td></tr>)}</tbody></table></div>}</div></div>;
}

export default AdminOrders;
