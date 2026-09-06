import { useEffect, useState, useMemo, useCallback } from "react";
import authService from "../services/authService";
import { getImageUrl } from "../services/api";

const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
const money = (amount) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    (amount || 0) / 100
  );

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await authService.getAdminOrders();
      setOrders(data.orders || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load customer orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const updateStatus = async (id, orderStatus) => {
    setUpdatingId(id);
    try {
      await authService.updateAdminOrderStatus(id, orderStatus);
      setOrders((current) =>
        current.map((order) =>
          order._id === id ? { ...order, orderStatus } : order
        )
      );
      if (selectedOrder?._id === id) {
        setSelectedOrder((prev) => ({ ...prev, orderStatus }));
      }
    } catch (requestError) {
      alert(requestError.response?.data?.message || "Unable to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const statusMatch =
        statusFilter === "all" ||
        (order.orderStatus || "").toLowerCase() === statusFilter.toLowerCase();

      const q = search.trim().toLowerCase();
      if (!q) return statusMatch;

      const idMatch = String(order._id).toLowerCase().includes(q);
      const nameMatch = order.userId?.name?.toLowerCase().includes(q);
      const emailMatch = order.userId?.email?.toLowerCase().includes(q);
      const shippingName = order.shippingDetails?.fullName?.toLowerCase().includes(q);

      return statusMatch && (idMatch || nameMatch || emailMatch || shippingName);
    });
  }, [orders, statusFilter, search]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <span className="dashboard-welcome">Order Management</span>
            <h1>Customer Orders ({orders.length})</h1>
            <p>Review transactions, shipping information, and update fulfillment states</p>
          </div>

          <div className="dashboard-actions">
            <button className="dashboard-outline-btn" onClick={loadOrders}>
              Refresh Orders
            </button>
          </div>
        </div>

        {error && <div className="dashboard-panel dashboard-error">{error}</div>}

        {/* Toolbar */}
        <div className="admin-toolbar-row">
          <div className="admin-search-input">
            <input
              type="text"
              placeholder="Search by customer, email, or order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="admin-filter-dropdowns">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="dashboard-loading">
            <div className="dashboard-spinner"></div>
            <p>Loading orders from database...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="dashboard-empty-panel">
            <div className="dashboard-empty-icon">📦</div>
            <h2>No orders match criteria</h2>
            <p>Try resetting the search filter or status dropdown.</p>
          </div>
        ) : (
          <div className="dashboard-panel order-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Fulfillment Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const customerName =
                    order.userId?.name || order.shippingDetails?.fullName || "Guest";
                  const customerEmail =
                    order.userId?.email || order.shippingDetails?.email || "";

                  return (
                    <tr key={order._id}>
                      <td>
                        <strong>#{String(order._id).slice(-8)}</strong>
                      </td>
                      <td>
                        <strong>{customerName}</strong>
                        {customerEmail && (
                          <>
                            <br />
                            <small className="text-muted">{customerEmail}</small>
                          </>
                        )}
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>{order.items?.length || 0} product(s)</td>
                      <td>
                        <strong>{money(order.totalAmount)}</strong>
                      </td>
                      <td>
                        <span
                          className={`payment-pill ${order.paymentStatus || "unpaid"}`}
                        >
                          {order.paymentStatus || "unpaid"}
                        </span>
                      </td>
                      <td>
                        <select
                          className="status-selector"
                          value={order.orderStatus || "pending"}
                          disabled={updatingId === order._id}
                          onChange={(e) => updateStatus(order._id, e.target.value)}
                        >
                          {statuses.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="table-action-btn"
                          onClick={() => setSelectedOrder(order)}
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Detailed Order Modal */}
        {selectedOrder && (
          <div className="modal-backdrop">
            <div className="modal-card order-modal-card">
              <div className="modal-header">
                <div>
                  <span className="dashboard-welcome">Order Invoice Details</span>
                  <h3>Order #{String(selectedOrder._id).slice(-8)}</h3>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setSelectedOrder(null)}
                >
                  ✕
                </button>
              </div>

              <div className="order-modal-body">
                {/* Meta details */}
                <div className="order-details-status-strip">
                  <div>
                    <span className="strip-label">Customer</span>
                    <strong>
                      {selectedOrder.userId?.name ||
                        selectedOrder.shippingDetails?.fullName ||
                        "Customer"}
                    </strong>
                  </div>
                  <div>
                    <span className="strip-label">Payment</span>
                    <span
                      className={`payment-pill ${
                        selectedOrder.paymentStatus || "unpaid"
                      }`}
                    >
                      {selectedOrder.paymentStatus || "unpaid"}
                    </span>
                  </div>
                  <div>
                    <span className="strip-label">Status</span>
                    <span
                      className={`status-badge ${
                        selectedOrder.orderStatus || "pending"
                      }`}
                    >
                      {selectedOrder.orderStatus || "pending"}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <h4 className="subheading" style={{ marginTop: "16px" }}>
                  Ordered Items ({selectedOrder.items?.length || 0})
                </h4>
                <div className="order-items-list compact">
                  {selectedOrder.items?.map((item, idx) => (
                    <div className="order-item-row" key={idx}>
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="order-item-thumb mini"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1544816155-12df9643f363?w=100&q=80";
                        }}
                      />
                      <div className="order-item-details">
                        <strong>{item.name}</strong>
                        <small className="text-muted">
                          Qty: {item.quantity} × ${(item.price || 0).toFixed(2)}
                        </small>
                      </div>
                      <div className="order-item-total">
                        <strong>
                          ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping address */}
                {selectedOrder.shippingDetails?.address && (
                  <div className="delivery-info-section" style={{ marginTop: "16px" }}>
                    <span className="delivery-label">Shipping Destination</span>
                    <p className="order-address">
                      {selectedOrder.shippingDetails.fullName}
                      <br />
                      {Object.values(selectedOrder.shippingDetails.address)
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                )}

                <div className="order-modal-footer">
                  <div className="order-modal-total">
                    <span>Total Order Amount:</span>
                    <strong>{money(selectedOrder.totalAmount)}</strong>
                  </div>

                  <div className="order-modal-status-update">
                    <label>Change Status:</label>
                    <select
                      className="status-selector"
                      value={selectedOrder.orderStatus || "pending"}
                      onChange={(e) =>
                        updateStatus(selectedOrder._id, e.target.value)
                      }
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="dashboard-view-btn"
                  onClick={() => setSelectedOrder(null)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrders;
