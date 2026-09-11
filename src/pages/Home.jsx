import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import NewsletterForm from '../components/NewsletterForm';
import Icon from '../components/Icon';
import { getImageUrl } from '../services/api';
import { useFreeShippingThreshold } from '../hooks/useShipping';
import { freeShippingPhrase, getEffectivePrice } from '../utils/commerce';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, A11y } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '../style/pages/home.css';

const testimonials = [
  {
    id: 1,
    name: 'Sarah M.',
    role: 'Verified Buyer',
    comment: 'The quality of these products exceeded my expectations. Minimal, beautiful, and built to last.',
    rating: 5,
  },
  {
    id: 2,
    name: 'David K.',
    role: 'Verified Buyer',
    comment: 'Fast shipping and eco-friendly packaging. Aura has become my go-to for home essentials.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Elena R.',
    role: 'Interior Designer',
    comment: 'Thoughtfully designed pieces that blend seamlessly into modern aesthetics. Highly recommended!',
    rating: 5,
  },
];

const instagramPosts = [
  'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&q=80&w=400',
];

const promises = [
  { icon: 'truck', title: 'Free Shipping', text: 'dynamic' },
  { icon: 'leaf', title: 'Sustainable Quality', text: 'Ethically sourced materials' },
  { icon: 'rotateCcw', title: '30-Day Guarantee', text: 'Hassle-free exchanges' },
  { icon: 'lock', title: 'Secure Checkout', text: 'Payments protected by Stripe' },
];

export default function Home() {
  const products = useSelector((state) => state.products.items) || [];
  const categories = useSelector((state) => state.categories.items) || [];
  const freeShippingThreshold = useFreeShippingThreshold();
  const shippingPhrase = freeShippingPhrase(freeShippingThreshold);

  // A real catalog product is pinned to the hero image as a shoppable tag
  const heroProduct = products.find((product) => product.isFeatured) || products[0] || null;
  const heroProductId = heroProduct ? heroProduct.id || heroProduct._id || heroProduct.legacyId : null;

  return (
    <div className="home-page">
      {/* 1. HERO */}
      <section className="home-hero">
        <div className="home-hero__inner">
          <div className="home-hero__copy">
            <p className="home-hero__kicker">A considered collection</p>
            <h1 className="home-hero__title">Simple things, thoughtfully chosen.</h1>
            <p className="home-hero__text">
              Explore useful, beautifully crafted pieces designed to fit naturally into everyday living.
            </p>
            <div className="home-hero__actions">
              <Link className="ui-btn ui-btn--lg" to="/shop">
                Browse Shop
                <Icon name="arrowRight" />
              </Link>
              <a className="ui-btn ui-btn--secondary ui-btn--lg" href="#categories">
                Explore Categories
              </a>
            </div>
            <dl className="home-hero__facts">
              <div>
                <dt>{products.length}</dt>
                <dd>Products in the shop</dd>
              </div>
              <div>
                <dt>{categories.length}</dt>
                <dd>Curated categories</dd>
              </div>
              {freeShippingThreshold !== null && (
                <div>
                  <dt>{freeShippingThreshold === 0 ? 'Free' : `$${freeShippingThreshold}+`}</dt>
                  <dd>{freeShippingThreshold === 0 ? 'Shipping on every order' : 'Orders ship free'}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="home-hero__visual">
            <img
              src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=1100"
              alt="A calm living space styled with Aura pieces"
              className="home-hero__img"
            />

            {heroProduct && (
              <Link to={`/product/${heroProductId}`} className="home-hero__tag">
                <img src={getImageUrl(heroProduct.image)} alt="" />
                <span className="home-hero__tag-copy">
                  <span className="home-hero__tag-name">{heroProduct.name}</span>
                  <span className="home-hero__tag-price">${getEffectivePrice(heroProduct).toFixed(2)}</span>
                </span>
                <span className="home-hero__tag-go" aria-hidden="true">
                  <Icon name="arrowRight" />
                </span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* 2. SERVICE PROMISES */}
      <section className="home-promises" aria-label="Store promises">
        <div className="home-promises__inner">
          {promises.map((item) => (
            <div key={item.title} className="home-promise">
              <span className="home-promise__icon">
                <Icon name={item.icon} />
              </span>
              <div>
                <h4>{item.title}</h4>
                <p>
                  {item.text === 'dynamic'
                    ? shippingPhrase.charAt(0).toUpperCase() + shippingPhrase.slice(1)
                    : item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED CATEGORIES */}
      <section id="categories" className="home-section">
        <div className="home-section__inner">
          <div className="home-section__head">
            <div>
              <h2 className="home-section__title">Shop by category</h2>
              <p className="home-section__text">Browse the collection by room, ritual and use.</p>
            </div>
            <Link to="/shop" className="ui-link">
              View all
              <Icon name="arrowRight" />
            </Link>
          </div>

          <Swiper
            modules={[Navigation, Pagination, Autoplay, A11y]}
            navigation
            pagination={{ clickable: true }}
            grabCursor={true}
            loop={categories.length > 3}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            spaceBetween={16}
            slidesPerView={1.15}
            breakpoints={{
              480: { slidesPerView: 1.6, spaceBetween: 16 },
              768: { slidesPerView: 2.3, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
            }}
            className="aura-swiper featured-category-slider"
          >
            {categories.map((category) => (
              <SwiperSlide key={category.id || category._id || category.name}>
                <CategoryCard category={category} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS */}
      <section className="home-section home-section--tinted">
        <div className="home-section__inner">
          <div className="home-section__head">
            <div>
              <h2 className="home-section__title">Featured products</h2>
              <p className="home-section__text">Handpicked pieces our customers keep coming back for.</p>
            </div>
            <Link to="/shop" className="ui-link">
              Shop all
              <Icon name="arrowRight" />
            </Link>
          </div>

          <Swiper
            modules={[Navigation, Pagination, Autoplay, A11y]}
            navigation
            pagination={{ clickable: true }}
            grabCursor={true}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            spaceBetween={16}
            slidesPerView={1.3}
            breakpoints={{
              480: { slidesPerView: 2, spaceBetween: 16 },
              768: { slidesPerView: 3, spaceBetween: 20 },
              1024: { slidesPerView: 4, spaceBetween: 24 },
            }}
            className="aura-swiper featured-products-slider"
          >
            {products.slice(0, 8).map((product) => (
              <SwiperSlide key={product.id || product._id}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* 5. BRAND STORY */}
      <section className="home-story">
        <div className="home-story__inner">
          <div className="home-story__media">
            <img
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=900"
              alt="Hand-finished ceramics in natural light"
              loading="lazy"
            />
          </div>
          <div className="home-story__copy">
            <h2>Designed for slow, intentional living.</h2>
            <p>
              At Aura, we believe everyday objects should bring calm and purpose to your space.
              Each product in our collection is made with sustainable materials and a timeless,
              simple form — so it earns its place for years, not seasons.
            </p>
            <ul className="home-story__list">
              <li>
                <Icon name="check" />
                Natural and recycled materials first
              </li>
              <li>
                <Icon name="check" />
                Small makers and fair production
              </li>
              <li>
                <Icon name="check" />
                Plastic-free, recyclable packaging
              </li>
            </ul>
            <Link to="/about" className="ui-btn ui-btn--secondary">
              Read Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* 6. CUSTOMER REVIEWS */}
      <section className="home-section">
        <div className="home-section__inner">
          <div className="home-section__head">
            <div>
              <h2 className="home-section__title">Loved by minimalists everywhere</h2>
              <p className="home-section__text">What customers say after living with our pieces.</p>
            </div>
          </div>

          <div className="home-reviews">
            {testimonials.map((item) => (
              <figure key={item.id} className="home-review">
                <div className="home-review__stars" aria-label={`${item.rating} out of 5 stars`}>
                  {[...Array(item.rating)].map((_, i) => (
                    <Icon key={i} name="star" filled />
                  ))}
                </div>
                <blockquote>“{item.comment}”</blockquote>
                <figcaption>
                  <span className="home-review__avatar">{item.name.charAt(0)}</span>
                  <span>
                    <strong>{item.name}</strong>
                    <small>{item.role}</small>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* 7. INSTAGRAM GALLERY */}
      <section className="home-section home-section--flush-top">
        <div className="home-section__inner">
          <div className="home-section__head">
            <div>
              <h2 className="home-section__title">#AuraLiving</h2>
              <p className="home-section__text">Real homes, styled by our community.</p>
            </div>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="ui-link">
              <Icon name="instagram" />
              @aura.home
            </a>
          </div>

          <div className="home-gallery">
            {instagramPosts.map((imgUrl, index) => (
              <a
                key={index}
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="home-gallery__item"
                aria-label="Open Aura on Instagram"
              >
                <img src={imgUrl} alt="" loading="lazy" />
                <span className="home-gallery__overlay">
                  <Icon name="instagram" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 8. NEWSLETTER */}
      <section className="home-newsletter" id="newsletter">
        <div className="home-newsletter__inner">
          <div className="home-newsletter__copy">
            <span className="home-newsletter__icon">
              <Icon name="mail" />
            </span>
            <h2>Get 15% off your first order</h2>
            <p>Subscribe for early access to new releases, restocks and styling notes.</p>
          </div>
          <div className="home-newsletter__form">
            <NewsletterForm variant="feature" source="home" />
          </div>
        </div>
      </section>
    </div>
  );
}
