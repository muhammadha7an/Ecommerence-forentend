import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import { useSelector } from "react-redux";
 

function Account() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const cartItems = useSelector((state) => state.cart.items);
    const wishlistItems = useSelector((state) => state.wishlist.items);

    const [profile, setProfile] = useState({
        name: "",
        email: "",
    });
    const [address, setAddress] = useState({ street: "", city: "", postalCode: "", phone: "" });

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
    });

    const [profileMessage, setProfileMessage] = useState("");
    const [profileError, setProfileError] = useState("");

    const [passwordMessage, setPasswordMessage] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Get logged-in user
    useEffect(() => {
        const loadUser = async () => {
            try {
                const data = await authService.getMe();
                const ordersData = await authService.getOrders();

                setUser(data.user);
                setOrders(ordersData.orders || []);

                setProfile({
                    name: data.user.name,
                    email: data.user.email,
                });
                setAddress(data.user.address || { street: "", city: "", postalCode: "", phone: "" });
            } catch {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, [navigate]);

    // Profile input
    const handleProfileChange = (e) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value,
        });
    };

    // Password input
    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value,
        });
    };

    const handleAddressChange = (e) => {
        setAddress({ ...address, [e.target.name]: e.target.value });
    };

    // Update Profile
    const handleProfileSubmit = async (e) => {
        e.preventDefault();

        setProfileMessage("");
        setProfileError("");
        setProfileLoading(true);

        try {
            const data = await authService.updateProfile({ ...profile, address });

            setUser(data.user);
            setProfileMessage(data.message || "Profile updated successfully!");

            localStorage.setItem("user", JSON.stringify(data.user));
        } catch (error) {
            setProfileError(
                error.response?.data?.message || "Failed to update profile"
            );
        } finally {
            setProfileLoading(false);
        }
    };

    const savedAddress = user?.address || address;
    const totalSpent = orders.reduce((total, order) => total + (order.totalAmount || 0), 0) / 100;

    // Change Password
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        setPasswordMessage("");
        setPasswordError("");
        setPasswordLoading(true);

        try {
            const data = await authService.changePassword(passwordData);

            setPasswordMessage(data.message || "Password changed successfully!");

            setPasswordData({
                currentPassword: "",
                newPassword: "",
            });
        } catch (error) {
            setPasswordError(
                error.response?.data?.message || "Failed to change password"
            );
        } finally {
            setPasswordLoading(false);
        }
    };

    // Logout
    const handleLogout = () => {
        authService.logout();
        navigate("/login");
    };

    if (loading) {
        return (
            <div className="account-page">
                <div className="account-spinner-container">
                    <div className="account-spinner"></div>
                    <p>Loading your account...</p>
                </div>
            </div>
        );
    }

    const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

    return (
        <div className="account-page">
            <div className="account-container">
                {/* Header Banner */}
                <div className="account-header-card">
                    <div className="avatar-circle">{userInitial}</div>
                    <div className="account-header-info">
                        <h1>{user?.name || "Account Settings"}</h1>
                        <p>{user?.email || "Manage your profile and security"}</p>
                    </div>
                </div>

                <div className="account-stats-grid">
                    <div className="account-stat"><strong>{orders.length}</strong><span>Total orders</span></div>
                    <div className="account-stat"><strong>${totalSpent.toFixed(2)}</strong><span>Total spent</span></div>
                    <div className="account-stat"><strong>{cartItems.length}</strong><span>Cart products</span></div>
                    <div className="account-stat"><strong>{wishlistItems.length}</strong><span>Wishlist products</span></div>
                </div>

                <section className="account-section">
                    <div className="section-header">
                        <h2>Recent Orders</h2>
                        <p>Your orders are visible only to your account.</p>
                    </div>
                    {orders.length === 0 ? <p className="account-muted">No orders yet.</p> : (
                        <div className="orders-list">
                            {orders.map((order) => (
                                <article className="order-row" key={order._id}>
                                    <div><strong>#{String(order._id).slice(-8)}</strong><span>{new Date(order.createdAt).toLocaleDateString()}</span></div>
                                    <div><strong>${((order.totalAmount || 0) / 100).toFixed(2)}</strong><span>{order.paymentStatus} · {order.orderStatus}</span></div>
                                    <span>{order.items?.length || 0} product(s)</span>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                <section className="account-section account-two-column">
                    <div>
                        <div className="section-header"><h2>Saved Address</h2><p>Used for future checkout details.</p></div>
                        <p>{savedAddress.street || "No street saved"}</p><p>{savedAddress.city || "No city saved"} {savedAddress.postalCode}</p><p>{savedAddress.phone || "No phone saved"}</p>
                    </div>
                    <div>
                        <div className="section-header"><h2>Current Cart</h2><p>{cartItems.length} product(s) saved for this account.</p></div>
                        {cartItems.map((item) => <p key={item.id}>{item.name} x {item.quantity}</p>)}
                    </div>
                </section>

                {/* Profile Information Section */}
                <section className="account-section">
                    <div className="section-header">
                        <h2>Profile Information</h2>
                        <p>Update your account details and email address.</p>
                    </div>

                    {profileMessage && (
                        <div className="alert-message success-message">
                            {profileMessage}
                        </div>
                    )}

                    {profileError && (
                        <div className="alert-message error-message">
                            {profileError}
                        </div>
                    )}

                    <form onSubmit={handleProfileSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={profile.name}
                                onChange={handleProfileChange}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="street">Street Address</label>
                            <input id="street" name="street" value={address.street} onChange={handleAddressChange} placeholder="Street address" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="city">City</label>
                            <input id="city" name="city" value={address.city} onChange={handleAddressChange} placeholder="City" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="postalCode">Postal Code</label>
                            <input id="postalCode" name="postalCode" value={address.postalCode} onChange={handleAddressChange} placeholder="Postal code" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Phone</label>
                            <input id="phone" name="phone" value={address.phone} onChange={handleAddressChange} placeholder="Phone" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={profile.email}
                                onChange={handleProfileChange}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={profileLoading}
                            >
                                {profileLoading ? "Updating..." : "Save Profile"}
                            </button>
                        </div>
                    </form>
                </section>

                {/* Change Password Section */}
                <section className="account-section">
                    <div className="section-header">
                        <h2>Change Password</h2>
                        <p>Ensure your account is using a strong password.</p>
                    </div>

                    {passwordMessage && (
                        <div className="alert-message success-message">
                            {passwordMessage}
                        </div>
                    )}

                    {passwordError && (
                        <div className="alert-message error-message">
                            {passwordError}
                        </div>
                    )}

                    <form onSubmit={handlePasswordSubmit}>
                        <div className="form-group">
                            <label htmlFor="currentPassword">Current Password</label>
                            <input
                                id="currentPassword"
                                type="password"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>
                            <input
                                id="newPassword"
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                placeholder="••••••••"
                                minLength="6"
                                required
                            />
                        </div>

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={passwordLoading}
                            >
                                {passwordLoading ? "Updating..." : "Update Password"}
                            </button>
                        </div>
                    </form>
                </section>

                {/* Session / Danger Zone Section */}
                <section className="account-section danger-zone">
                    <div className="section-header">
                        <h2>Account Session</h2>
                        <p>Sign out of your active session on this device.</p>
                    </div>
                    <button
                        type="button"
                        className="btn btn-danger"
                        onClick={handleLogout}
                    >
                        Sign Out
                    </button>
                </section>
            </div>
        </div>
    );
}

export default Account;