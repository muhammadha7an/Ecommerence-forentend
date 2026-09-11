import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { addToCart } from '../redux/slices/cartSlice';
import { toggleWishlist } from '../redux/slices/wishlistSlice';
import { getImageUrl } from '../services/api';
import Icon from './Icon.jsx';
import { getEffectivePrice, getStockLimit, hasSalePrice, sameProduct } from '../utils/commerce';
import '../style/components/product-card.css';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const [added, setAdded] = useState(false);

  const wishlistItems = useSelector((state) => state.wishlist.items || []);
  const cartItems = useSelector((state) => state.cart.items || []);

  const isWishlisted = wishlistItems.some(
    (item) =>
      (product._id && item._id && String(item._id) === String(product._id)) ||
      (product.id && item.id && String(item.id) === String(product.id)) ||
      (product.id && item._id && String(item._id) === String(product.id)) ||
      (product._id && item.id && String(item.id) === String(product._id))
  );

  const imageUrl = getImageUrl(product.image);
  const productId = product.id || product._id || product.legacyId;
  const stockLimit = getStockLimit(product);
  const isOutOfStock = stockLimit === 0;
  const inCart = cartItems.find((item) => sameProduct(item, product))?.quantity || 0;
  const reachedLimit = !isOutOfStock && stockLimit !== null && inCart >= stockLimit;
  const rating = Number(product.rating || 0);
  const price = getEffectivePrice(product);

  const handleAddToCart = () => {
    if (isOutOfStock || reachedLimit) return;
    dispatch(addToCart(product));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const buttonLabel = isOutOfStock ? 'Out of Stock' : reachedLimit ? 'Max in cart' : added ? 'Added' : 'Add';
  const buttonTitle = isOutOfStock
    ? 'This product is out of stock'
    : reachedLimit
      ? `Only ${stockLimit} available — all of them are in your cart`
      : 'Add to cart';

  return (
    <article className="product-card">
      <div className="product-card__media">
        <div className="product-card__badges">
          {(product.isNew || product.isNewProduct) && (
            <span className="product-card__badge">New</span>
          )}
          {isOutOfStock && (
            <span className="product-card__badge product-card__badge--muted">Sold out</span>
          )}
        </div>

        <button
          type="button"
          className={`product-card__wish ${isWishlisted ? 'is-active' : ''}`}
          onClick={() => dispatch(toggleWishlist(product))}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={isWishlisted}
        >
          <Icon name="heart" filled={isWishlisted} />
        </button>

        <Link to={`/product/${productId}`} className="product-card__image-link" aria-label={`View ${product.name}`}>
          <img
            src={imageUrl}
            alt={product.name}
            className="product-card__img"
            loading="lazy"
          />
        </Link>
      </div>

      <div className="product-card__body">
        <div className="product-card__meta">
          <span className="product-card__category">{product.category || 'Essential'}</span>
          {rating > 0 && (
            <span className="product-card__rating" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
              <Icon name="star" filled />
              {rating.toFixed(1)}
            </span>
          )}
        </div>

        <h3 className="product-card__name">
          <Link to={`/product/${productId}`}>{product.name}</Link>
        </h3>

        <div className="product-card__footer">
          <span className="product-card__price">
            ${price.toFixed(2)}
            {hasSalePrice(product) && (
              <s className="product-card__price-was">${Number(product.price).toFixed(2)}</s>
            )}
          </span>

          <button
            type="button"
            className={`product-card__add ${added ? 'is-added' : ''} ${isOutOfStock ? 'is-soldout' : ''}`}
            onClick={handleAddToCart}
            disabled={isOutOfStock || reachedLimit}
            title={buttonTitle}
            aria-label={`${buttonLabel}: ${product.name}`}
            aria-live="polite"
          >
            {!isOutOfStock && <Icon name={added ? 'check' : 'bag'} />}
            <span>{buttonLabel}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
