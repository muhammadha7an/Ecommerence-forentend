import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import authService from "../services/authService";

const money = (amount, currency = "usd") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format((amount || 0) / 100);

function UserOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    authService.getOrder(orderId)
      .then((data) => setOrder(data.order))
      .catch((requestError) => {
        if (requestError.response?.status === 401) {
          authService.logout();
          navigate("/login");
          return;
        }
        setError(requestError.response?.data?.message || "Order not found");
      });
  }, [navigate, orderId]);

  return (
    <div className="dashboard-page"><div className="dashboard-container">
      <div className="dashboard-header"><div><span className="dashboard-welcome">Order details</span><h1>{order ? `Order #${String(order._id).slice(-8)}` : "Loading..."}</h1></div><Link className="dashboard-outline-btn" to="/dashboard/orders">Back to orders</Link></div>
      {error && <div className="dashboard-panel dashboard-error">{error}</div>}
      {order && <div className="dashboard-panel"><div className="dashboard-order-meta"><span>Status: {order.orderStatus}</span><span>Payment: {order.paymentStatus}</span><span>{new Date(order.createdAt).toLocaleDateString()}</span></div><div className="dashboard-items">{order.items?.map((item, index) => <div className="dashboard-item" key={`${item.id || item.name}-${index}`}><span>{item.name} x {item.quantity}</span><strong>{money((item.price || 0) * (item.quantity || 0) * 100, order.currency)}</strong></div>)}</div><div className="dashboard-total">Total <strong>{money(order.totalAmount, order.currency)}</strong></div>{order.shippingDetails?.address && <div><h2>Shipping information</h2><p>{order.shippingDetails.fullName}<br />{Object.values(order.shippingDetails.address).filter(Boolean).join(", ")}</p></div>}</div>}
    </div></div>
  );
}

export default UserOrderDetails;
