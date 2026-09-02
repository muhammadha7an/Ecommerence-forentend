import { useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import { toggleWishlist } from '../redux/slices/wishlistSlice';




export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const [added, setAdded] = useState(false);
 

const wishlistItems = useSelector(
    (state) => state.wishlist.items
);

const isWishlisted = wishlistItems.some(
    (item) => item.id === product.id
);

  const handleAddToCart = () => {
    dispatch(addToCart(product));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <article className="product-card">
      <div className="product-image-container">
        {product.isNew && <span className="product-badge">New</span>}
        
         <button
                className={`wishlist-toggle ${isWishlisted ? 'active' : ''}`}
                onClick={() => dispatch(toggleWishlist(product))}
                aria-label={
                    isWishlisted
                        ? 'Remove from wishlist'
                        : 'Add to wishlist'
                }
            >
          <svg viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>





 
        <img src={product.image} alt={product.name} className="product-img" />
      </div>

      <div className="product-info">
        <span className="product-meta">{product.category || 'Essential'}</span>
        <h3 className="product-name">{product.name}</h3>

        <div className="product-action-row">
          <span className="product-price">
            ${product.price ? product.price.toFixed(2) : '0.00'}
          </span>

          <button 
            className={`add-cart-btn ${added ? 'success' : ''}`} 
            onClick={handleAddToCart}
          >
            {added ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Added
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}