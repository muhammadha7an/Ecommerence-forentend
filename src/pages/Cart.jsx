import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clampCartQuantities
} from '../redux/slices/cartSlice'
import { getImageUrl } from '../services/api'
import Icon from '../components/Icon'
import EmptyState from '../components/EmptyState'
import useShipping from '../hooks/useShipping'
import { getStockLimit } from '../utils/commerce'
import '../style/pages/cart.css'

// Stock state of a cart line, based on the latest catalog data synced into the cart.
const getLineStatus = (item) => {
    const quantity = item.quantity || 1
    const limit = getStockLimit(item)

    if (item.isUnavailable) return { blocking: true, tone: 'error', text: 'This product is no longer available. Please remove it.' }
    if (limit === 0) return { blocking: true, tone: 'error', text: 'Out of stock. Please remove it to continue.' }
    if (limit !== null && quantity > limit) {
        return { blocking: true, tone: 'error', text: `Only ${limit} available. Please reduce the quantity.`, fixTo: limit }
    }
    if (limit !== null && quantity === limit) return { blocking: false, tone: 'info', text: 'Maximum available quantity reached.', atMax: true }
    return { blocking: false, tone: null, text: '' }
}

export default function Cart() {
    const dispatch = useDispatch()

    const cartItems = useSelector(
        (state) => state.cart?.items || []
    )

    const subtotal = cartItems.reduce(
        (total, item) => total + (item.price || 0) * (item.quantity || 1),
        0
    )

    const itemCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0)
    const shipping = useShipping(subtotal)
    const hasBlockingIssue = cartItems.some((item) => getLineStatus(item).blocking)

    const handleIncrease = (id) => {
        dispatch(increaseQuantity(id))
    }

    const handleDecrease = (id, currentQuantity) => {
        if (currentQuantity > 1) {
            dispatch(decreaseQuantity(id))
        } else {
            dispatch(removeFromCart(id))
        }
    }

    const handleRemove = (id) => {
        dispatch(removeFromCart(id))
    }

    if (cartItems.length === 0) {
        return (
            <div className="cart-page">
                <div className="cart-container">
                    <EmptyState
                        icon="bag"
                        title="Your cart is empty"
                        text="Nothing here yet. Browse the collection and add the pieces you love."
                    >
                        <Link to="/shop" className="ui-btn">
                            Continue Shopping
                        </Link>
                        <Link to="/wishlist" className="ui-btn ui-btn--secondary">
                            <Icon name="heart" />
                            View Wishlist
                        </Link>
                    </EmptyState>
                </div>
            </div>
        )
    }

    return (
        <div className="cart-page">
            <div className="cart-container">
                <div className="cart-head">
                    <nav className="ui-breadcrumb" aria-label="Breadcrumb">
                        <Link to="/">Home</Link>
                        <Icon name="chevronRight" />
                        <span aria-current="page">Cart</span>
                    </nav>
                    <h1 className="cart-title">Shopping cart</h1>
                    <p className="cart-subtitle">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
                    </p>
                </div>

                <div className="cart-layout">
                    <section className="cart-items" aria-label="Cart items">
                        <div className="cart-items__header" aria-hidden="true">
                            <span>Product</span>
                            <span>Quantity</span>
                            <span>Total</span>
                        </div>

                        {cartItems.map((item) => {
                            const price = Number(item.price || 0)
                            const quantity = item.quantity || 1
                            const itemTotal = price * quantity
                            const productLink = `/product/${item.id || item._id || item.legacyId}`
                            const status = getLineStatus(item)
                            const onSale = Number(item.originalPrice) > price

                            return (
                                <article className={`cart-item ${status.blocking ? 'has-issue' : ''}`} key={item.id}>
                                    <Link to={productLink} className="cart-item__image">
                                        <img src={getImageUrl(item.image)} alt={item.name} />
                                    </Link>

                                    <div className="cart-item__info">
                                        {item.category && <span className="cart-item__category">{item.category}</span>}
                                        <h2 className="cart-item__name">
                                            <Link to={productLink}>{item.name}</Link>
                                        </h2>
                                        <p className="cart-item__price">
                                            ${price.toFixed(2)} each
                                            {onSale && <s> ${Number(item.originalPrice).toFixed(2)}</s>}
                                        </p>
                                        {status.text && (
                                            <p className={`cart-item__stock cart-item__stock--${status.tone}`} role={status.blocking ? 'alert' : undefined}>
                                                <Icon name={status.blocking ? 'alertCircle' : 'info'} />
                                                <span>{status.text}</span>
                                                {status.fixTo > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => dispatch(clampCartQuantities([{ productId: item.id, available: status.fixTo }]))}
                                                    >
                                                        Set to {status.fixTo}
                                                    </button>
                                                )}
                                            </p>
                                        )}
                                        <button
                                            type="button"
                                            className="cart-item__remove"
                                            onClick={() => handleRemove(item.id)}
                                        >
                                            <Icon name="trash" />
                                            Remove
                                        </button>
                                    </div>

                                    <div className="cart-item__qty">
                                        <div className="ui-qty ui-qty--sm">
                                            <button
                                                type="button"
                                                onClick={() => handleDecrease(item.id, quantity)}
                                                aria-label={quantity > 1 ? 'Decrease quantity' : 'Remove item'}
                                            >
                                                <Icon name={quantity > 1 ? 'minus' : 'trash'} />
                                            </button>
                                            <span>{quantity}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleIncrease(item.id)}
                                                disabled={status.atMax || status.blocking}
                                                aria-label="Increase quantity"
                                                title={status.atMax ? 'Maximum available quantity reached' : 'Increase quantity'}
                                            >
                                                <Icon name="plus" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="cart-item__total">
                                        ${itemTotal.toFixed(2)}
                                    </div>
                                </article>
                            )
                        })}

                        <Link to="/shop" className="ui-link cart-continue">
                            <Icon name="arrowLeft" />
                            Continue shopping
                        </Link>
                    </section>

                    <aside className="cart-summary" aria-label="Order summary">
                        <h2>Order summary</h2>

                        {shipping.ready && shipping.threshold > 0 && (
                            <div className="cart-shipping-meter">
                                <p>
                                    {shipping.isFree ? (
                                        <>
                                            <Icon name="checkCircle" />
                                            You qualify for FREE shipping!
                                        </>
                                    ) : (
                                        <>
                                            <Icon name="truck" />
                                            Add ${shipping.amountToFree.toFixed(2)} more to get FREE shipping.
                                        </>
                                    )}
                                </p>
                                <div className="cart-shipping-meter__track">
                                    <span style={{ width: `${shipping.progress}%` }} />
                                </div>
                            </div>
                        )}

                        <div className="cart-summary__row">
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>

                        <div className="cart-summary__row">
                            <span>Shipping</span>
                            {!shipping.ready ? (
                                <span className="cart-summary__muted">Calculated at checkout</span>
                            ) : shipping.isFree ? (
                                <span className="cart-summary__free">FREE</span>
                            ) : (
                                <span>${shipping.shippingFee.toFixed(2)}</span>
                            )}
                        </div>

                        <div className="cart-summary__row cart-summary__row--total">
                            <span>Total</span>
                            <span>${shipping.total.toFixed(2)}</span>
                        </div>

                        {hasBlockingIssue ? (
                            <>
                                <div className="ui-alert ui-alert--error" role="alert">
                                    <Icon name="alertCircle" />
                                    <span>Some items need your attention before checkout.</span>
                                </div>
                                <button type="button" className="ui-btn ui-btn--lg ui-btn--block" disabled>
                                    <Icon name="lock" />
                                    Proceed to Checkout
                                </button>
                            </>
                        ) : (
                            <Link to="/checkout" className="ui-btn ui-btn--lg ui-btn--block">
                                <Icon name="lock" />
                                Proceed to Checkout
                            </Link>
                        )}

                        <p className="cart-summary__note">
                            Final prices and stock are confirmed securely at checkout.
                        </p>
                    </aside>
                </div>
            </div>
        </div>
    )
}
