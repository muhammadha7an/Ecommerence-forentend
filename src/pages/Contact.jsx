import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import authService from '../services/authService'
import '../style/pages/contact.css'

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })
    const [submitted, setSubmitted] = useState(false)
    const [sending, setSending] = useState(false)
    const [error, setError] = useState('')
    const [honeypot, setHoneypot] = useState('')

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSubmitted(false)

        if (formData.message.trim().length < 10) {
            setError('Your message is a little short. Please add a few more details.')
            return
        }

        setSending(true)
        try {
            await authService.submitContact({ ...formData, website: honeypot })
            setSubmitted(true)
            setFormData({ name: '', email: '', subject: '', message: '' })
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    'We could not send your message right now. Please try again later.'
            )
        } finally {
            setSending(false)
        }
    }

    const contactDetails = [
        {
            id: 1,
            title: 'Customer Support',
            value: '+92 300 1234567',
            href: 'tel:+923001234567',
            sub: 'Mon - Sat: 9:00 AM - 9:00 PM',
            icon: 'phone'
        },
        {
            id: 2,
            title: 'Email Us',
            value: 'support@yourstore.com',
            href: 'mailto:support@yourstore.com',
            sub: 'We respond within 24 hours',
            icon: 'mail'
        },
        {
            id: 3,
            title: 'Store Location',
            value: 'Main Commercial Avenue, Block C',
            sub: 'Lahore, Pakistan',
            icon: 'mapPin'
        }
    ]

    return (
        <div className="contact-page">
            {/* 1. Header */}
            <section className="ui-page-head">
                <div className="aura-container">
                    <nav className="ui-breadcrumb" aria-label="Breadcrumb">
                        <Link to="/">Home</Link>
                        <Icon name="chevronRight" />
                        <span aria-current="page">Contact</span>
                    </nav>
                    <h1 className="ui-page-head__title">Contact us</h1>
                    <p className="ui-page-head__text">Have a question about an order or a product? We're here to help.</p>
                </div>
            </section>

            <div className="contact-inner">
                {/* 2. Info cards */}
                <section className="contact-info" aria-label="Contact details">
                    {contactDetails.map((item) => (
                        <div className="contact-info__card" key={item.id}>
                            <span className="contact-info__icon"><Icon name={item.icon} /></span>
                            <div>
                                <h3>{item.title}</h3>
                                {item.href ? (
                                    <a href={item.href} className="contact-info__value">{item.value}</a>
                                ) : (
                                    <p className="contact-info__value">{item.value}</p>
                                )}
                                <span className="contact-info__sub">{item.sub}</span>
                            </div>
                        </div>
                    ))}
                </section>

                {/* 3. Form + map */}
                <section className="contact-main">
                    <div className="contact-form-card">
                        <h2>Send us a message</h2>
                        <p className="contact-form-card__text">Fill in the form and our team will get back to you within one business day.</p>

                        {submitted && (
                            <div className="ui-alert ui-alert--success" role="status">
                                <Icon name="checkCircle" />
                                <span>Thank you! Your message has been sent. We'll get back to you soon.</span>
                            </div>
                        )}

                        {error && (
                            <div className="ui-alert ui-alert--error" role="alert">
                                <Icon name="alertCircle" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="contact-form" noValidate={false}>
                            {/* Spam trap: hidden from people, filled by bots */}
                            <input
                                type="text"
                                name="website"
                                value={honeypot}
                                onChange={(e) => setHoneypot(e.target.value)}
                                tabIndex={-1}
                                autoComplete="off"
                                aria-hidden="true"
                                className="contact-form__trap"
                            />
                            <div className="ui-form-grid">
                                <div className="ui-field">
                                    <label className="ui-label" htmlFor="name">Your name</label>
                                    <input
                                        className="ui-input"
                                        type="text"
                                        id="name"
                                        name="name"
                                        maxLength={100}
                                        autoComplete="name"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="ui-field">
                                    <label className="ui-label" htmlFor="email">Email address</label>
                                    <input
                                        className="ui-input"
                                        type="email"
                                        id="email"
                                        name="email"
                                        autoComplete="email"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="ui-field ui-field--full">
                                    <label className="ui-label" htmlFor="subject">Subject</label>
                                    <input
                                        className="ui-input"
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        maxLength={150}
                                        placeholder="Order inquiry, product question, etc."
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="ui-field ui-field--full">
                                    <label className="ui-label" htmlFor="message">Message</label>
                                    <textarea
                                        className="ui-textarea"
                                        id="message"
                                        name="message"
                                        maxLength={5000}
                                        rows="5"
                                        placeholder="Type your message here..."
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                    ></textarea>
                                </div>
                            </div>

                            <button type="submit" className="ui-btn ui-btn--lg" disabled={sending}>
                                {sending ? (
                                    <>
                                        <span className="ui-spinner" aria-hidden="true"></span>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="send" />
                                        Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="contact-map-card">
                        <h2>Visit our store</h2>
                        <p>Stop by our store or warehouse for direct pick-ups and support.</p>
                        <div className="contact-map">
                            <iframe
                                title="Store Location"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3401.532353138855!2d74.3587!3d31.5204!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDMxJzEzLjQiTiA3NMKwMjEnMzEuMyJF!5e0!3m2!1sen!2spk!4v1620000000000!5m2!1sen!2spk"
                                width="100%"
                                height="100%"
                                allowFullScreen=""
                                loading="lazy"
                            ></iframe>
                        </div>
                        <ul className="contact-hours">
                            <li><span>Monday – Friday</span><strong>9:00 AM – 9:00 PM</strong></li>
                            <li><span>Saturday</span><strong>9:00 AM – 9:00 PM</strong></li>
                            <li><span>Sunday</span><strong>Closed</strong></li>
                        </ul>
                    </div>
                </section>
            </div>
        </div>
    )
}
