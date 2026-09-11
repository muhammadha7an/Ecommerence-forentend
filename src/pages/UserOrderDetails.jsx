import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import authService from "../services/authService";
import { getImageUrl } from "../services/api";
import Icon from "../components/Icon";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";

const progressSteps = [
  { key: "pending", label: "Placed", icon: "receipt" },
  { key: "processing", label: "Processing", icon: "package" },
  { key: "shipped", label: "Shipped", icon: "truck" },
  { key: "delivered", label: "Delivered", icon: "home" },
];

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
      <div className="console-page">
        <div className="ui-loading">
          <span className="ui-spinner ui-spinner--lg" aria-hidden="true"></span>
          <p>Loading order invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="console-page">
        <EmptyState
          icon="alertTriangle"
          title="Unable to load order"
          text={error || "Order not found or access denied."}
        >
          <Link className="ui-btn ui-btn--secondary" to="/dashboard/orders">
            <Icon name="arrowLeft" />
            Back to My Orders
          </Link>
        </EmptyState>
      </div>
    );
  }

  const statusKey = (order.orderStatus || "pending").toLowerCase();
  const isCancelled = statusKey === "cancelled";
  const currentStep = isCancelled ? -1 : progressSteps.findIndex((step) => step.key === statusKey);

  const subtotal = order.items?.reduce(
    (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
    0
  ) || 0;

  return (
    <div className="console-page">
      {/* Header */}
      <div className="console-head">
        <div>
          <span className="console-head__eyebrow">Order invoice</span>
          <h1>Order #{String(order._id).slice(-8).toUpperCase()}</h1>
          <p>
            Placed on {new Date(order.createdAt).toLocaleDateString()} at{" "}
            {new Date(order.createdAt).toLocaleTimeString()}
          </p>
        </div>

        <div className="console-head__actions">
          <Link className="ui-btn ui-btn--secondary" to="/dashboard/orders">
            <Icon name="arrowLeft" />
            Back to My Orders
          </Link>
        </div>
      </div>

      {/* Status strip */}
      <div className="console-status-strip">
        <div>
          <span className="console-muted">Order status</span>
          <StatusBadge status={order.orderStatus || "processing"} />
        </div>
        <div>
          <span className="console-muted">Payment status</span>
          <StatusBadge status={order.paymentStatus || "unpaid"} />
        </div>
        <div>
          <span className="console-muted">Stripe session</span>
          <span className="console-mono">
            {order.stripeSessionId ? `#${order.stripeSessionId.slice(-10)}` : "Direct Checkout"}
          </span>
        </div>
      </div>

      {/* Progress */}
      <section className="console-panel">
        {isCancelled ? (
          <div className="console-panel__body">
            <div className="ui-alert ui-alert--error">
              <Icon name="alertCircle" />
              <span>This order was cancelled. Contact support if you have questions about a refund.</span>
            </div>
          </div>
        ) : (
          <ol className="console-progress" aria-label="Order progress">
            {progressSteps.map((step, index) => {
              const done = currentStep >= index;
              return (
                <li
                  key={step.key}
                  className={`${done ? "is-done" : ""} ${currentStep === index ? "is-current" : ""}`.trim()}
                  aria-current={currentStep === index ? "step" : undefined}
                >
                  <span className="console-progress__dot">
                    <Icon name={done ? "check" : step.icon} />
                  </span>
                  {step.label}
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <div className="console-split">
        {/* Items */}
        <section className="console-panel">
          <div className="console-panel__head">
            <h2>Items ordered ({order.items?.length || 0})</h2>
          </div>

          <div className="console-panel__body">
            <ul className="console-line-items">
              {order.items?.map((item, index) => {
                const itemImg = getImageUrl(item.image);
                const lineTotal = (item.price || 0) * (item.quantity || 1);

                return (
                  <li className="console-line-item" key={`${item.id || item.name}-${index}`}>
                    <img
                      className="console-thumb"
                      src={itemImg}
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1544816155-12df9643f363?w=200&q=80";
                      }}
                    />

                    <div className="console-line-item__info">
                      <strong>{item.name}</strong>
                      <span className="console-muted">
                        ${(item.price || 0).toFixed(2)} × {item.quantity || 1}
                      </span>
                    </div>

                    <span className="console-line-item__total">${lineTotal.toFixed(2)}</span>
                  </li>
                );
              })}
            </ul>

            <div className="console-totals">
              <div className="console-totals__row">
                <span>Subtotal</span>
                <span>
                  {order.subtotalAmount !== null && order.subtotalAmount !== undefined
                    ? money(order.subtotalAmount, order.currency)
                    : `$${subtotal.toFixed(2)}`}
                </span>
              </div>
              <div className="console-totals__row">
                <span>{order.shippingMethod || "Shipping"}</span>
                {order.shippingFee === null || order.shippingFee === undefined ? (
                  <span className="console-muted" style={{ fontSize: "inherit" }}>Included</span>
                ) : Number(order.shippingFee) > 0 ? (
                  <span>{money(order.shippingFee, order.currency)}</span>
                ) : (
                  <span style={{ color: "var(--c-success)", fontWeight: 600 }}>FREE</span>
                )}
              </div>
              <div className="console-totals__row console-totals__row--total">
                <span>Total amount paid</span>
                <span>{money(order.totalAmount, order.currency)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Delivery */}
        <section className="console-panel">
          <div className="console-panel__head">
            <h2>Delivery &amp; customer</h2>
          </div>

          <div className="console-panel__body">
            <dl className="console-dl">
              <div>
                <dt>Customer name</dt>
                <dd><strong>{order.shippingDetails?.fullName || "Aura Customer"}</strong></dd>
              </div>

              <div>
                <dt>Email address</dt>
                <dd>{order.shippingDetails?.email || "Provided via Stripe"}</dd>
              </div>

              {order.shippingDetails?.phone && (
                <div>
                  <dt>Phone</dt>
                  <dd>{order.shippingDetails.phone}</dd>
                </div>
              )}

              <div>
                <dt>Shipping destination</dt>
                <dd>
                  {order.shippingDetails?.address ? (
                    <address>
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
                    "Address confirmed via Stripe payment gateway"
                  )}
                </dd>
              </div>
            </dl>

            <div className="console-note">
              <Icon name="shieldCheck" />
              <span>Encrypted transaction protected by our 30-day guarantee.</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default UserOrderDetails;
