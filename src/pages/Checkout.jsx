import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../services/api'
 

export default function Checkout() {
    const cartItems = useSelector((state) => state.cart.items)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Form state for shipping info
    const [shippingInfo, setShippingInfo] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: ''
    })

    const handleInputChange = (e) => {
        setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value })
    }

    const subtotal = cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    )
    const shipping = 0
    const total = subtotal + shipping

    const handlePayment = async (e) => {
        e.preventDefault()

        try {
            setLoading(true)
            setError('')

            const response = await fetch(`${API_BASE_URL}/api/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    items: cartItems,
                    shippingDetails: shippingInfo,
                    origin: window.location.origin
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Unable to create payment session.')
            }

            if (!data.url) {
                throw new Error('Stripe Checkout URL was not returned.')
            }

            // Redirect to Stripe
            window.location.href = data.url
        } catch (err) {
            console.error('Payment Error:', err)
            setError(err.message || 'Something went wrong. Please try again.')
            setLoading(false)
        }
    }

    /* Empty Cart State */
    if (cartItems.length === 0) {
        return (
            <div className="checkout-page-empty">
                <div className="empty-cart-card">
                    <div className="empty-icon-wrapper">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1"/>
                            <circle cx="20" cy="21" r="1"/>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                        </svg>
                    </div>
                    <h1>Your Cart is Empty</h1>
                    <p>You haven't added any products to your cart yet.</p>
                    <Link to="/shop" className="btn-continue-shopping">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="checkout-container">
            <div className="checkout-header">
                <h1>Secure Checkout</h1>
                <p>Complete your shipping details to proceed to secure payment.</p>
            </div>

            <form onSubmit={handlePayment} className="checkout-layout">
                {/* Left Column: Shipping & Customer Details */}
                <div className="checkout-main">
                    <div className="checkout-section-card">
                        <div className="section-title">
                            <span className="step-number">1</span>
                            <h2>Shipping Address</h2>
                        </div>

                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label htmlFor="fullName">Full Name</label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    placeholder="e.g. John Doe"
                                    value={shippingInfo.fullName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="john@example.com"
                                    value={shippingInfo.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">Phone Number</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    placeholder="+92 300 1234567"
                                    value={shippingInfo.phone}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group full-width">
                                <label htmlFor="address">Street Address</label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    placeholder="House/Apartment #, Street name"
                                    value={shippingInfo.address}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="city">City</label>
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    placeholder="Lahore, Karachi, etc."
                                    value={shippingInfo.city}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="postalCode">Postal Code</label>
                                <input
                                    type="text"
                                    id="postalCode"
                                    name="postalCode"
                                    placeholder="54000"
                                    value={shippingInfo.postalCode}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="checkout-trust-banner">
                        <div className="trust-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            <span>256-Bit SSL Encryption</span>
                        </div>
                        <div className="trust-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            <span>Guaranteed Safe Checkout</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Order Summary */}
                <div className="checkout-sidebar">
                    <div className="checkout-summary-card">
                        <h2>Order Summary</h2>

                        <div className="cart-items-list">
                            {cartItems.map((item) => (
                                <div className="checkout-item" key={item.id}>
                                    <div className="item-image-wrapper">
                                        <img
                                            src={item.image || 'https://via.placeholder.com/60'}
                                            alt={item.name}
                                        />
                                        <span className="item-qty-badge">{item.quantity}</span>
                                    </div>
                                    <div className="item-details">
                                        <h3>{item.name}</h3>
                                        <p className="item-unit-price">${Number(item.price).toFixed(2)} each</p>
                                    </div>
                                    <span className="item-total-price">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="summary-divider"></div>

                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>

                        <div className="summary-row">
                            <span>Shipping</span>
                            <span className="free-shipping-text">Free</span>
                        </div>

                        <div className="summary-divider"></div>

                        <div className="summary-row total-row">
                            <span>Total Due</span>
                            <span>${total.toFixed(2)}</span>
                        </div>

                        {error && (
                            <div className="checkout-error-banner">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="12" y1="8" x2="12" y2="12"/>
                                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn-pay-stripe"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="btn-spinner-wrapper">
                                    <span className="spinner"></span> Processing...
                                </span>
                            ) : (
                                <>
                                    <span>Pay with Stripe</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="5" y1="12" x2="19" y2="12"/>
                                        <polyline points="12 5 19 12 12 19"/>
                                    </svg>
                                </>
                            )}
                        </button>

                        <p className="checkout-security-note">
                            🔒 You will enter your credit card or payment details securely on <strong>Stripe Checkout</strong>.
                        </p>
                    </div>
                </div>
            </form>
        </div>
    )
}