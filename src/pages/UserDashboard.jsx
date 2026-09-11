import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import authService from "../services/authService";
import Icon from "../components/Icon";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";

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
      <div className="console-page">
        <div className="ui-loading">
          <span className="ui-spinner ui-spinner--lg" aria-hidden="true"></span>
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

  const firstName = user?.name ? user.name.split(" ")[0] : "Customer";

  return (
    <div className="console-page">
      {/* WELCOME */}
      <section className="console-welcome">
        <div className="console-welcome__user">
          <span className="console-avatar">{userInitial}</span>
          <div style={{ minWidth: 0 }}>
            <p>Welcome back</p>
            <h1>{firstName}</h1>
            <p>{user?.email}</p>
          </div>
        </div>

        <div className="console-head__actions">
          <Link className="ui-btn ui-btn--secondary" to="/dashboard/profile">
            <Icon name="settings" />
            Account Settings
          </Link>
          <button type="button" className="ui-btn ui-btn--accent" onClick={handleLogout}>
            <Icon name="logOut" />
            Logout
          </button>
        </div>
      </section>

      {/* STATS */}
      <div className="console-stats">
        <div className="console-stat">
          <div className="console-stat__top">
            <span>Total orders</span>
            <span className="console-stat__icon"><Icon name="package" /></span>
          </div>
          <strong className="console-stat__value">{orders.length}</strong>
          <small className="console-stat__meta">{orders.length === 1 ? "1 order placed" : `${orders.length} orders placed`}</small>
        </div>

        <div className="console-stat">
          <div className="console-stat__top">
            <span>In progress</span>
            <span className="console-stat__icon console-stat__icon--warning"><Icon name="clock" /></span>
          </div>
          <strong className="console-stat__value">{pendingOrders}</strong>
          <small className="console-stat__meta">Pending or processing</small>
        </div>

        <div className="console-stat">
          <div className="console-stat__top">
            <span>Completed</span>
            <span className="console-stat__icon console-stat__icon--success"><Icon name="checkCircle" /></span>
          </div>
          <strong className="console-stat__value">{completedOrders}</strong>
          <small className="console-stat__meta">Delivered successfully</small>
        </div>

        <div className="console-stat console-stat--feature">
          <div className="console-stat__top">
            <span>Total spent</span>
            <span className="console-stat__icon"><Icon name="dollar" /></span>
          </div>
          <strong className="console-stat__value">${totalSpent.toFixed(2)}</strong>
          <small className="console-stat__meta">Lifetime spending</small>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="console-quick">
        <Link to="/dashboard/orders" className="console-quick__item">
          <span className="console-quick__icon"><Icon name="fileText" /></span>
          <span className="console-quick__text">
            <strong>My Orders</strong>
            <small>Track and review purchases</small>
          </span>
          <Icon name="chevronRight" className="console-quick__arrow" />
        </Link>

        <Link to="/cart" className="console-quick__item">
          <span className="console-quick__icon"><Icon name="bag" /></span>
          <span className="console-quick__text">
            <strong>My Cart</strong>
            <small>{totalCartCount} item(s) waiting</small>
          </span>
          <Icon name="chevronRight" className="console-quick__arrow" />
        </Link>

        <Link to="/wishlist" className="console-quick__item">
          <span className="console-quick__icon"><Icon name="heart" /></span>
          <span className="console-quick__text">
            <strong>Wishlist</strong>
            <small>{totalWishlistCount} saved item(s)</small>
          </span>
          <Icon name="chevronRight" className="console-quick__arrow" />
        </Link>

        <Link to="/dashboard/profile" className="console-quick__item">
          <span className="console-quick__icon"><Icon name="user" /></span>
          <span className="console-quick__text">
            <strong>Profile &amp; Security</strong>
            <small>Edit address and password</small>
          </span>
          <Icon name="chevronRight" className="console-quick__arrow" />
        </Link>
      </div>

      {/* RECENT ORDERS */}
      <section className="console-panel">
        <div className="console-panel__head">
          <div>
            <h2>Recent orders</h2>
            <p>Your latest purchases and their shipping status</p>
          </div>

          {orders.length > 0 && (
            <Link className="ui-btn ui-btn--secondary ui-btn--sm" to="/dashboard/orders">
              View All ({orders.length})
            </Link>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="console-panel__body">
            <EmptyState
              icon="package"
              title="No orders yet"
              text="You haven't placed any orders yet. Discover our curated collection."
            >
              <Link className="ui-btn" to="/shop">
                Start Shopping
              </Link>
            </EmptyState>
          </div>
        ) : (
          <div className="console-table-wrap">
            <table className="console-table console-table--stack">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th className="is-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order._id}>
                    <td className="is-primary" data-label="Order">
                      <span className="console-mono">#{String(order._id).slice(-8).toUpperCase()}</span>
                    </td>
                    <td data-label="Date">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td data-label="Items">
                      {order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0} product(s)
                    </td>
                    <td data-label="Total" className="is-num">
                      <strong>${((order.totalAmount || 0) / 100).toFixed(2)}</strong>
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
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ACCOUNT INFORMATION */}
      <section className="console-panel">
        <div className="console-panel__head">
          <div>
            <h2>Account information</h2>
            <p>Your saved contact and delivery address</p>
          </div>

          <Link className="ui-btn ui-btn--secondary ui-btn--sm" to="/dashboard/profile">
            <Icon name="edit" />
            Edit Account
          </Link>
        </div>

        <div className="console-panel__body">
          <div className="console-info-grid">
            <div className="console-info">
              <Icon name="user" />
              <div>
                <span>Full name</span>
                <strong>{user?.name || "Not provided"}</strong>
              </div>
            </div>

            <div className="console-info">
              <Icon name="mail" />
              <div>
                <span>Email address</span>
                <strong>{user?.email || "Not provided"}</strong>
              </div>
            </div>

            <div className="console-info">
              <Icon name="phone" />
              <div>
                <span>Phone number</span>
                <strong>{user?.address?.phone || "No phone number saved"}</strong>
              </div>
            </div>

            <div className="console-info">
              <Icon name="mapPin" />
              <div>
                <span>Delivery address</span>
                <strong>
                  {user?.address?.street
                    ? `${user.address.street}, ${user.address.city || ""} ${user.address.postalCode || ""}`
                    : "No address saved"}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default UserDashboard;
