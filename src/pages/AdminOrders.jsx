import { useEffect, useState, useMemo, useCallback } from "react";
import authService from "../services/authService";
import { getImageUrl } from "../services/api";
import Icon from "../components/Icon";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";

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
  const [actionError, setActionError] = useState("");

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
    setActionError("");
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
      setActionError(requestError.response?.data?.message || "Unable to update order status");
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

  const statusCounts = statuses.reduce((acc, s) => {
    acc[s] = orders.filter((order) => (order.orderStatus || "").toLowerCase() === s).length;
    return acc;
  }, {});

  const formatAddress = (address) => {
    if (!address) return "";
    if (typeof address === "string") return address;
    return [address.line1, address.line2, address.city, address.state, address.postal_code, address.country]
      .filter(Boolean)
      .join(", ");
  };

  return (
    <div className="console-page">
      {/* Header */}
      <div className="console-head">
        <div>
          <span className="console-head__eyebrow">Order management</span>
          <h1>
            Customer orders <span className="console-count">{orders.length}</span>
          </h1>
          <p>Review transactions and shipping details, and update fulfillment status.</p>
        </div>

        <div className="console-head__actions">
          <button type="button" className="ui-btn ui-btn--secondary" onClick={loadOrders}>
            <Icon name="refresh" />
            Refresh Orders
          </button>
        </div>
      </div>

      {error && (
        <div className="ui-alert ui-alert--error" role="alert">
          <Icon name="alertCircle" />
          <span>{error}</span>
        </div>
      )}
      {actionError && (
        <div className="ui-alert ui-alert--error" role="alert">
          <Icon name="alertCircle" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Status tabs */}
      <div className="console-tabs" role="tablist" aria-label="Filter by status">
        <button
          type="button"
          role="tab"
          aria-selected={statusFilter === "all"}
          className={`console-tab ${statusFilter === "all" ? "is-active" : ""}`}
          onClick={() => setStatusFilter("all")}
        >
          All <span className="console-tab__count">{orders.length}</span>
        </button>
        {statuses.map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={statusFilter === s}
            className={`console-tab ${statusFilter === s ? "is-active" : ""}`}
            onClick={() => setStatusFilter(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            <span className="console-tab__count">{statusCounts[s]}</span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="console-toolbar">
        <label className="ui-input-icon">
          <Icon name="search" />
          <span className="visually-hidden">Search orders</span>
          <input
            type="search"
            className="ui-input"
            placeholder="Search by customer, email or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <select
          className="ui-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="all">All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="console-panel">
          <div className="ui-loading">
            <span className="ui-spinner ui-spinner--lg" aria-hidden="true"></span>
            <p>Loading orders from database...</p>
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon="package"
          title="No orders match these filters"
          text="Try clearing the search or choosing a different status."
        >
          {(search || statusFilter !== "all") && (
            <button
              type="button"
              className="ui-btn ui-btn--secondary"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
            >
              Clear filters
            </button>
          )}
        </EmptyState>
      ) : (
        <div className="console-panel">
          <div className="console-table-wrap">
            <table className="console-table console-table--stack">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Fulfillment</th>
                  <th className="is-right">Details</th>
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
                      <td className="is-primary" data-label="Order">
                        <span className="console-mono">#{String(order._id).slice(-8).toUpperCase()}</span>
                      </td>
                      <td data-label="Customer">
                        <div className="console-cell__stack">
                          <strong>{customerName}</strong>
                          {customerEmail && <span className="console-muted">{customerEmail}</span>}
                        </div>
                      </td>
                      <td data-label="Date">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td data-label="Items">{order.items?.length || 0} product(s)</td>
                      <td data-label="Total" className="is-num">
                        <strong>{money(order.totalAmount)}</strong>
                      </td>
                      <td data-label="Payment">
                        <StatusBadge status={order.paymentStatus || "unpaid"} />
                      </td>
                      <td data-label="Fulfillment">
                        <select
                          className="ui-select ui-select--sm console-status-select"
                          value={order.orderStatus || "pending"}
                          disabled={updatingId === order._id}
                          onChange={(e) => updateStatus(order._id, e.target.value)}
                          aria-label={`Change status for order ${String(order._id).slice(-8)}`}
                        >
                          {statuses.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td data-label="" className="is-right">
                        <button
                          type="button"
                          className="ui-btn ui-btn--secondary ui-btn--sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Icon name="eye" />
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order details modal */}
      {selectedOrder && (
        <Modal
          size="lg"
          title={`Order #${String(selectedOrder._id).slice(-8).toUpperCase()}`}
          subtitle={`Placed ${new Date(selectedOrder.createdAt).toLocaleString()}`}
          onClose={() => setSelectedOrder(null)}
          footer={
            <button
              type="button"
              className="ui-btn"
              onClick={() => setSelectedOrder(null)}
            >
              Done
            </button>
          }
        >
          <div className="console-status-strip">
            <div>
              <span className="console-muted">Customer</span>
              <strong>
                {selectedOrder.userId?.name ||
                  selectedOrder.shippingDetails?.fullName ||
                  "Customer"}
              </strong>
            </div>
            <div>
              <span className="console-muted">Payment</span>
              <StatusBadge status={selectedOrder.paymentStatus || "unpaid"} />
            </div>
            <div>
              <span className="console-muted">Status</span>
              <StatusBadge status={selectedOrder.orderStatus || "pending"} />
            </div>
          </div>

          <div>
            <h4 className="console-subhead" style={{ marginTop: 0, paddingTop: 0, border: 0 }}>
              Ordered items ({selectedOrder.items?.length || 0})
            </h4>
            <ul className="console-line-items">
              {selectedOrder.items?.map((item, idx) => (
                <li className="console-line-item" key={idx}>
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className="console-thumb"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1544816155-12df9643f363?w=100&q=80";
                    }}
                  />
                  <div className="console-line-item__info">
                    <strong>{item.name}</strong>
                    <span className="console-muted">
                      Qty: {item.quantity} × ${(item.price || 0).toFixed(2)}
                    </span>
                  </div>
                  <span className="console-line-item__total">
                    ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {selectedOrder.shippingDetails?.address && (
            <dl className="console-dl">
              <div>
                <dt>Shipping destination</dt>
                <dd>
                  {selectedOrder.shippingDetails.fullName}
                  <br />
                  {formatAddress(selectedOrder.shippingDetails.address)}
                </dd>
              </div>
            </dl>
          )}

          {selectedOrder.inventoryIssues?.length > 0 && (
            <div className="ui-alert ui-alert--warning" role="status">
              <Icon name="alertTriangle" />
              <span>
                Stock ran out while this order was being paid:{" "}
                {selectedOrder.inventoryIssues
                  .map((issue) => `${issue.name} (ordered ${issue.requested}, ${issue.available} were left)`)
                  .join("; ")}
                . Please contact the customer.
              </span>
            </div>
          )}

          <div className="console-totals" style={{ paddingTop: 0 }}>
            {selectedOrder.subtotalAmount !== null && selectedOrder.subtotalAmount !== undefined && (
              <>
                <div className="console-totals__row">
                  <span>Subtotal</span>
                  <span>{money(selectedOrder.subtotalAmount)}</span>
                </div>
                <div className="console-totals__row">
                  <span>{selectedOrder.shippingMethod || "Shipping"}</span>
                  <span>{Number(selectedOrder.shippingFee || 0) > 0 ? money(selectedOrder.shippingFee) : "FREE"}</span>
                </div>
              </>
            )}
            <div className="console-totals__row console-totals__row--total">
              <span>Total order amount</span>
              <span>{money(selectedOrder.totalAmount)}</span>
            </div>
          </div>

          <div className="ui-field">
            <label className="ui-label" htmlFor="modal-status">Change status</label>
            <select
              id="modal-status"
              className="ui-select console-status-select"
              value={selectedOrder.orderStatus || "pending"}
              disabled={updatingId === selectedOrder._id}
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
        </Modal>
      )}
    </div>
  );
}

export default AdminOrders;
