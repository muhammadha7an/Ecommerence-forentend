import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  removeFromWishlist,
  clearWishlist
} from '../redux/slices/wishlistSlice'
import { addToCart } from '../redux/slices/cartSlice'

import ProductCard from '../components/ProductCard'
 

export default function Wishlist() {
  const dispatch = useDispatch()

  const wishlistItems = useSelector((state) => state.wishlist?.items || [])
  const allProducts = useSelector((state) => state.products?.items || [])

  const handleAddToCart = (product) => {
    dispatch(addToCart(product))
    dispatch(removeFromWishlist(product.id))
  }

  const handleRemove = (id) => {
    dispatch(removeFromWishlist(id))
  }

  const handleMoveAllToCart = () => {
    wishlistItems.forEach((product) => {
      dispatch(addToCart(product))
    })
    dispatch(clearWishlist())
  }

  const totalValue = wishlistItems.reduce(
    (sum, item) => sum + (Number(item.price) || 0),
    0
  )

  const wishlistIds = new Set(wishlistItems.map((item) => item.id))
  const popularProducts = allProducts
    .filter((product) => !wishlistIds.has(product.id))
    .slice(0, 4)

  // --- EMPTY WISHLIST STATE ---
  if (wishlistItems.length === 0) {
    return (
      <div className="wl-page">
        <div className="wl-container">
          <div className="wl-empty-card">
            <div className="wl-empty-icon-box">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="wl-svg-icon"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </div>
            <h2 className="wl-empty-heading">Your Wishlist is Empty</h2>
            <p className="wl-empty-desc">
              Explore our store and save your favorite items to buy them later.
            </p>
            <Link to="/shop" className="wl-btn wl-btn-primary wl-btn-lg">
              Explore Products
            </Link>
          </div>

          {popularProducts.length > 0 && (
            <section className="wl-recommendations-section">
              <div className="wl-section-title">
                <h2 className="wl-section-heading">Popular Products</h2>
                <p className="wl-section-subheading">Trending items you might love</p>
              </div>
              <div className="wl-recommendations-grid">
                {popularProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
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
      <div className="wl-container">
        
        {/* Header Section */}
        <div className="wl-header">
          <div className="wl-header-info">
            <h1 className="wl-main-heading">My Saved Wishlist</h1>
            <p className="wl-subtitle">
              Manage your saved items or add them directly to your shopping cart.
            </p>
          </div>

          <div className="wl-header-actions">
            <button
              className="wl-btn wl-btn-secondary"
              onClick={handleMoveAllToCart}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="wl-svg-icon"
              >
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              Move All to Cart
            </button>

            <button
              className="wl-btn wl-btn-danger-outline"
              onClick={() => dispatch(clearWishlist())}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="wl-svg-icon"
              >
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Clear All
            </button>
          </div>
        </div>

        {/* Stats Summary Bar */}
        <div className="wl-summary-bar">
          <div className="wl-stat-item">
            <span className="wl-stat-label">Saved Items</span>
            <span className="wl-stat-value">{wishlistItems.length} Products</span>
          </div>
          <div className="wl-stat-divider"></div>
          <div className="wl-stat-item">
            <span className="wl-stat-label">Estimated Total Value</span>
            <span className="wl-stat-value">${totalValue.toFixed(2)}</span>
          </div>
          <div className="wl-stat-divider"></div>
          <div className="wl-stat-item">
            <span className="wl-stat-label">Availability</span>
            <span className="wl-stat-value wl-text-success">In Stock</span>
          </div>
        </div>

        {/* Wishlist Items Grid */}
        <div className="wl-grid">
          {wishlistItems.map((product) => (
            <article className="wl-card" key={product.id}>
              <div className="wl-card-image-wrapper">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  loading="lazy" 
                  className="wl-card-img"
                />
                <span className="wl-stock-badge">In Stock</span>
                <button
                  className="wl-remove-btn"
                  title="Remove from wishlist"
                  onClick={() => handleRemove(product.id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="wl-svg-icon"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className="wl-card-content">
                <span className="wl-category-tag">
                  {product.category || 'General'}
                </span>
                <h3 className="wl-product-title">{product.name}</h3>
                <div className="wl-price-row">
                  <span className="wl-current-price">
                    ${product.price ? product.price.toFixed(2) : '0.00'}
                  </span>
                </div>

                <div className="wl-card-footer">
                  <button
                    className="wl-btn wl-btn-primary wl-btn-block"
                    onClick={() => handleAddToCart(product)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="wl-svg-icon"
                    >
                      <circle cx="9" cy="21" r="1"></circle>
                      <circle cx="20" cy="21" r="1"></circle>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    Add to Cart
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </div>
  )
}