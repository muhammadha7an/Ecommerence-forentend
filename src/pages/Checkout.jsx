import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { clampCartQuantities } from '../redux/slices/cartSlice'
import useShipping from '../hooks/useShipping'
import { getStockLimit } from '../utils/commerce'
import { API_BASE_URL, getImageUrl } from '../services/api'
import Icon from '../components/Icon'
import EmptyState from '../components/EmptyState'
import '../style/pages/checkout.css'


export default function Checkout() {
    const cartItems = useSelector((state) => state.cart.items)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [stockIssues, setStockIssues] = useState([])

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
    // Display only — the server recalculates prices, stock and shipping when the payment starts.
    const shippingQuote = useShipping(subtotal)
    const total = shippingQuote.total

    const cartNeedsAttention = cartItems.some((item) => {
        const limit = getStockLimit(item)
        return item.isUnavailable || limit === 0 || (limit !== null && (item.quantity || 1) > limit)
    })

    const applyAvailableQuantities = () => {
        dispatch(clampCartQuantities(stockIssues))
        setStockIssues([])
        setError('')
        navigate('/cart')
    }

    const handlePayment = async (e) => {
        e.preventDefault()

        try {
            setLoading(true)
            setError('')
            setStockIssues([])

            const response = await fetch(`${API_BASE_URL}/api/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    // Only ids and quantities are sent; the server looks up prices itself.
                    items: cartItems.map((item) => ({
                        id: item._id || item.id,
                        quantity: item.quantity,
                        name: item.name,
                    })),
                    shippingDetails: shippingInfo,
                    origin: window.location.origin,
                })
            })

            const data = await response.json().catch(() => ({}))

            if (!response.ok) {
                if (response.status === 409 && Array.isArray(data.issues)) {
                    setStockIssues(data.issues)
                }
                if (response.status === 401) {
                    throw new Error('Your session has expired. Please sign in again to continue.')
                }
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
            <div className="co-page">
                <div className="co-container">
                    <EmptyState
                        icon="cart"
                        title="Your cart is empty"
                        text="You haven't added any products to your cart yet."
                    >
                        <Link to="/shop" className="ui-btn">
                            Continue Shopping
                        </Link>
                    </EmptyState>
                </div>
            </div>
        )
    }

    const itemCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)

    return (
        <div className="co-page">
            <div className="co-container">
                <div className="co-head">
                    <ol className="co-steps" aria-label="Checkout progress">
                        <li className="is-done">
                            <span><Icon name="check" /></span>
                            <Link to="/cart">Cart</Link>
                        </li>
                        <li className="is-current" aria-current="step">
                            <span>2</span>
                            Details
                        </li>
                        <li>
                            <span>3</span>
                            Payment
                        </li>
                    </ol>
                    <h1 className="co-title">Secure checkout</h1>
                    <p className="co-subtitle">Complete your shipping details to proceed to secure payment.</p>
                </div>

                <form onSubmit={handlePayment} className="co-layout">
                    {/* Left Column: Shipping & Customer Details */}
                    <div className="co-main">
                        <section className="co-card">
                            <div className="co-card__head">
                                <span className="co-card__icon"><Icon name="mapPin" /></span>
                                <div>
                                    <h2>Shipping address</h2>
                                    <p>Where should we deliver your order?</p>
                                </div>
                            </div>

                            <div className="ui-form-grid">
                                <div className="ui-field ui-field--full">
                                    <label className="ui-label" htmlFor="fullName">Full name <span className="ui-required">*</span></label>
                                    <input
                                        className="ui-input"
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        autoComplete="name"
                                        placeholder="e.g. John Doe"
                                        value={shippingInfo.fullName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="ui-field">
                                    <label className="ui-label" htmlFor="email">Email address <span className="ui-required">*</span></label>
                                    <input
                                        className="ui-input"
                                        type="email"
                                        id="email"
                                        name="email"
                                        autoComplete="email"
                                        placeholder="john@example.com"
                                        value={shippingInfo.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="ui-field">
                                    <label className="ui-label" htmlFor="phone">Phone number <span className="ui-required">*</span></label>
                                    <input
                                        className="ui-input"
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        autoComplete="tel"
                                        placeholder="+92 300 1234567"
                                        value={shippingInfo.phone}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="ui-field ui-field--full">
                                    <label className="ui-label" htmlFor="address">Street address <span className="ui-required">*</span></label>
                                    <input
                                        className="ui-input"
                                        type="text"
                                        id="address"
                                        name="address"
                                        autoComplete="street-address"
                                        placeholder="House/Apartment #, Street name"
                                        value={shippingInfo.address}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="ui-field">
                                    <label className="ui-label" htmlFor="city">City <span className="ui-required">*</span></label>
                                    <input
                                        className="ui-input"
                                        type="text"
                                        id="city"
                                        name="city"
                                        autoComplete="address-level2"
                                        placeholder="Lahore, Karachi, etc."
                                        value={shippingInfo.city}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="ui-field">
                                    <label className="ui-label" htmlFor="postalCode">Postal code</label>
                                    <input
                                        className="ui-input"
                                        type="text"
                                        id="postalCode"
                                        name="postalCode"
                                        autoComplete="postal-code"
                                        placeholder="54000"
                                        value={shippingInfo.postalCode}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="co-card co-card--muted">
                            <div className="co-card__head">
                                <span className="co-card__icon"><Icon name="creditCard" /></span>
                                <div>
                                    <h2>Payment</h2>
                                    <p>You will enter your card details securely on Stripe Checkout after this step.</p>
                                </div>
                            </div>
                            <div className="co-trust">
                                <span><Icon name="lock" /> 256-bit SSL encryption</span>
                                <span><Icon name="shieldCheck" /> Guaranteed safe checkout</span>
                                <span><Icon name="rotateCcw" /> 30-day returns</span>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Order Summary */}
                    <aside className="co-summary" aria-label="Order summary">
                        <div className="co-summary__head">
                            <h2>Order summary</h2>
                            <Link to="/cart" className="ui-link">Edit cart</Link>
                        </div>

                        <ul className="co-items">
                            {cartItems.map((item) => (
                                <li className="co-item" key={item.id}>
                                    <div className="co-item__image">
                                        <img
                                            src={getImageUrl(item.image)}
                                            alt={item.name}
                                        />
                                        <span className="co-item__qty">{item.quantity}</span>
                                    </div>
                                    <div className="co-item__info">
                                        <h3>{item.name}</h3>
                                        <p>${Number(item.price).toFixed(2)} each</p>
                                    </div>
                                    <span className="co-item__total">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <div className="co-summary__rows">
                            <div className="co-summary__row">
                                <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="co-summary__row">
                                <span>Shipping</span>
                                {!shippingQuote.ready ? (
                                    <span className="co-summary__muted">Calculated at payment</span>
                                ) : shippingQuote.isFree ? (
                                    <span className="co-summary__free">FREE</span>
                                ) : (
                                    <span>${shippingQuote.shippingFee.toFixed(2)}</span>
                                )}
                            </div>
                            {shippingQuote.ready && !shippingQuote.isFree && shippingQuote.amountToFree > 0 && (
                                <p className="co-summary__hint">
                                    <Icon name="truck" />
                                    Add ${shippingQuote.amountToFree.toFixed(2)} more to get FREE shipping.
                                </p>
                            )}
                            <div className="co-summary__row co-summary__row--total">
                                <span>Total due</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>

                        {error && (
                            <div className="ui-alert ui-alert--error" role="alert">
                                <Icon name="alertCircle" />
                                <div>
                                    <span>{error}</span>
                                    {stockIssues.length > 0 && (
                                        <>
                                            <ul className="co-issues">
                                                {stockIssues.map((issue) => (
                                                    <li key={issue.productId}>
                                                        <strong>{issue.name}</strong>: you asked for {issue.requested},{' '}
                                                        {issue.available > 0 ? `only ${issue.available} available` : 'now out of stock'}
                                                    </li>
                                                ))}
                                            </ul>
                                            <button type="button" className="ui-btn ui-btn--secondary ui-btn--sm" onClick={applyAvailableQuantities}>
                                                Update my cart
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {cartNeedsAttention && !error && (
                            <div className="ui-alert ui-alert--error" role="alert">
                                <Icon name="alertCircle" />
                                <span>
                                    Some items are out of stock or exceed the available quantity.{' '}
                                    <Link to="/cart" className="ui-link">Review your cart</Link>
                                </span>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="ui-btn ui-btn--lg ui-btn--block co-pay"
                            disabled={loading || cartNeedsAttention}
                        >
                            {loading ? (
                                <>
                                    <span className="ui-spinner" aria-hidden="true"></span>
                                    Redirecting to Stripe...
                                </>
                            ) : (
                                <>
                                    <Icon name="lock" />
                                    Pay with Stripe
                                </>
                            )}
                        </button>

                        <p className="co-summary__note">
                            <Icon name="shieldCheck" />
                            Payments are processed by <strong>Stripe</strong>. We never store your card details.
                        </p>
                    </aside>
                </form>
            </div>
        </div>
    )
}
