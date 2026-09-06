import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import authService from "../services/authService";

function UserDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const cartItems = useSelector((state) => state.cart.items || []);
  const wishlistItems = useSelector((state) => state.wishlist.items || []);

  const totalCartCount = cartItems.reduce((acc, i) => acc + (i.quantity || 1), 0);
  const totalWishlistCount = wishlistItems.length;

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        const [userData, ordersData] = await Promise.all([
          authService.getMe(),
          authService.getOrders(),
        ]);

        if (isMounted) {
          setUser(userData.user);
          setOrders(ordersData.orders || []);
        }
      } catch (error) {
        console.error("Failed to load dashboard:", error);
        if (error.response?.status === 401) {
          authService.logout();
          navigate("/login");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="dashboard-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  const totalSpent =
    orders.reduce((total, order) => total + (order.totalAmount || 0), 0) / 100;

  const pendingOrders = orders.filter((order) => {
    const status = order.orderStatus?.toLowerCase() || "";
    return status === "pending" || status === "processing";
  }).length;

  const completedOrders = orders.filter((order) => {
    const status = order.orderStatus?.toLowerCase() || "";
    return status === "delivered" || status === "completed";
  }).length;

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* DASHBOARD HERO HEADER */}
        <div className="dashboard-header">
          <div className="dashboard-user">
            <div className="dashboard-avatar">{userInitial}</div>
            <div>
              <span className="dashboard-welcome">Welcome back</span>
              <h1>{user?.name || "Customer"}</h1>
              <p>{user?.email}</p>
            </div>
          </div>

          <div className="dashboard-actions">
            <Link className="dashboard-outline-btn" to="/account">
              Account Settings
            </Link>
            <button className="dashboard-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {/* DYNAMIC STATISTICS CARDS */}
        <div className="dashboard-stats-grid">
          <div className="stat-widget">
            <div className="stat-widget-icon icon-orders">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <div className="stat-widget-content">
              <span className="stat-label">Total Orders</span>
              <strong className="stat-value">{orders.length}</strong>
              <small className="stat-meta">{orders.length === 1 ? "1 order placed" : `${orders.length} orders placed`}</small>
            </div>
          </div>

          <div className="stat-widget">
            <div className="stat-widget-icon icon-pending">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div className="stat-widget-content">
              <span className="stat-label">In Progress</span>
              <strong className="stat-value">{pendingOrders}</strong>
              <small className="stat-meta">Pending / Processing</small>
            </div>
          </div>

          <div className="stat-widget">
            <div className="stat-widget-icon icon-completed">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div className="stat-widget-content">
              <span className="stat-label">Completed</span>
              <strong className="stat-value">{completedOrders}</strong>
              <small className="stat-meta">Delivered successfully</small>
            </div>
          </div>

          <div className="stat-widget">
            <div className="stat-widget-icon icon-spent">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div className="stat-widget-content">
              <span className="stat-label">Total Spent</span>
              <strong className="stat-value">${totalSpent.toFixed(2)}</strong>
              <small className="stat-meta">Lifetime spending</small>
            </div>
          </div>

          <div className="stat-widget">
            <div className="stat-widget-icon icon-wishlist">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </div>
            <div className="stat-widget-content">
              <span className="stat-label">Wishlist</span>
              <strong className="stat-value">{totalWishlistCount}</strong>
              <small className="stat-meta"><Link to="/wishlist">View saved items</Link></small>
            </div>
          </div>

          <div className="stat-widget">
            <div className="stat-widget-icon icon-cart">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </div>
            <div className="stat-widget-content">
              <span className="stat-label">Cart</span>
              <strong className="stat-value">{totalCartCount}</strong>
              <small className="stat-meta"><Link to="/cart">Go to checkout</Link></small>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <div>
              <h2>Quick Actions</h2>
              <p>Common account and store shortcuts</p>
            </div>
          </div>

          <div className="quick-actions-grid">
            <Link to="/dashboard/orders" className="quick-action-card">
              <span className="quick-action-icon">📋</span>
              <span className="quick-action-content">
                <strong>My Orders</strong>
                <small>Track & review purchases</small>
              </span>
              <span className="quick-action-arrow">→</span>
            </Link>

            <Link to="/cart" className="quick-action-card">
              <span className="quick-action-icon">🛒</span>
              <span className="quick-action-content">
                <strong>My Cart</strong>
                <small>{totalCartCount} item(s) waiting</small>
              </span>
              <span className="quick-action-arrow">→</span>
            </Link>

            <Link to="/wishlist" className="quick-action-card">
              <span className="quick-action-icon">❤️</span>
              <span className="quick-action-content">
                <strong>Wishlist</strong>
                <small>{totalWishlistCount} saved item(s)</small>
              </span>
              <span className="quick-action-arrow">→</span>
            </Link>

            <Link to="/account" className="quick-action-card">
              <span className="quick-action-icon">👤</span>
              <span className="quick-action-content">
                <strong>Profile & Security</strong>
                <small>Edit address & password</small>
              </span>
              <span className="quick-action-arrow">→</span>
            </Link>
          </div>
        </section>

        {/* RECENT ORDERS */}
        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <div>
              <h2>Recent Orders</h2>
              <p>Your latest purchases and their shipping status</p>
            </div>

            {orders.length > 0 && (
              <Link className="dashboard-view-btn" to="/dashboard/orders">
                View All ({orders.length})
              </Link>
            )}
          </div>

          {orders.length === 0 ? (
            <div className="dashboard-empty-panel">
              <div className="dashboard-empty-icon">📦</div>
              <h3>No orders yet</h3>
              <p>You haven't placed any orders yet. Discover our curated collection.</p>
              <Link className="dashboard-view-btn" to="/shop">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="dashboard-panel order-table-wrap">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order._id}>
                      <td>
                        <strong>#{String(order._id).slice(-8)}</strong>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>
                        {order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0} product(s)
                      </td>
                      <td>
                        <strong>
                          ${((order.totalAmount || 0) / 100).toFixed(2)}
                        </strong>
                      </td>
                      <td>
                        <span className={`payment-pill ${order.paymentStatus || "unpaid"}`}>
                          {order.paymentStatus || "unpaid"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${order.orderStatus
                            ?.toLowerCase()
                            ?.replace(/\s+/g, "-")}`}
                        >
                          {order.orderStatus || "pending"}
                        </span>
                      </td>
                      <td>
                        <Link
                          className="table-action-link"
                          to={`/dashboard/orders/${order._id}`}
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ACCOUNT INFORMATION SNAPSHOT */}
        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <div>
              <h2>Account Information</h2>
              <p>Your saved contact and delivery address</p>
            </div>

            <Link className="dashboard-outline-btn" to="/account">
              Edit Account
            </Link>
          </div>

          <div className="dashboard-panel">
            <div className="dashboard-account-grid">
              <div className="account-info-box">
                <span className="info-box-label">Full Name</span>
                <strong>{user?.name || "Not provided"}</strong>
              </div>

              <div className="account-info-box">
                <span className="info-box-label">Email Address</span>
                <strong>{user?.email || "Not provided"}</strong>
              </div>

              <div className="account-info-box">
                <span className="info-box-label">Phone Number</span>
                <strong>{user?.address?.phone || "No phone number saved"}</strong>
              </div>

              <div className="account-info-box">
                <span className="info-box-label">Delivery Address</span>
                <strong>
                  {user?.address?.street
                    ? `${user.address.street}, ${user.address.city || ""} ${user.address.postalCode || ""}`
                    : "No address saved"}
                </strong>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default UserDashboard;