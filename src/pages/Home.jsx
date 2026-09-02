import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, A11y } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
 

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

export default function Home() {
  const products = useSelector((state) => state.products.items) || [];
  const categories = useSelector((state) => state.categories.items) || [];
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <div className="home-page">
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-text">
            <span className="eyebrow">A considered collection</span>
            <h1>Simple things, thoughtfully chosen.</h1>
            <p>Explore useful, beautifully crafted pieces designed to fit naturally into everyday living.</p>
            <div className="hero-cta-group">
              <Link className="btn btn-primary" to="/shop">
                Browse Shop
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
              <a className="btn btn-outline" href="#categories">
                Explore Categories
              </a>
            </div>
          </div>
          <div className="hero-visual">
            <img 
              src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=1000" 
              alt="Aura Living Space" 
              className="hero-main-img"
            />
          </div>
        </div>
      </section>

      {/* 2. TRUST BADGES STRIP */}
      <section className="trust-strip">
        <div className="trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="3" width="15" height="13"></rect>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
          <div>
            <h4>Free Shipping</h4>
            <p>On orders over $75</p>
          </div>
        </div>
        <div className="trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          <div>
            <h4>Sustainable Quality</h4>
            <p>Ethically sourced materials</p>
          </div>
        </div>
        <div className="trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          <div>
            <h4>30-Day Guarantee</h4>
            <p>Hassle-free exchanges</p>
          </div>
        </div>
      </section>

      {/* 3. FEATURED CATEGORIES */}
      <section id="categories" className="content-section">
        <div className="section-head">
          <div>
            <span className="section-tag">Curated Spaces</span>
            <h2>Featured Categories</h2>
          </div>
          <Link to="/shop" className="link-arrow">View All</Link>
        </div>


        <Swiper
          modules={[ Autoplay, A11y]}
          navigation
          pagination={{ clickable: true }}
          grabCursor={true}
          loop={true}
          autoplay={{
            delay: 2000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          spaceBetween={16}
          slidesPerView={1.2}
          breakpoints={{
            480: { slidesPerView: 1, spaceBetween: 16 },
            768: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
          }}
          className="featured-category-slider"
        >
            {categories.map((category) => (
            <SwiperSlide key={category.id}>
              <CategoryCard category={category} />
            </SwiperSlide>
          ))} 
        </Swiper>

        
      </section>

      {/* 4. BRAND STORY SECTION */}
      <section className="brand-story-section">
        <div className="brand-story-container">
          <div className="brand-story-image">
            <img 
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800" 
              alt="Craftsmanship" 
            />
          </div>
          <div className="brand-story-content">
            <span className="section-tag">Our Philosophy</span>
            <h2>Designed for slow, intentional living.</h2>
            <p>
              At Aura, we believe that everyday objects should bring peace and purpose to your living space. 
              Each product in our collection is crafted with sustainable materials and timeless simplicity.
            </p>
            <Link to="/about" className="btn btn-outline">
              Read Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* 5. FEATURED PRODUCTS SLIDER */}
      <section className="content-section bg-soft">
        <div className="section-head">
          <div>
            <span className="section-tag">Handpicked Collection</span>
            <h2>Featured Products</h2>
          </div>
          <Link to="/shop" className="link-arrow">Shop All</Link>
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
          slidesPerView={1.2}
          breakpoints={{
            480: { slidesPerView: 2, spaceBetween: 16 },
            768: { slidesPerView: 3, spaceBetween: 20 },
            1024: { slidesPerView: 4, spaceBetween: 24 },
          }}
          className="featured-products-slider"
        >
          {products.slice(0, 8).map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>


      </section>

      {/* 6. CUSTOMER REVIEWS */}
      <section className="content-section">
        <div className="section-head text-center">
          <span className="section-tag">Customer Love</span>
          <h2>Loved by Minimalists Everywhere</h2>
        </div>

        <div className="reviews-grid">
          {testimonials.map((item) => (
            <div key={item.id} className="review-card">
              <div className="stars">
                {[...Array(item.rating)].map((_, i) => (
                  <svg key={i} viewBox="0 0 24 24" fill="#ad4b2f" width="18" height="18">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p className="review-comment">"{item.comment}"</p>
              <div className="review-author">
                <strong>{item.name}</strong>
                <span>{item.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. INSTAGRAM LIFESTYLE GALLERY */}
      <section className="instagram-section">
        <div className="section-head">
          <div>
            <span className="section-tag">#AuraLiving</span>
            <h2>Follow Us on Instagram</h2>
          </div>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="link-arrow">
            @aura.home
          </a>
        </div>

        <div className="gallery-grid">
          {instagramPosts.map((imgUrl, index) => (
            <div key={index} className="gallery-item">
              <img src={imgUrl} alt="Aura Community" />
              <div className="gallery-overlay">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. NEWSLETTER / PROMO BANNER */}
      <section className="promo-section">
        <div className="promo-box">
          <div className="promo-text">
            <span className="eyebrow-light">Join The Community</span>
            <h2>Get 15% off your first order</h2>
            <p>Subscribe for exclusive updates, early access to new releases, and styling tips.</p>

            {subscribed ? (
              <div className="newsletter-success">
                ✓ Thank you for subscribing! Check your inbox soon.
              </div>
            ) : (
              <form className="promo-newsletter-form" onSubmit={handleSubscribe}>
                <input 
                  type="email" 
                  placeholder="Enter your email address..." 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
                <button type="submit" className="btn btn-primary">
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}