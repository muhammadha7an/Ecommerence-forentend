import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import ProductCard from '../components/ProductCard';
import { addToCart, increaseQuantity } from '../redux/slices/cartSlice';
import authService from '../services/authService';
import { getImageUrl } from '../services/api';
import '../style/product-details.css';

const getProductId = (product) => product?.id || product?._id || product?.legacyId;

const sameId = (left, right) => left !== undefined && right !== undefined && String(left) === String(right);

export default function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const catalog = useSelector((state) => state.products.items || []);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let active = true;

    const loadProduct = async () => {
      setLoading(true);
      setError('');
      setProduct(null);
      setQuantity(1);

      try {
        if (!id) {
          throw new Error('Invalid product ID');
        }

        const response = await authService.getProduct(id);
        if (active) {
          if (!response.product) {
            setError('Product not found.');
          } else {
            setProduct(response.product);
          }
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.response?.data?.message || 'Unable to load this product.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProduct();
    return () => {
      active = false;
    };
  }, [id]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];

    const productId = getProductId(product);
    const sameCategory = catalog.filter((item) =>
      !sameId(getProductId(item), productId) &&
      item.category && product.category && item.category.toLowerCase() === product.category.toLowerCase()
    );
    const remaining = catalog.filter((item) => !sameId(getProductId(item), productId) && !sameCategory.includes(item));
    return [...sameCategory, ...remaining].slice(0, 8);
  }, [catalog, product]);

  const handleAddToCart = () => {
    if (!product || product.inStock === false || Number(product.stock) <= 0) return;
    dispatch(addToCart(product));
    for (let index = 1; index < quantity; index += 1) {
      dispatch(increaseQuantity(getProductId(product)));
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  if (loading) {
    return <main className="product-details-page"><div className="product-details-state">Loading product...</div></main>;
  }

  if (error || !product) {
    return (
      <main className="product-details-page">
        <div className="product-details-state product-details-error">
          <h1>Product unavailable</h1>
          <p>{error || 'We could not find that product.'}</p>
          <Link className="product-details-back" to="/shop">Return to shop</Link>
        </div>
      </main>
    );
  }

  const available = product.inStock !== false && Number(product.stock ?? 0) > 0;
  const price = product.salePrice ?? product.price;
  const image = product.image || product.images?.[0];

  return (
    <main className="product-details-page">
      <div className="product-details-container">
        <Link className="product-details-back" to="/shop">Back to shop</Link>
        <section className="product-details-hero">
          <div className="product-details-media">
            {image ? <img src={getImageUrl(image)} alt={product.name} /> : <div className="product-details-image-missing">No image available</div>}
          </div>
          <div className="product-details-copy">
            <span className="product-details-category">{product.category || 'Essential'}</span>
            <h1>{product.name}</h1>
            <p className="product-details-price">${Number(price || 0).toFixed(2)}</p>
            <p className="product-details-description">{product.description || 'Thoughtfully selected for everyday living.'}</p>
            <p className={`product-details-stock ${available ? '' : 'out-of-stock'}`}>
              {available ? `${product.stock} available` : 'Currently out of stock'}
            </p>
            {available && (
              <div className="product-details-purchase">
                <label htmlFor="product-quantity">Quantity</label>
                <div className="product-details-controls">
                  <input
                    id="product-quantity"
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(event) => setQuantity(Math.min(product.stock, Math.max(1, Number(event.target.value) || 1)))}
                  />
                  <button type="button" className="product-details-add" onClick={handleAddToCart}>
                    {added ? 'Added to cart' : 'Add to cart'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="related-products-section">
            <div className="related-products-heading">
              <div>
                <span>Continue exploring</span>
                <h2>Related products</h2>
              </div>
            </div>
            <Swiper
              modules={[Navigation, Pagination, A11y]}
              navigation
              pagination={{ clickable: true }}
              spaceBetween={18}
              slidesPerView={1.2}
              breakpoints={{ 480: { slidesPerView: 2 }, 768: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } }}
              className="related-products-slider"
            >
              {relatedProducts.map((related) => (
                <SwiperSlide key={getProductId(related)}><ProductCard product={related} /></SwiperSlide>
              ))}
            </Swiper>
          </section>
        )}
      </div>
    </main>
  );
}