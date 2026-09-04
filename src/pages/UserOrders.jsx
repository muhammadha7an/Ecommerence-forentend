import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";

const money = (amount, currency = "usd") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format((amount || 0) / 100);

function UserOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [state, setState] = useState({ loading: true, error: "" });

  useEffect(() => {
    authService.getOrders()
      .then((data) => setOrders(data.orders || []))
      .catch((error) => {
        if (error.response?.status === 401) {
          authService.logout();
          navigate("/login");
          return;
        }
        setState({ loading: false, error: error.response?.data?.message || "Unable to load orders" });
        return;
      })
      .finally(() => setState((current) => ({ ...current, loading: false })));
  }, [navigate]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div><span className="dashboard-welcome">Account</span><h1>My Orders</h1><p>Orders associated with your account.</p></div>
          <Link className="dashboard-outline-btn" to="/dashboard">Back to Dashboard</Link>
        </div>
        {state.loading && <div className="dashboard-panel">Loading your orders...</div>}
        {state.error && <div className="dashboard-panel dashboard-error">{state.error}</div>}
        {!state.loading && !state.error && orders.length === 0 && <div className="dashboard-panel"><h2>No orders yet</h2><p>Your completed checkouts will appear here.</p><Link className="dashboard-view-btn" to="/shop">Start shopping</Link></div>}
        {!state.loading && !state.error && orders.length > 0 && (
          <div className="dashboard-panel order-table-wrap">
            <table className="dashboard-table">
              <thead><tr><th>Order</th><th>Date</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th /></tr></thead>
              <tbody>{orders.map((order) => (
                <tr key={order._id}>
                  <td>#{String(order._id).slice(-8)}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{order.items?.reduce((total, item) => total + (item.quantity || 0), 0) || 0}</td>
                  <td>{money(order.totalAmount, order.currency)}</td>
                  <td>{order.paymentStatus || "unpaid"}</td>
                  <td><span className={`status-badge ${order.orderStatus}`}>{order.orderStatus || "pending"}</span></td>
                  <td><Link to={`/dashboard/orders/${order._id}`}>View</Link></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserOrders;
