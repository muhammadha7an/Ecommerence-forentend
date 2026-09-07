import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

function Account() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    const [profile, setProfile] = useState({
        name: "",
        email: "",
    });

    const [address, setAddress] = useState({
        street: "",
        city: "",
        postalCode: "",
        phone: "",
    });

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

                setUser(data.user);

                setProfile({
                    name: data.user.name || "",
                    email: data.user.email || "",
                });

                setAddress(
                    data.user.address || {
                        street: "",
                        city: "",
                        postalCode: "",
                        phone: "",
                    }
                );
            } catch (error) {
                console.error("Failed to load account:", error);

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

    // Address input
    const handleAddressChange = (e) => {
        setAddress({
            ...address,
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

    // Update profile
    const handleProfileSubmit = async (e) => {
        e.preventDefault();

        setProfileMessage("");
        setProfileError("");
        setProfileLoading(true);

        try {
            const data = await authService.updateProfile({
                ...profile,
                address,
            });

            setUser(data.user);

            setProfileMessage(
                data.message || "Profile updated successfully!"
            );

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );
        } catch (error) {
            setProfileError(
                error.response?.data?.message ||
                "Failed to update profile"
            );
        } finally {
            setProfileLoading(false);
        }
    };

    // Change password
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        setPasswordMessage("");
        setPasswordError("");
        setPasswordLoading(true);

        try {
            const data = await authService.changePassword(
                passwordData
            );

            setPasswordMessage(
                data.message || "Password changed successfully!"
            );

            setPasswordData({
                currentPassword: "",
                newPassword: "",
            });
        } catch (error) {
            setPasswordError(
                error.response?.data?.message ||
                "Failed to change password"
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

    const userInitial = user?.name
        ? user.name.charAt(0).toUpperCase()
        : "U";

    return (
        <div className="account-page">
            <div className="account-container">

                {/* =========================
                    ACCOUNT HEADER
                ========================== */}
                <div className="account-header-card">

                    <div className="avatar-circle">
                        {userInitial}
                    </div>

                    <div className="account-header-info">
                        <h1>
                            {user?.name || "Account Settings"}
                        </h1>

                        <p>
                            {user?.email ||
                                "Manage your profile and security"}
                        </p>
                    </div>

                    {/* Dashboard Button */}
                    <button
                        type="button"
                        className="btn btn-primary  dashboard-btn"
                        onClick={() => navigate(user?.role === "admin" ? "/admin/dashboard" : "/dashboard")}
                    >
                        {user?.role === "admin" ? "Admin Dashboard" : "User Dashboard"}
                    </button>

                </div>

                {/* =========================
                    ACCOUNT QUICK NAVIGATION
                ========================== */}
                <div className="account-quick-nav-grid">
                    <button
                        type="button"
                        className="account-nav-card"
                        onClick={() => navigate(user?.role === "admin" ? "/admin/dashboard" : "/dashboard")}
                    >
                        <span className="nav-card-icon">📊</span>
                        <div className="nav-card-text">
                            <strong>{user?.role === "admin" ? "Admin Panel" : "Dashboard"}</strong>
                            <small>Overview & metrics</small>
                        </div>
                    </button>

                    <button
                        type="button"
                        className="account-nav-card"
                        onClick={() => navigate("/dashboard/orders")}
                    >
                        <span className="nav-card-icon">📦</span>
                        <div className="nav-card-text">
                            <strong>My Orders</strong>
                            <small>History & tracking</small>
                        </div>
                    </button>

                    <button
                        type="button"
                        className="account-nav-card"
                        onClick={() => navigate("/wishlist")}
                    >
                        <span className="nav-card-icon">❤️</span>
                        <div className="nav-card-text">
                            <strong>Saved Wishlist</strong>
                            <small>Saved favorite pieces</small>
                        </div>
                    </button>

                    <button
                        type="button"
                        className="account-nav-card"
                        onClick={() => navigate("/cart")}
                    >
                        <span className="nav-card-icon">🛒</span>
                        <div className="nav-card-text">
                            <strong>Shopping Cart</strong>
                            <small>Review items</small>
                        </div>
                    </button>
                </div>

                {/* =========================
                    PROFILE INFORMATION
                ========================== */}
                <section className="account-section">

                    <div className="section-header">
                        <h2>Profile Information</h2>

                        <p>
                            Update your personal information
                            and contact details.
                        </p>
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

                        <div className="account-form-grid">

                            <div className="form-group">
                                <label htmlFor="name">
                                    Full Name
                                </label>

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
                                <label htmlFor="email">
                                    Email Address
                                </label>

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

                            <div className="form-group">
                                <label htmlFor="street">
                                    Street Address
                                </label>

                                <input
                                    id="street"
                                    type="text"
                                    name="street"
                                    value={address.street}
                                    onChange={handleAddressChange}
                                    placeholder="Street address"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="city">
                                    City
                                </label>

                                <input
                                    id="city"
                                    type="text"
                                    name="city"
                                    value={address.city}
                                    onChange={handleAddressChange}
                                    placeholder="City"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="postalCode">
                                    Postal Code
                                </label>

                                <input
                                    id="postalCode"
                                    type="text"
                                    name="postalCode"
                                    value={address.postalCode}
                                    onChange={handleAddressChange}
                                    placeholder="Postal code"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">
                                    Phone
                                </label>

                                <input
                                    id="phone"
                                    type="text"
                                    name="phone"
                                    value={address.phone}
                                    onChange={handleAddressChange}
                                    placeholder="Phone number"
                                />
                            </div>

                        </div>

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={profileLoading}
                            >
                                {profileLoading
                                    ? "Updating..."
                                    : "Save Profile"}
                            </button>
                        </div>

                    </form>
                </section>

                {/* =========================
                    CHANGE PASSWORD
                ========================== */}
                <section className="account-section">

                    <div className="section-header">
                        <h2>Change Password</h2>

                        <p>
                            Update your password to keep your
                            account secure.
                        </p>
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

                        <div className="account-form-grid">

                            <div className="form-group">
                                <label htmlFor="currentPassword">
                                    Current Password
                                </label>

                                <input
                                    id="currentPassword"
                                    type="password"
                                    name="currentPassword"
                                    value={
                                        passwordData.currentPassword
                                    }
                                    onChange={
                                        handlePasswordChange
                                    }
                                    placeholder="Enter current password"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="newPassword">
                                    New Password
                                </label>

                                <input
                                    id="newPassword"
                                    type="password"
                                    name="newPassword"
                                    value={
                                        passwordData.newPassword
                                    }
                                    onChange={
                                        handlePasswordChange
                                    }
                                    placeholder="Enter new password"
                                    minLength="6"
                                    required
                                />
                            </div>

                        </div>

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={passwordLoading}
                            >
                                {passwordLoading
                                    ? "Updating..."
                                    : "Update Password"}
                            </button>
                        </div>

                    </form>
                </section>

                {/* =========================
                    LOGOUT
                ========================== */}
                <section className="account-section danger-zone">

                    <div className="section-header">
                        <h2>Account Session</h2>

                        <p>
                            Sign out from your account on this
                            device.
                        </p>
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