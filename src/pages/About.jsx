import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import '../style/pages/about.css'

export default function About() {
    const [openFaq, setOpenFaq] = useState(0)

    const trustValues = [
        {
            id: 1,
            icon: 'shieldCheck',
            title: '100% Original Products',
            desc: 'We source directly from verified distributors to ensure you always receive 100% genuine quality.'
        },
        {
            id: 2,
            icon: 'creditCard',
            title: 'Cash On Delivery',
            desc: 'Place your order without advance payment. Pay conveniently when your package arrives at your doorstep.'
        },
        {
            id: 3,
            icon: 'rotateCcw',
            title: '7-Day Easy Returns',
            desc: 'Enjoy a hassle-free 7-day return and exchange policy if you are not completely satisfied.'
        },
        {
            id: 4,
            icon: 'lock',
            title: 'Secure Shopping',
            desc: 'Your personal information and payment transactions are fully encrypted and safe with us.'
        }
    ]

    const values = [
        { icon: 'award', title: 'Quality Assurance', desc: 'Every product undergoes rigorous multi-step quality checks before being dispatched.' },
        { icon: 'eye', title: 'Transparency', desc: 'No hidden fees or unexpected costs. What you see is exactly what you pay.' },
        { icon: 'heart', title: 'Customer First', desc: 'Your satisfaction is our highest priority, driving everything we do.' },
    ]

    const testimonials = [
        {
            id: 1,
            name: 'Hamza Malik',
            review: 'The product quality exceeded my expectations and delivery was right on time. Highly recommended!'
        },
        {
            id: 2,
            name: 'Ayesha Bibi',
            review: 'The customer support team was extremely helpful and resolved my order query in no time.'
        },
        {
            id: 3,
            name: 'Bilal Hassan',
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

    const stats = [
        { value: '10k+', label: 'Happy customers' },
        { value: '5k+', label: 'Products delivered' },
        { value: '99%', label: 'Positive ratings' },
        { value: '24/7', label: 'Customer support' },
    ]

    return (
        <div className="about-page">
            {/* 1. Page header */}
            <section className="ui-page-head">
                <div className="aura-container">
                    <nav className="ui-breadcrumb" aria-label="Breadcrumb">
                        <Link to="/">Home</Link>
                        <Icon name="chevronRight" />
                        <span aria-current="page">About</span>
                    </nav>
                    <h1 className="ui-page-head__title">About our store</h1>
                    <p className="ui-page-head__text">
                        Your trusted destination for everyday shopping — where quality and customer satisfaction come first.
                    </p>
                </div>
            </section>

            {/* 2. Story */}
            <section className="about-section">
                <div className="about-story">
                    <div className="about-story__copy">
                        <h2>Our story and mission</h2>
                        <p>
                            We started with a simple vision: to make authentic, high-quality products accessible to everyone at fair prices. Today, we proudly serve thousands of happy customers.
                        </p>
                        <p>
                            Our mission is to deliver a seamless, secure and fast shopping experience. With every order, we stand behind the quality of what we sell and the service around it.
                        </p>
                        <dl className="about-stats">
                            {stats.map((stat) => (
                                <div key={stat.label}>
                                    <dt>{stat.value}</dt>
                                    <dd>{stat.label}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                    <div className="about-story__media">
                        <img
                            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=80"
                            alt="Our fulfilment team packing orders"
                            loading="lazy"
                        />
                    </div>
                </div>
            </section>

            {/* 3. Values */}
            <section className="about-section about-section--tinted">
                <div className="about-inner">
                    <div className="about-head">
                        <h2>Our core values</h2>
                        <p>The principles behind every product we choose and every order we ship.</p>
                    </div>
                    <div className="about-values">
                        {values.map((value) => (
                            <div className="about-value" key={value.title}>
                                <span className="about-value__icon"><Icon name={value.icon} /></span>
                                <h3>{value.title}</h3>
                                <p>{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Guarantees */}
            <section className="about-section">
                <div className="about-inner">
                    <div className="about-head">
                        <h2>Our shopping guarantees</h2>
                        <p>Shop with confidence — here's what you can count on.</p>
                    </div>
                    <div className="about-trust">
                        {trustValues.map((item) => (
                            <div className="about-trust__card" key={item.id}>
                                <span className="about-trust__icon"><Icon name={item.icon} /></span>
                                <div>
                                    <h3>{item.title}</h3>
                                    <p>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Reviews */}
            <section className="about-section about-section--tinted">
                <div className="about-inner">
                    <div className="about-head">
                        <h2>What our customers say</h2>
                    </div>
                    <div className="about-reviews">
                        {testimonials.map((item) => (
                            <figure className="about-review" key={item.id}>
                                <div className="about-review__stars" aria-label="5 out of 5 stars">
                                    {[1, 2, 3, 4, 5].map((star) => <Icon key={star} name="star" filled />)}
                                </div>
                                <blockquote>“{item.review}”</blockquote>
                                <figcaption>{item.name}</figcaption>
                            </figure>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. FAQ */}
            <section className="about-section" id="faq">
                <div className="about-inner about-faq-wrap">
                    <div className="about-head">
                        <h2>Frequently asked questions</h2>
                        <p>
                            Can't find what you're looking for? <Link to="/contact" className="ui-link">Contact our team</Link>.
                        </p>
                    </div>
                    <div className="about-faq">
                        {faqs.map((faq, index) => {
                            const isOpen = openFaq === index
                            return (
                                <div className={`about-faq__item ${isOpen ? 'is-open' : ''}`} key={faq.q}>
                                    <button
                                        type="button"
                                        className="about-faq__question"
                                        onClick={() => setOpenFaq(isOpen ? -1 : index)}
                                        aria-expanded={isOpen}
                                        aria-controls={`faq-panel-${index}`}
                                    >
                                        {faq.q}
                                        <Icon name="plus" />
                                    </button>
                                    <div className="about-faq__answer" id={`faq-panel-${index}`} hidden={!isOpen}>
                                        <p>{faq.a}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* 7. CTA */}
            <section className="about-cta">
                <div className="about-cta__inner">
                    <div>
                        <h2>Ready to start shopping?</h2>
                        <p>Explore our latest collections and find something you'll use every day.</p>
                    </div>
                    <Link to="/shop" className="ui-btn ui-btn--accent ui-btn--lg">
                        Browse Shop
                        <Icon name="arrowRight" />
                    </Link>
                </div>
            </section>
        </div>
    )
}
