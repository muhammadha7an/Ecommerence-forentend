import { Link } from 'react-router-dom'


export default function About() {
    const trustValues = [
        {
            id: 1,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="m9 12 2 2 4-4"/>
                </svg>
            ),
            title: '100% Original Products',
            desc: 'We source directly from verified distributors to ensure you always receive 100% genuine quality.'
        },
        {
            id: 2,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="6" width="20" height="12" rx="2"/>
                    <circle cx="12" cy="12" r="2"/>
                    <path d="M6 12h.01M18 12h.01"/>
                </svg>
            ),
            title: 'Cash On Delivery',
            desc: 'Place your order without advance payment. Pay conveniently when your package arrives at your doorstep.'
        },
        {
            id: 3,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10"/>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
            ),
            title: '7-Day Easy Returns',
            desc: 'Enjoy a hassle-free 7-day return and exchange policy if you are not completely satisfied.'
        },
        {
            id: 4,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
            ),
            title: 'Secure Shopping',
            desc: 'Your personal information and payment transactions are fully encrypted and safe with us.'
        }
    ]

    const testimonials = [
        {
            id: 1,
            name: 'Hamza Malik',
            rating: '★★★★★',
            review: 'The product quality exceeded my expectations and delivery was right on time. Highly recommended!'
        },
        {
            id: 2,
            name: 'Ayesha Bibi',
            rating: '★★★★★',
            review: 'The customer support team was extremely helpful and resolved my order query in no time.'
        },
        {
            id: 3,
            name: 'Bilal Hassan',
            rating: '★★★★★',
            review: 'Authentic products at the best market prices. Truly impressed with the service!'
        }
    ]

    const faqs = [
        {
            q: 'How long does delivery take?',
            a: 'Standard delivery usually takes between 2 to 4 business days.'
        },
        {
            q: 'What is your return or exchange policy?',
            a: 'You can easily request a return or exchange within 7 days of receiving your parcel.'
        },
        {
            q: 'What payment methods do you accept?',
            a: 'We accept Cash on Delivery (COD), Credit/Debit Cards, and popular digital wallets.'
        }
    ]

    return (
        <div className="about-container">
            {/* 1. Hero Section */}
            <section className="about-hero">
                <h1>About Our Store</h1>
                <p>
                    Your trusted destination for everyday shopping — where premium quality and customer satisfaction come first.
                </p>
            </section>

            {/* 2. Story & Mission Section */}
            <section className="about-story-section">
                <div className="story-content">
                    <span className="section-subtitle">OUR JOURNEY</span>
                    <h2>Our Story & Mission</h2>
                    <p>
                        We started with a simple vision: to make authentic, high-quality products accessible to everyone at unbeatable prices. Today, we proudly serve thousands of happy customers.
                    </p>
                    <p>
                        Our mission is to deliver a seamless, secure, and lightning-fast shopping experience. With every order, we guarantee premium quality and exceptional service.
                    </p>
                </div>
                <div className="story-image">
                    <img
                        src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=80"
                        alt="Modern E-commerce Fulfillment & Operations Center"
                        loading="lazy"
                    />
                </div>
            </section>

            {/* 3. Core Values Section */}
            <section className="about-values-section">
                <div className="section-header">
                    <span className="section-subtitle">OUR PRINCIPLES</span>
                    <h2>Our Core Values</h2>
                </div>
                <div className="values-grid">
                    <div className="value-card">
                        <div className="value-number">01</div>
                        <h3>Quality Assurance</h3>
                        <p>Every product undergoes rigorous multi-step quality checks before being dispatched.</p>
                    </div>
                    <div className="value-card">
                        <div className="value-number">02</div>
                        <h3>Transparency</h3>
                        <p>No hidden fees or unexpected costs. What you see is exactly what you pay.</p>
                    </div>
                    <div className="value-card">
                        <div className="value-number">03</div>
                        <h3>Customer First</h3>
                        <p>Your satisfaction is our highest priority, driving everything we do.</p>
                    </div>
                </div>
            </section>

            {/* 4. Stats Counter Section */}
            <section className="about-stats-section">
                <div className="stat-card">
                    <h3>10k+</h3>
                    <p>Happy Customers</p>
                </div>
                <div className="stat-card">
                    <h3>5k+</h3>
                    <p>Products Delivered</p>
                </div>
                <div className="stat-card">
                    <h3>99%</h3>
                    <p>Positive Ratings</p>
                </div>
                <div className="stat-card">
                    <h3>24/7</h3>
                    <p>Customer Support</p>
                </div>
            </section>

            {/* 5. Trust & Shopping Guarantees */}
            <section className="about-trust-section">
                <div className="section-header">
                    <span className="section-subtitle">SHOP WITH CONFIDENCE</span>
                    <h2>Our Shopping Guarantees</h2>
                </div>
                <div className="trust-grid">
                    {trustValues.map((item) => (
                        <div className="trust-card" key={item.id}>
                            <div className="trust-icon">{item.icon}</div>
                            <h3>{item.title}</h3>
                            <p>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 6. Customer Reviews Section */}
            <section className="about-reviews-section">
                <div className="section-header">
                    <span className="section-subtitle">TESTIMONIALS</span>
                    <h2>What Our Customers Say</h2>
                </div>
                <div className="reviews-grid">
                    {testimonials.map((item) => (
                        <div className="review-card" key={item.id}>
                            <div className="rating-stars">{item.rating}</div>
                            <p className="review-text">"{item.review}"</p>
                            <span className="reviewer-name">- {item.name}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* 7. FAQ Section */}
            <section className="about-faq-section">
                <div className="section-header">
                    <span className="section-subtitle">GOT QUESTIONS?</span>
                    <h2>Frequently Asked Questions</h2>
                </div>
                <div className="faq-list">
                    {faqs.map((faq, index) => (
                        <div className="faq-card" key={index}>
                            <h3>{faq.q}</h3>
                            <p>{faq.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 8. Call to Action Section */}
            <section className="about-cta-section">
                <h2>Ready to Start Shopping?</h2>
                <p>Explore our latest collections and discover unbeatable deals today.</p>
                <Link to="/shop" className="btn-shop-now">
                    Browse Shop
                </Link>
            </section>
        </div>
    )
}