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
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '../style/ProductDetails.css';

const productIdFor = (product) => product?._id || product?.id || product?.legacyId;

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const catalog = useSelector((state) => state.products.items || []);
  const wishlistItems = useSelector((state) => state.wishlist.items || []);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    return <main className="product-details-page"><p className="product-details-state">Loading product details...</p></main>;
  }

  if (error || !product) {
    return (
      <main className="product-details-page">
        <div className="product-details-state">
          <h1>Product not found</h1>
          <p>{error || 'This product is no longer available.'}</p>
          <Link to="/shop" className="product-details-back-link">Return to shop</Link>
        </div>
      </main>
    );
  }

  const productId = productIdFor(product);
  const isWishlisted = wishlistItems.some((item) => String(productIdFor(item)) === String(productId));
  const images = [product.image, ...(Array.isArray(product.images) ? product.images : [])].filter(Boolean);

  const handleAddToCart = () => {
    for (let index = 0; index < quantity; index += 1) dispatch(addToCart(product));
    navigate('/cart');
  };

  return (
    <main className="product-details-page">
      <div className="product-details-container">
        <Link to="/shop" className="product-details-back-link">Back to shop</Link>

        <section className="product-details-main">
          <div className="product-details-gallery">
            <img src={getImageUrl(images[0])} alt={product.name} className="product-details-image" />
          </div>

          <div className="product-details-copy">
            <span className="product-details-category">{product.category || 'Essential'}</span>
            <h1>{product.name}</h1>
            <p className="product-details-price">${Number(product.salePrice || product.price || 0).toFixed(2)}</p>
            <p className="product-details-description">{product.description || 'Thoughtfully selected for everyday living.'}</p>

            <div className="product-details-actions">
              <div className="product-quantity-control" aria-label="Quantity">
                <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity">-</button>
                <span>{quantity}</span>
                <button type="button" onClick={() => setQuantity((value) => value + 1)} aria-label="Increase quantity">+</button>
              </div>
              <button type="button" className="product-details-add" onClick={handleAddToCart}>Add to cart</button>
              <button
                type="button"
                className={`product-details-wishlist ${isWishlisted ? 'active' : ''}`}
                onClick={() => dispatch(toggleWishlist(product))}
              >
                {isWishlisted ? 'Saved' : 'Wishlist'}
              </button>
            </div>
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="related-products-section">
            <div className="related-products-heading">
              <div>
                <span className="product-details-category">More from this collection</span>
                <h2>Related Products</h2>
              </div>
            </div>
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              spaceBetween={20}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2 },
                960: { slidesPerView: 3 },
                1200: { slidesPerView: 4 },
              }}
              className="related-products-slider"
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
    </main>
  );
}

export default ProductDetails;