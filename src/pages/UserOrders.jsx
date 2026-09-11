import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";
import Icon from "../components/Icon";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";

const money = (amount, currency = "usd") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (currency || "usd").toUpperCase(),
  }).format((amount || 0) / 100);

function UserOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let isMounted = true;
    authService
      .getOrders()
      .then((data) => {
        if (isMounted) {
          setOrders(data.orders || []);
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
          setError(err.response?.data?.message || "Unable to load your orders");
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
  }, [navigate]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const status = (order.orderStatus || "").toLowerCase();
      let tabMatch = true;
      if (activeTab === "pending") {
        tabMatch = status === "pending" || status === "processing";
      } else if (activeTab === "shipped") {
        tabMatch = status === "shipped";
      } else if (activeTab === "delivered") {
        tabMatch = status === "delivered";
      } else if (activeTab === "cancelled") {
        tabMatch = status === "cancelled";
      }

      const query = search.trim().toLowerCase();
      const idMatch = !query || String(order._id).toLowerCase().includes(query);
      const itemMatch =
        !query ||
        order.items?.some((i) => i.name?.toLowerCase().includes(query));

      return tabMatch && (idMatch || itemMatch);
    });
  }, [orders, activeTab, search]);

  const countFor = (tab) =>
    orders.filter((order) => {
      const status = (order.orderStatus || "").toLowerCase();
      if (tab === "pending") return status === "pending" || status === "processing";
      return status === tab;
    }).length;

  const tabs = [
    { key: "all", label: "All", count: orders.length },
    { key: "pending", label: "In Progress", count: countFor("pending") },
    { key: "shipped", label: "Shipped", count: countFor("shipped") },
    { key: "delivered", label: "Delivered", count: countFor("delivered") },
  ];

  return (
    <div className="console-page">
      {/* Header */}
      <div className="console-head">
        <div>
          <span className="console-head__eyebrow">Account area</span>
          <h1>My order history</h1>
          <p>View past orders, delivery progress and detailed invoices.</p>
        </div>
        <div className="console-head__actions">
          <Link className="ui-btn ui-btn--secondary" to="/dashboard">
            <Icon name="arrowLeft" />
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Tabs + search */}
      <div className="console-toolbar">
        <div className="console-tabs" role="tablist" aria-label="Filter orders by status">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              className={`console-tab ${activeTab === tab.key ? "is-active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              <span className="console-tab__count">{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="console-toolbar__spacer" />

        <label className="ui-input-icon" style={{ maxWidth: 340 }}>
          <Icon name="search" />
          <span className="visually-hidden">Search orders</span>
          <input
            type="search"
            className="ui-input ui-input--sm"
            placeholder="Search by order # or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      {loading && (
        <div className="console-panel">
          <div className="ui-loading">
            <span className="ui-spinner ui-spinner--lg" aria-hidden="true"></span>
            <p>Loading your orders...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="ui-alert ui-alert--error" role="alert">
          <Icon name="alertCircle" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && filteredOrders.length === 0 && (
        <EmptyState
          icon="package"
          title="No orders found"
          text={
            orders.length === 0
              ? "You haven't made any purchases yet."
              : "No orders match your search or filter."
          }
        >
          <Link className="ui-btn" to="/shop">
            Browse Collection
          </Link>
        </EmptyState>
      )}

      {!loading && !error && filteredOrders.length > 0 && (
        <div className="console-panel">
          <div className="console-table-wrap">
            <table className="console-table console-table--stack">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Placed on</th>
                  <th>Products</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Shipping status</th>
                  <th className="is-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const itemsCount =
                    order.items?.reduce(
                      (sum, item) => sum + (item.quantity || 1),
                      0
                    ) || 0;

                  return (
                    <tr key={order._id}>
                      <td className="is-primary" data-label="Order">
                        <div className="console-cell__stack">
                          <span className="console-mono">#{String(order._id).slice(-8).toUpperCase()}</span>
                          {order.items?.[0]?.name && (
                            <span className="console-muted">
                              {order.items[0].name}
                              {order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}
                            </span>
                          )}
                        </div>
                      </td>
                      <td data-label="Placed on">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td data-label="Products">
                        {itemsCount} {itemsCount === 1 ? "item" : "items"}
                      </td>
                      <td data-label="Amount" className="is-num">
                        <strong>{money(order.totalAmount, order.currency)}</strong>
                      </td>
                      <td data-label="Payment">
                        <StatusBadge status={order.paymentStatus || "unpaid"} />
                      </td>
                      <td data-label="Status">
                        <StatusBadge status={order.orderStatus || "pending"} />
                      </td>
                      <td data-label="" className="is-right">
                        <Link className="ui-btn ui-btn--secondary ui-btn--sm" to={`/dashboard/orders/${order._id}`}>
                          View Details
                          <Icon name="chevronRight" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserOrders;
