import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {
    increaseQuantity,
    decreaseQuantity,
    removeFromCart
} from '../redux/slices/cartSlice'
 

export default function Cart() {
    const dispatch = useDispatch()

    const cartItems = useSelector(
        (state) => state.cart?.items || []
    )

    const subtotal = cartItems.reduce(
        (total, item) => total + (item.price || 0) * (item.quantity || 1),
        0
    )

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
            <div className="cart-container">
                <div className="cart-empty-card">
                    <div className="empty-icon">🛒</div>
                    <h2>Your Cart is Empty</h2>
                    <p>Aap ke cart mein filhal koi item mojood nahi hai.</p>
                    <Link to="/shop" className="btn-shop-now">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="cart-container">
            <h1 className="cart-title">Shopping Cart</h1>

            <div className="cart-layout">
                <div className="cart-items-section">
                    {cartItems.map((item) => {
                        const price = item.price || 0
                        const quantity = item.quantity || 1
                        const itemTotal = price * quantity

                        return (
                            <article className="cart-item-card" key={item.id}>
                                <div className="cart-item-image">
                                    <img src={item.image} alt={item.name} />
                                </div>

                                <div className="cart-item-details">
                                    <h2 className="cart-item-name">{item.name}</h2>
                                    <p className="cart-item-price">${price.toFixed(2)}</p>

                                    <div className="cart-item-actions">
                                        <div className="quantity-selector">
                                            <button
                                                type="button"
                                                onClick={() => handleDecrease(item.id, quantity)}
                                                aria-label="Decrease quantity"
                                            >
                                                -
                                            </button>
                                            <span>{quantity}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleIncrease(item.id)}
                                                aria-label="Increase quantity"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            className="btn-remove"
                                            onClick={() => handleRemove(item.id)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>

                                <div className="cart-item-subtotal">
                                    ${itemTotal.toFixed(2)}
                                </div>
                            </article>
                        )
                    })}
                </div>

                <aside className="cart-summary-section">
                    <div className="summary-card">
                        <h2>Order Summary</h2>

                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>

                        <div className="summary-row">
                            <span>Shipping</span>
                            <span>Free</span>
                        </div>

                        <hr className="summary-divider" />

                        <div className="summary-row total">
                            <span>Total</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>

                        <Link to="/checkout" className="btn-checkout">
                            Proceed to Checkout
                        </Link>
                    </div>
                </aside>
            </div>
        </div>
    )
}