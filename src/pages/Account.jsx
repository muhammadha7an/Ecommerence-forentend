import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import authService from "../services/authService";
import Icon from "../components/Icon";
import PasswordInput from "../components/PasswordInput";
import "../style/dashboard/console.css";
import "../style/pages/account.css";

function Account() {
    const navigate = useNavigate();
    const location = useLocation();
    // Rendered both at /account (store layout) and /dashboard/profile (account portal)
    const isEmbedded = location.pathname.startsWith("/dashboard");

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
            <div className={`account-page ${isEmbedded ? "account-page--embedded" : ""}`}>
                <div className="ui-loading">
                    <span className="ui-spinner ui-spinner--lg" aria-hidden="true"></span>
                    <p>Loading your account...</p>
                </div>
            </div>
        );
    }

    const userInitial = user?.name
        ? user.name.charAt(0).toUpperCase()
        : "U";

    const isAdmin = user?.role === "admin";
    const dashboardPath = isAdmin ? "/admin/dashboard" : "/dashboard";

    const quickLinks = [
        { to: dashboardPath, icon: "grid", title: isAdmin ? "Admin Panel" : "Dashboard", text: "Overview & metrics" },
        { to: "/dashboard/orders", icon: "package", title: "My Orders", text: "History & tracking" },
        { to: "/wishlist", icon: "heart", title: "Saved Wishlist", text: "Your favourite pieces" },
        { to: "/cart", icon: "bag", title: "Shopping Cart", text: "Review items" },
    ];

    return (
        <div className={`account-page ${isEmbedded ? "account-page--embedded" : ""}`}>
            <div className="console-page account-container">

                {/* ACCOUNT HEADER */}
                <section className="console-welcome">
                    <div className="console-welcome__user">
                        <span className="console-avatar">{userInitial}</span>
                        <div style={{ minWidth: 0 }}>
                            <p>{isAdmin ? "Administrator account" : "Account settings"}</p>
                            <h1>{user?.name || "Account Settings"}</h1>
                            <p>{user?.email || "Manage your profile and security"}</p>
                        </div>
                    </div>

                    <div className="console-head__actions">
                        <button
                            type="button"
                            className="ui-btn ui-btn--accent"
                            onClick={() => navigate(dashboardPath)}
                        >
                            <Icon name="grid" />
                            {isAdmin ? "Admin Dashboard" : "User Dashboard"}
                        </button>
                    </div>
                </section>

                {/* QUICK NAVIGATION */}
                <div className="console-quick">
                    {quickLinks.map((item) => (
                        <Link key={item.title} to={item.to} className="console-quick__item">
                            <span className="console-quick__icon"><Icon name={item.icon} /></span>
                            <span className="console-quick__text">
                                <strong>{item.title}</strong>
                                <small>{item.text}</small>
                            </span>
                            <Icon name="chevronRight" className="console-quick__arrow" />
                        </Link>
                    ))}
                </div>

                {/* PROFILE INFORMATION */}
                <section className="console-panel">
                    <div className="console-panel__head">
                        <div>
                            <h2>Profile information</h2>
                            <p>Update your personal information and delivery details.</p>
                        </div>
                    </div>

                    <form onSubmit={handleProfileSubmit} className="console-panel__body account-form">
                        {profileMessage && (
                            <div className="ui-alert ui-alert--success" role="status">
                                <Icon name="checkCircle" />
                                <span>{profileMessage}</span>
                            </div>
                        )}

                        {profileError && (
                            <div className="ui-alert ui-alert--error" role="alert">
                                <Icon name="alertCircle" />
                                <span>{profileError}</span>
                            </div>
                        )}

                        <h3 className="account-form__legend">Personal details</h3>
                        <div className="ui-form-grid">
                            <div className="ui-field">
                                <label className="ui-label" htmlFor="name">Full name</label>
                                <input
                                    id="name"
                                    className="ui-input"
                                    type="text"
                                    name="name"
                                    autoComplete="name"
                                    value={profile.name}
                                    onChange={handleProfileChange}
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>

                            <div className="ui-field">
                                <label className="ui-label" htmlFor="email">Email address</label>
                                <input
                                    id="email"
                                    className="ui-input"
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    value={profile.email}
                                    onChange={handleProfileChange}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        <h3 className="account-form__legend">Delivery address</h3>
                        <div className="ui-form-grid">
                            <div className="ui-field ui-field--full">
                                <label className="ui-label" htmlFor="street">Street address</label>
                                <input
                                    id="street"
                                    className="ui-input"
                                    type="text"
                                    name="street"
                                    autoComplete="street-address"
                                    value={address.street}
                                    onChange={handleAddressChange}
                                    placeholder="Street address"
                                />
                            </div>

                            <div className="ui-field">
                                <label className="ui-label" htmlFor="city">City</label>
                                <input
                                    id="city"
                                    className="ui-input"
                                    type="text"
                                    name="city"
                                    autoComplete="address-level2"
                                    value={address.city}
                                    onChange={handleAddressChange}
                                    placeholder="City"
                                />
                            </div>

                            <div className="ui-field">
                                <label className="ui-label" htmlFor="postalCode">Postal code</label>
                                <input
                                    id="postalCode"
                                    className="ui-input"
                                    type="text"
                                    name="postalCode"
                                    autoComplete="postal-code"
                                    value={address.postalCode}
                                    onChange={handleAddressChange}
                                    placeholder="Postal code"
                                />
                            </div>

                            <div className="ui-field">
                                <label className="ui-label" htmlFor="phone">Phone</label>
                                <input
                                    id="phone"
                                    className="ui-input"
                                    type="text"
                                    name="phone"
                                    autoComplete="tel"
                                    value={address.phone}
                                    onChange={handleAddressChange}
                                    placeholder="Phone number"
                                />
                            </div>
                        </div>

                        <div className="account-form__actions">
                            <button
                                type="submit"
                                className="ui-btn"
                                disabled={profileLoading}
                            >
                                {profileLoading ? (
                                    <>
                                        <span className="ui-spinner" aria-hidden="true"></span>
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="check" />
                                        Save Profile
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </section>

                <div className="account-grid">
                    {/* CHANGE PASSWORD */}
                    <section className="console-panel">
                        <div className="console-panel__head">
                            <div>
                                <h2>Change password</h2>
                                <p>Update your password to keep your account secure.</p>
                            </div>
                        </div>

                        <form onSubmit={handlePasswordSubmit} className="console-panel__body account-form">
                            {passwordMessage && (
                                <div className="ui-alert ui-alert--success" role="status">
                                    <Icon name="checkCircle" />
                                    <span>{passwordMessage}</span>
                                </div>
                            )}

                            {passwordError && (
                                <div className="ui-alert ui-alert--error" role="alert">
                                    <Icon name="alertCircle" />
                                    <span>{passwordError}</span>
                                </div>
                            )}

                            <div className="ui-field">
                                <label className="ui-label" htmlFor="currentPassword">Current password</label>
                                <PasswordInput
                                    id="currentPassword"
                                    name="currentPassword"
                                    autoComplete="current-password"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Enter current password"
                                    required
                                />
                            </div>

                            <div className="ui-field">
                                <label className="ui-label" htmlFor="newPassword">New password</label>
                                <PasswordInput
                                    id="newPassword"
                                    name="newPassword"
                                    autoComplete="new-password"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="At least 6 characters"
                                    minLength="6"
                                    required
                                />
                            </div>

                            <div className="account-form__actions">
                                <button
                                    type="submit"
                                    className="ui-btn"
                                    disabled={passwordLoading}
                                >
                                    {passwordLoading ? (
                                        <>
                                            <span className="ui-spinner" aria-hidden="true"></span>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Icon name="lock" />
                                            Update Password
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* SESSION */}
                    <section className="console-panel account-session">
                        <div className="console-panel__head">
                            <div>
                                <h2>Account session</h2>
                                <p>Sign out from your account on this device.</p>
                            </div>
                        </div>
                        <div className="console-panel__body">
                            <p className="account-session__text">
                                Your cart and wishlist are saved to this browser and will be here when you sign back in.
                            </p>
                            <button
                                type="button"
                                className="ui-btn ui-btn--danger-soft"
                                onClick={handleLogout}
                            >
                                <Icon name="logOut" />
                                Sign Out
                            </button>
                        </div>
                    </section>
                </div>

            </div>
        </div>
    );
}

export default Account;
