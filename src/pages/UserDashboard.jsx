import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import authService from "../services/authService";

function UserDashboard() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const cartItems = useSelector(
        (state) => state.cart.items
    );

    const wishlistItems = useSelector(
        (state) => state.wishlist.items
    );

    // Load user + orders
    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const userData = await authService.getMe();
                const ordersData = await authService.getOrders();

                setUser(userData.user);
                setOrders(ordersData.orders || []);
            } catch (error) {
                console.error(
                    "Failed to load dashboard:",
                    error
                );

                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, [navigate]);

    // Logout
    const handleLogout = () => {
        authService.logout();
        navigate("/login");
    };

    // Loading
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

    const userInitial = user?.name
        ? user.name.charAt(0).toUpperCase()
        : "U";

    const totalSpent =
        orders.reduce(
            (total, order) =>
                total + (order.totalAmount || 0),
            0
        ) / 100;

    const pendingOrders = orders.filter(
        (order) =>
            order.orderStatus?.toLowerCase() ===
                "pending" ||
            order.orderStatus?.toLowerCase() ===
                "processing"
    ).length;

    const completedOrders = orders.filter(
        (order) =>
            order.orderStatus?.toLowerCase() ===
            "delivered"
    ).length;

    return (
        <div className="dashboard-page">

            <div className="dashboard-container">

                {/* =================================
                    DASHBOARD HEADER
                ================================== */}
                <div className="dashboard-header">

                    <div className="dashboard-user">

                        <div className="dashboard-avatar">
                            {userInitial}
                        </div>

                        <div>
                            <span className="dashboard-welcome">
                                Welcome back
                            </span>

                            <h1>
                                {user?.name || "User"}
                            </h1>

                            <p>
                                {user?.email}
                            </p>
                        </div>

                    </div>

                    <div className="dashboard-actions">

                        <button
                            className="dashboard-outline-btn"
                            onClick={() =>
                                navigate("/account")
                            }
                        >
                            Account Settings
                        </button>

                        <button
                            className="dashboard-logout-btn"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    </div>

                </div>

                {/* =================================
                    STATISTICS
                ================================== */}
                <div className="dashboard-stats">

                    <div className="dashboard-stat-card">
                        <div className="dashboard-stat-icon">
                            📦
                        </div>

                        <div>
                            <span>Total Orders</span>
                            <strong>
                                {orders.length}
                            </strong>
                        </div>
                    </div>

                    <div className="dashboard-stat-card">
                        <div className="dashboard-stat-icon">
                            💰
                        </div>

                        <div>
                            <span>Total Spent</span>
                            <strong>
                                ${totalSpent.toFixed(2)}
                            </strong>
                        </div>
                    </div>

                    <div className="dashboard-stat-card">
                        <div className="dashboard-stat-icon">
                            🛒
                        </div>

                        <div>
                            <span>Cart Items</span>
                            <strong>
                                {cartItems.length}
                            </strong>
                        </div>
                    </div>

                    <div className="dashboard-stat-card">
                        <div className="dashboard-stat-icon">
                            ❤️
                        </div>

                        <div>
                            <span>Wishlist</span>
                            <strong>
                                {wishlistItems.length}
                            </strong>
                        </div>
                    </div>

                </div>

                {/* =================================
                    QUICK ACTIONS
                ================================== */}
                <section className="dashboard-section">

                    <div className="dashboard-section-heading">
                        <div>
                            <h2>Quick Actions</h2>
                            <p>
                                Quickly access your account
                                and shopping features.
                            </p>
                        </div>
                    </div>

                    <div className="quick-actions-grid">

                        <button
                            className="quick-action-card"
                            onClick={() =>
                                navigate("/account")
                            }
                        >
                            <span className="quick-action-icon">
                                👤
                            </span>

                            <span className="quick-action-content">
                                <strong>
                                    My Account
                                </strong>

                                <small>
                                    Manage profile and password
                                </small>
                            </span>

                            <span className="quick-action-arrow">
                                →
                            </span>
                        </button>

                        <button
                            className="quick-action-card"
                            onClick={() =>
                                navigate("/cart")
                            }
                        >
                            <span className="quick-action-icon">
                                🛒
                            </span>

                            <span className="quick-action-content">
                                <strong>
                                    My Cart
                                </strong>

                                <small>
                                    {cartItems.length} product(s)
                                </small>
                            </span>

                            <span className="quick-action-arrow">
                                →
                            </span>
                        </button>

                        <button
                            className="quick-action-card"
                            onClick={() =>
                                navigate("/wishlist")
                            }
                        >
                            <span className="quick-action-icon">
                                ❤️
                            </span>

                            <span className="quick-action-content">
                                <strong>
                                    Wishlist
                                </strong>

                                <small>
                                    {wishlistItems.length} saved
                                    product(s)
                                </small>
                            </span>

                            <span className="quick-action-arrow">
                                →
                            </span>
                        </button>

                        <button
                            className="quick-action-card"
                            onClick={() =>
                                navigate("/dashboard/orders")
                            }
                        >
                            <span className="quick-action-icon">
                                📋
                            </span>

                            <span className="quick-action-content">
                                <strong>
                                    My Orders
                                </strong>

                                <small>
                                    View your order history
                                </small>
                            </span>

                            <span className="quick-action-arrow">
                                →
                            </span>
                        </button>

                    </div>

                </section>

                {/* =================================
                    ORDER SUMMARY
                ================================== */}
                <section className="dashboard-section">

                    <div className="dashboard-section-heading">

                        <div>
                            <h2>Order Overview</h2>

                            <p>
                                Current status of your orders.
                            </p>
                        </div>

                        <button
                            className="dashboard-view-btn"
                            onClick={() =>
                                navigate("/dashboard/orders")
                            }
                        >
                            View All Orders
                        </button>

                    </div>

                    <div className="order-summary-grid">

                        <div className="order-summary-card">
                            <span>Total Orders</span>
                            <strong>
                                {orders.length}
                            </strong>
                        </div>

                        <div className="order-summary-card">
                            <span>Pending / Processing</span>
                            <strong>
                                {pendingOrders}
                            </strong>
                        </div>

                        <div className="order-summary-card">
                            <span>Delivered</span>
                            <strong>
                                {completedOrders}
                            </strong>
                        </div>

                    </div>

                </section>

                {/* =================================
                    RECENT ORDERS
                ================================== */}
                <section className="dashboard-section">

                    <div className="dashboard-section-heading">

                        <div>
                            <h2>Recent Orders</h2>

                            <p>
                                Your latest orders.
                            </p>
                        </div>

                        {orders.length > 0 && (
                            <button
                                className="dashboard-view-btn"
                                onClick={() =>
                                    navigate("/dashboard/orders")
                                }
                            >
                                View All
                            </button>
                        )}

                    </div>

                    {orders.length === 0 ? (

                        <div className="dashboard-empty">
                            <div className="dashboard-empty-icon">
                                📦
                            </div>

                            <h3>
                                No orders yet
                            </h3>

                            <p>
                                You haven't placed any orders
                                yet.
                            </p>

                            <button
                                onClick={() =>
                                    navigate("/")
                                }
                            >
                                Start Shopping
                            </button>
                        </div>

                    ) : (

                        <div className="dashboard-orders">

                            {orders
                                .slice(0, 5)
                                .map((order) => (

                                    <div
                                        className="dashboard-order-row"
                                        key={order._id}
                                    >

                                        <div className="order-info">

                                            <strong>
                                                #
                                                {String(
                                                    order._id
                                                ).slice(-8)}
                                            </strong>

                                            <span>
                                                {new Date(
                                                    order.createdAt
                                                ).toLocaleDateString()}
                                            </span>

                                        </div>

                                        <div className="order-products">
                                            <span>
                                                {order.items
                                                    ?.length || 0}
                                            </span>

                                            <small>
                                                product(s)
                                            </small>
                                        </div>

                                        <div className="order-price">
                                            <strong>
                                                $
                                                {(
                                                    (order.totalAmount ||
                                                        0) /
                                                    100
                                                ).toFixed(2)}
                                            </strong>
                                        </div>

                                        <div className="order-status">

                                            <span
                                                className={`status-badge ${
                                                    order.orderStatus
                                                        ?.toLowerCase()
                                                        ?.replace(
                                                            /\s+/g,
                                                            "-"
                                                        )
                                                }`}
                                            >
                                                {
                                                    order.orderStatus ||
                                                    "Pending"
                                                }
                                            </span>

                                        </div>

                                    </div>

                                ))}

                        </div>

                    )}

                </section>

                {/* =================================
                    ACCOUNT INFORMATION
                ================================== */}
                <section className="dashboard-section">

                    <div className="dashboard-section-heading">

                        <div>
                            <h2>Account Information</h2>

                            <p>
                                Your basic account details.
                            </p>
                        </div>

                        <button
                            className="dashboard-view-btn"
                            onClick={() =>
                                navigate("/account")
                            }
                        >
                            Edit Account
                        </button>

                    </div>

                    <div className="dashboard-account-info">

                        <div>
                            <span>Name</span>
                            <strong>
                                {user?.name || "Not available"}
                            </strong>
                        </div>

                        <div>
                            <span>Email</span>
                            <strong>
                                {user?.email || "Not available"}
                            </strong>
                        </div>

                        <div>
                            <span>Phone</span>
                            <strong>
                                {user?.address?.phone ||
                                    "Not available"}
                            </strong>
                        </div>

                        <div>
                            <span>City</span>
                            <strong>
                                {user?.address?.city ||
                                    "Not available"}
                            </strong>
                        </div>

                    </div>

                </section>

            </div>

        </div>
    );
}

export default UserDashboard;