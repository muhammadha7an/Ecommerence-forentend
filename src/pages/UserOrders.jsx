import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";

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

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <span className="dashboard-welcome">Account Area</span>
            <h1>My Order History</h1>
            <p>View all past orders, delivery progress, and detailed invoices.</p>
          </div>
          <Link className="dashboard-outline-btn" to="/dashboard">
            Back to Dashboard
          </Link>
        </div>

        {/* Filters and search bar */}
        <div className="dashboard-filter-bar">
          <div className="tab-pills">
            <button
              className={`tab-pill ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All ({orders.length})
            </button>
            <button
              className={`tab-pill ${activeTab === "pending" ? "active" : ""}`}
              onClick={() => setActiveTab("pending")}
            >
              In Progress
            </button>
            <button
              className={`tab-pill ${activeTab === "shipped" ? "active" : ""}`}
              onClick={() => setActiveTab("shipped")}
            >
              Shipped
            </button>
            <button
              className={`tab-pill ${activeTab === "delivered" ? "active" : ""}`}
              onClick={() => setActiveTab("delivered")}
            >
              Delivered
            </button>
          </div>

          <div className="dashboard-search-box">
            <input
              type="text"
              placeholder="Search by order # or product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading && (
          <div className="dashboard-loading">
            <div className="dashboard-spinner"></div>
            <p>Loading your orders...</p>
          </div>
        )}

        {error && <div className="dashboard-panel dashboard-error">{error}</div>}

        {!loading && !error && filteredOrders.length === 0 && (
          <div className="dashboard-empty-panel">
            <div className="dashboard-empty-icon">📦</div>
            <h2>No orders found</h2>
            <p>
              {orders.length === 0
                ? "You haven't made any purchases yet."
                : "No orders match your search or filter."}
            </p>
            <Link className="dashboard-view-btn" to="/shop">
              Browse Collection
            </Link>
          </div>
        )}

        {!loading && !error && filteredOrders.length > 0 && (
          <div className="dashboard-panel order-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Placed On</th>
                  <th>Products</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Shipping Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const itemsCount =
                    order.items?.reduce(
                      (sum, item) => sum + (item.quantity || 1),
                      0
                    ) || 0;
                  const statusClass = (order.orderStatus || "pending")
                    .toLowerCase()
                    .replace(/\s+/g, "-");

                  return (
                    <tr key={order._id}>
                      <td>
                        <strong>#{String(order._id).slice(-8)}</strong>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>
                        {itemsCount} {itemsCount === 1 ? "item" : "items"}
                      </td>
                      <td>
                        <strong>
                          {money(order.totalAmount, order.currency)}
                        </strong>
                      </td>
                      <td>
                        <span
                          className={`payment-pill ${order.paymentStatus || "unpaid"}`}
                        >
                          {order.paymentStatus || "unpaid"}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${statusClass}`}>
                          {order.orderStatus || "pending"}
                        </span>
                      </td>
                      <td>
                        <Link
                          className="table-action-link"
                          to={`/dashboard/orders/${order._id}`}
                        >
                          View Details →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserOrders;
