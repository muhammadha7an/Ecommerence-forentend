import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { addToCart } from '../redux/slices/cartSlice';
import { toggleWishlist } from '../redux/slices/wishlistSlice';
import authService from '../services/authService';
import { getImageUrl } from '../services/api';
import ProductCard from '../components/ProductCard';
import Icon from '../components/Icon';
import EmptyState from '../components/EmptyState';
import { useFreeShippingThreshold } from '../hooks/useShipping';
import { getEffectivePrice, getStockLimit, hasSalePrice, sameProduct, LOW_STOCK_LEVEL } from '../utils/commerce';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '../style/pages/product-details.css';

const productIdFor = (product) => product?._id || product?.id || product?.legacyId;

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const catalog = useSelector((state) => state.products.items || []);
  const wishlistItems = useSelector((state) => state.wishlist.items || []);
  const cartItems = useSelector((state) => state.cart.items || []);
  const freeShippingThreshold = useFreeShippingThreshold();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    let active = true;

    const loadProduct = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await authService.getProduct(id);
        if (active) setProduct(response?.product || null);
      } catch (err) {
        if (active) {
          setProduct(null);
          setError(err.response?.data?.message || 'Unable to load this product.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProduct();
    setQuantity(1);
    setActiveImage(0);

    return () => {
      active = false;
    };
  }, [id]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];

    const currentId = String(productIdFor(product));
    return catalog
      .filter((candidate) => {
        const sameCategory = product.categoryId
          ? String(candidate.categoryId) === String(product.categoryId)
          : candidate.category === product.category;
        return sameCategory && String(productIdFor(candidate)) !== currentId;
      })
      .slice(0, 8);
  }, [catalog, product]);

  if (loading) {
    return (
      <div className="pd-page">
        <div className="pd-container">
          <div className="pd-main" aria-busy="true">
            <div className="ui-skeleton pd-skeleton-img" />
            <div className="pd-skeleton-copy">
              <div className="ui-skeleton" style={{ height: 14, width: '30%' }} />
              <div className="ui-skeleton" style={{ height: 38, width: '80%' }} />
              <div className="ui-skeleton" style={{ height: 26, width: '25%' }} />
              <div className="ui-skeleton" style={{ height: 90 }} />
              <div className="ui-skeleton" style={{ height: 52 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pd-page">
        <div className="pd-container">
          <EmptyState
            icon="package"
            title="Product not found"
            text={error || 'This product is no longer available.'}
          >
            <Link to="/shop" className="ui-btn">
              <Icon name="arrowLeft" />
              Return to shop
            </Link>
          </EmptyState>
        </div>
      </div>
    );
  }

  const productId = productIdFor(product);
  const isWishlisted = wishlistItems.some((item) => String(productIdFor(item)) === String(productId));
  const images = [product.image, ...(Array.isArray(product.images) ? product.images : [])].filter(Boolean);
  const currentImage = images[activeImage] || images[0];
  const displayPrice = getEffectivePrice(product);
  const hasSale = hasSalePrice(product);
  const stock = getStockLimit(product);
  const isOutOfStock = stock === 0;
  const isLowStock = !isOutOfStock && stock !== null && stock <= LOW_STOCK_LEVEL;
  const rating = Number(product.rating || 0);

  // How many more units can go into the cart (respects what is already there).
  const inCart = cartItems.find((item) => sameProduct(item, product))?.quantity || 0;
  const remaining = stock === null ? Infinity : Math.max(0, stock - inCart);
  const selectedQuantity = Math.max(1, Math.min(quantity, Number.isFinite(remaining) ? Math.max(remaining, 1) : quantity));
  const cartIsFull = !isOutOfStock && remaining === 0;
  const atMaximum = Number.isFinite(remaining) && selectedQuantity >= remaining;

  const handleAddToCart = () => {
    if (isOutOfStock || cartIsFull) return;
    for (let index = 0; index < selectedQuantity; index += 1) dispatch(addToCart(product));
    navigate('/cart');
  };

  let stockNote = '';
  if (cartIsFull) {
    stockNote = `You already have ${inCart} in your cart — the maximum available.`;
  } else if (!isOutOfStock && atMaximum && Number.isFinite(remaining)) {
    stockNote = inCart > 0
      ? `Only ${stock} available. You can add ${remaining} more.`
      : `Only ${stock} ${stock === 1 ? 'item' : 'items'} available.`;
  }

  return (
    <div className="pd-page">
      <div className="pd-container">
        <nav className="ui-breadcrumb pd-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <Icon name="chevronRight" />
          <Link to="/shop">Shop</Link>
          {product.category && (
            <>
              <Icon name="chevronRight" />
              <Link to={`/shop?category=${encodeURIComponent(product.categoryId || product.category)}`}>
                {product.category}
              </Link>
            </>
          )}
          <Icon name="chevronRight" />
          <span aria-current="page">{product.name}</span>
        </nav>

        <section className="pd-main">
          {/* Gallery */}
          <div className="pd-gallery">
            <div className="pd-gallery__stage">
              {(product.isNew || product.isNewProduct) && <span className="pd-gallery__badge">New</span>}
              <img src={getImageUrl(currentImage)} alt={product.name} className="pd-gallery__img" />
            </div>

            {images.length > 1 && (
              <div className="pd-gallery__thumbs" role="tablist" aria-label="Product images">
                {images.map((image, index) => (
                  <button
                    type="button"
                    key={`${image}-${index}`}
                    className={`pd-gallery__thumb ${index === activeImage ? 'is-active' : ''}`}
                    onClick={() => setActiveImage(index)}
                    aria-label={`Show image ${index + 1}`}
                    aria-selected={index === activeImage}
                    role="tab"
                  >
                    <img src={getImageUrl(image)} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="pd-info">
            <span className="pd-info__category">{product.category || 'Essential'}</span>
            <h1 className="pd-info__title">{product.name}</h1>

            {rating > 0 && (
              <div className="pd-info__rating" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
                <span className="pd-info__stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Icon key={star} name="star" filled={star <= Math.round(rating)} />
                  ))}
                </span>
                <span>{rating.toFixed(1)} rating</span>
              </div>
            )}

            <div className="pd-info__price">
              <span className="pd-info__price-now">${displayPrice.toFixed(2)}</span>
              {hasSale && <span className="pd-info__price-was">${Number(product.price).toFixed(2)}</span>}
            </div>

            <p className="pd-info__desc">{product.description || 'Thoughtfully selected for everyday living.'}</p>

            <div className={`pd-stock ${isOutOfStock ? 'is-out' : isLowStock ? 'is-low' : 'is-in'}`}>
              <span className="pd-stock__dot" />
              {isOutOfStock
                ? 'Currently out of stock'
                : isLowStock
                  ? `Only ${stock} left in stock`
                  : 'In stock and ready to ship'}
            </div>

            <div className="pd-actions">
              <div className="ui-qty" aria-label="Quantity">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, selectedQuantity - 1))}
                  disabled={isOutOfStock || cartIsFull || selectedQuantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Icon name="minus" />
                </button>
                <span aria-live="polite">{isOutOfStock || cartIsFull ? 0 : selectedQuantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(selectedQuantity + 1)}
                  disabled={isOutOfStock || cartIsFull || atMaximum}
                  aria-label="Increase quantity"
                >
                  <Icon name="plus" />
                </button>
              </div>
              <button
                type="button"
                className="ui-btn ui-btn--lg pd-actions__add"
                onClick={handleAddToCart}
                disabled={isOutOfStock || cartIsFull}
              >
                {isOutOfStock ? (
                  'Out of Stock'
                ) : cartIsFull ? (
                  'Maximum in cart'
                ) : (
                  <>
                    <Icon name="bag" />
                    Add to cart
                  </>
                )}
              </button>
              <button
                type="button"
                className={`ui-btn ui-btn--secondary ui-btn--lg ui-btn--icon pd-actions__wish ${isWishlisted ? 'is-active' : ''}`}
                onClick={() => dispatch(toggleWishlist(product))}
                aria-pressed={isWishlisted}
                aria-label={isWishlisted ? 'Saved to wishlist' : 'Add to wishlist'}
                title={isWishlisted ? 'Saved' : 'Wishlist'}
              >
                <Icon name="heart" filled={isWishlisted} />
              </button>
            </div>

            {stockNote && (
              <p className="pd-stock-note" role="status">
                <Icon name="info" />
                {stockNote}
                {cartIsFull && <Link to="/cart" className="ui-link">View cart</Link>}
              </p>
            )}

            <ul className="pd-perks">
              <li>
                <Icon name="truck" />
                <span>
                  {freeShippingThreshold === 0 ? (
                    <><strong>Free shipping</strong> on every order</>
                  ) : freeShippingThreshold ? (
                    <><strong>Free shipping</strong> on orders of ${freeShippingThreshold.toFixed(2)} or more</>
                  ) : (
                    <><strong>Free shipping</strong> on qualifying orders</>
                  )}
                </span>
              </li>
              <li>
                <Icon name="rotateCcw" />
                <span>
                  <strong>30-day returns</strong> and easy exchanges
                </span>
              </li>
              <li>
                <Icon name="lock" />
                <span>
                  <strong>Secure checkout</strong> powered by Stripe
                </span>
              </li>
            </ul>

            <Link to="/shop" className="ui-link pd-back">
              <Icon name="arrowLeft" />
              Back to shop
            </Link>
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="pd-related">
            <div className="pd-related__head">
              <h2>More from this collection</h2>
              <p>Pieces that pair well with {product.name}.</p>
            </div>
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              spaceBetween={20}
              slidesPerView={1.3}
              breakpoints={{
                480: { slidesPerView: 2, spaceBetween: 16 },
                768: { slidesPerView: 3 },
                1200: { slidesPerView: 4 },
              }}
              className="aura-swiper related-products-slider"
            >
              {relatedProducts.map((relatedProduct) => (
                <SwiperSlide key={productIdFor(relatedProduct)}>
                  <ProductCard product={relatedProduct} />
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        )}
      </div>
    </div>
  );
}

export default ProductDetails;
