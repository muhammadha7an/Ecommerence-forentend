import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  removeFromWishlist,
  clearWishlist
} from '../redux/slices/wishlistSlice'
import { addToCart } from '../redux/slices/cartSlice'
import { getImageUrl } from '../services/api'
import Icon from '../components/Icon'
import EmptyState from '../components/EmptyState'
import ProductCard from '../components/ProductCard'
import { getEffectivePrice, getStockLimit, sameProduct } from '../utils/commerce'
import '../style/pages/wishlist.css'

export default function Wishlist() {
  const dispatch = useDispatch()

  const wishlistItems = useSelector((state) => state.wishlist?.items || [])
  const allProducts = useSelector((state) => state.products?.items || [])

  const cartItems = useSelector((state) => state.cart?.items || [])

  // Wishlist entries are snapshots; read live price/stock from the catalog when available.
  const liveProduct = (item) => allProducts.find((product) => sameProduct(product, item)) || item
  const canAddToCart = (item) => {
    const product = liveProduct(item)
    const limit = getStockLimit(product)
    const inCart = cartItems.find((cartItem) => sameProduct(cartItem, product))?.quantity || 0
    return limit === null || inCart < limit
  }

  const handleAddToCart = (product) => {
    if (!canAddToCart(product)) return
    dispatch(addToCart(liveProduct(product)))
    dispatch(removeFromWishlist(product.id))
  }

  const handleRemove = (id) => {
    dispatch(removeFromWishlist(id))
  }

  // Moves only the items that can actually be bought; sold-out ones stay saved.
  const handleMoveAllToCart = () => {
    const movable = wishlistItems.filter(canAddToCart)
    movable.forEach((product) => {
      dispatch(addToCart(liveProduct(product)))
      dispatch(removeFromWishlist(product.id))
    })
  }

  const movableCount = wishlistItems.filter(canAddToCart).length

  const totalValue = wishlistItems.reduce(
    (sum, item) => sum + getEffectivePrice(liveProduct(item)),
    0
  )

  const wishlistIds = new Set(wishlistItems.map((item) => item.id))
  const popularProducts = allProducts
    .filter((product) => !wishlistIds.has(product.id))
    .slice(0, 4)

  const pageHead = (
    <section className="ui-page-head">
      <div className="aura-container">
        <nav className="ui-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <Icon name="chevronRight" />
          <span aria-current="page">Wishlist</span>
        </nav>
        <h1 className="ui-page-head__title">My wishlist</h1>
        <p className="ui-page-head__text">
          Keep track of pieces you love and move them to your cart when you're ready.
        </p>
      </div>
    </section>
  )

  // --- EMPTY WISHLIST STATE ---
  if (wishlistItems.length === 0) {
    return (
      <div className="wl-page">
        {pageHead}
        <div className="wl-container">
          <EmptyState
            icon="heart"
            title="Your wishlist is empty"
            text="Tap the heart on any product to save it here for later."
          >
            <Link to="/shop" className="ui-btn">
              Explore Products
            </Link>
          </EmptyState>

          {popularProducts.length > 0 && (
            <section className="wl-recs">
              <div className="wl-recs__head">
                <h2>Popular right now</h2>
                <p>Trending pieces you might love.</p>
              </div>
              <div className="wl-recs__grid">
                {popularProducts.map((product) => (
                  <ProductCard key={product.id || product._id} product={product} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    )
  }

  // --- MAIN WISHLIST VIEW ---
  return (
    <div className="wl-page">
      {pageHead}
      <div className="wl-container">
        {/* Summary + actions */}
        <div className="wl-toolbar">
          <dl className="wl-stats">
            <div>
              <dt>Saved items</dt>
              <dd>{wishlistItems.length}</dd>
            </div>
            <div>
              <dt>Estimated value</dt>
              <dd>${totalValue.toFixed(2)}</dd>
            </div>
          </dl>

          <div className="wl-toolbar__actions">
            <button type="button" className="ui-btn" onClick={handleMoveAllToCart} disabled={movableCount === 0}>
              <Icon name="bag" />
              {movableCount === wishlistItems.length ? 'Move All to Cart' : `Move ${movableCount} Available to Cart`}
            </button>
            <button
              type="button"
              className="ui-btn ui-btn--danger-soft"
              onClick={() => dispatch(clearWishlist())}
            >
              <Icon name="trash" />
              Clear All
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="wl-grid">
          {wishlistItems.map((product) => {
            const productLink = `/product/${product.id || product._id || product.legacyId}`
            const live = liveProduct(product)
            const isOutOfStock = getStockLimit(live) === 0
            const addable = canAddToCart(product)

            return (
              <article className="wl-card" key={product.id}>
                <div className="wl-card__media">
                  <Link to={productLink} aria-label={`View ${product.name}`}>
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      loading="lazy"
                    />
                  </Link>
                  <span className={`ui-badge ui-badge--dot ${isOutOfStock ? 'ui-badge--danger' : 'ui-badge--success'} wl-card__stock`}>
                    {isOutOfStock ? 'Out of stock' : 'In stock'}
                  </span>
                  <button
                    type="button"
                    className="wl-card__remove"
                    aria-label={`Remove ${product.name} from wishlist`}
                    title="Remove from wishlist"
                    onClick={() => handleRemove(product.id)}
                  >
                    <Icon name="close" />
                  </button>
                </div>

                <div className="wl-card__body">
                  <span className="wl-card__category">{product.category || 'General'}</span>
                  <h3 className="wl-card__name">
                    <Link to={productLink}>{product.name}</Link>
                  </h3>
                  <span className="wl-card__price">
                    ${getEffectivePrice(live).toFixed(2)}
                  </span>
                  <button
                    type="button"
                    className="ui-btn ui-btn--block"
                    onClick={() => handleAddToCart(product)}
                    disabled={!addable}
                  >
                    {isOutOfStock ? (
                      'Out of Stock'
                    ) : !addable ? (
                      'Maximum in cart'
                    ) : (
                      <>
                        <Icon name="bag" />
                        Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
