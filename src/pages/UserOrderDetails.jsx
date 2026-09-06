import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import authService from "../services/authService";
import { getImageUrl } from "../services/api";

const money = (amount, currency = "usd") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (currency || "usd").toUpperCase(),
  }).format((amount || 0) / 100);

function UserOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    authService
      .getOrder(orderId)
      .then((data) => {
        if (isMounted) {
          setOrder(data.order);
          setError("");
        }
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          authService.logout();
          navigate("/login");
          return;
        }
        if (isMounted) {
          setError(err.response?.data?.message || "Order could not be found");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [navigate, orderId]);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="dashboard-spinner"></div>
          <p>Loading order invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="dashboard-panel dashboard-error">
            <h2>Unable to load order</h2>
            <p>{error || "Order not found or access denied."}</p>
            <Link className="dashboard-outline-btn" to="/dashboard/orders">
              Back to My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusClass = (order.orderStatus || "pending")
    .toLowerCase()
    .replace(/\s+/g, "-");

  const subtotal = order.items?.reduce(
    (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
    0
  ) || 0;

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <span className="dashboard-welcome">Order Invoice</span>
            <h1>Order #{String(order._id).slice(-8)}</h1>
            <p>Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
          </div>

          <div className="dashboard-actions">
            <Link className="dashboard-outline-btn" to="/dashboard/orders">
              ← Back to My Orders
            </Link>
          </div>
        </div>

        {/* Order Status Banner */}
        <div className="order-details-status-strip">
          <div className="status-strip-col">
            <span className="strip-label">Order Status</span>
            <span className={`status-badge ${statusClass}`}>
              {order.orderStatus || "Processing"}
            </span>
          </div>

          <div className="status-strip-col">
            <span className="strip-label">Payment Status</span>
            <span className={`payment-pill ${order.paymentStatus || "unpaid"}`}>
              {order.paymentStatus || "unpaid"}
            </span>
          </div>

          <div className="status-strip-col">
            <span className="strip-label">Stripe Session</span>
            <span className="strip-code">{order.stripeSessionId ? `#${order.stripeSessionId.slice(-10)}` : "Direct Checkout"}</span>
          </div>
        </div>

        <div className="order-details-layout">
          {/* Left Column: Products in order */}
          <div className="order-details-main">
            <div className="dashboard-panel">
              <h2 className="panel-title">Items Ordered ({order.items?.length || 0})</h2>

              <div className="order-items-list">
                {order.items?.map((item, index) => {
                  const itemImg = getImageUrl(item.image);
                  const lineTotal = (item.price || 0) * (item.quantity || 1);

                  return (
                    <div className="order-item-row" key={`${item.id || item.name}-${index}`}>
                      <div className="order-item-thumb">
                        <img
                          src={itemImg}
                          alt={item.name}
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1544816155-12df9643f363?w=200&q=80";
                          }}
                        />
                      </div>

                      <div className="order-item-details">
                        <h3 className="order-item-name">{item.name}</h3>
                        <p className="order-item-pricing">
                          ${(item.price || 0).toFixed(2)} × {item.quantity || 1}
                        </p>
                      </div>

                      <div className="order-item-total">
                        <strong>${lineTotal.toFixed(2)}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cost summary table */}
              <div className="order-cost-breakdown">
                <div className="cost-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="cost-row">
                  <span>Shipping</span>
                  <span className="text-success">Free Standard Delivery</span>
                </div>
                <hr className="cost-divider" />
                <div className="cost-row total-row">
                  <span>Total Amount Paid</span>
                  <strong>{money(order.totalAmount, order.currency)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Customer & Delivery information */}
          <div className="order-details-sidebar">
            <div className="dashboard-panel">
              <h2 className="panel-title">Delivery & Customer</h2>

              <div className="delivery-info-section">
                <span className="delivery-label">Customer Name</span>
                <strong>
                  {order.shippingDetails?.fullName || "Aura Customer"}
                </strong>
              </div>

              <div className="delivery-info-section">
                <span className="delivery-label">Email Address</span>
                <span>{order.shippingDetails?.email || "Provided via Stripe"}</span>
              </div>

              {order.shippingDetails?.phone && (
                <div className="delivery-info-section">
                  <span className="delivery-label">Phone</span>
                  <span>{order.shippingDetails.phone}</span>
                </div>
              )}

              <div className="delivery-info-section">
                <span className="delivery-label">Shipping Destination</span>
                {order.shippingDetails?.address ? (
                  <address className="order-address">
                    {order.shippingDetails.address.line1 && (
                      <div>{order.shippingDetails.address.line1}</div>
                    )}
                    {order.shippingDetails.address.line2 && (
                      <div>{order.shippingDetails.address.line2}</div>
                    )}
                    <div>
                      {[
                        order.shippingDetails.address.city,
                        order.shippingDetails.address.state,
                        order.shippingDetails.address.postal_code,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                    {order.shippingDetails.address.country && (
                      <div>{order.shippingDetails.address.country}</div>
                    )}
                  </address>
                ) : (
                  <p className="order-address">Address confirmed via Stripe payment gateway</p>
                )}
              </div>

              <div className="delivery-guarantee-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <span>Encrypted transaction protected by 30-Day Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserOrderDetails;
