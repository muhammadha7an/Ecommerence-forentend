import React, { useState } from 'react'
 

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })
    const [submitted, setSubmitted] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setSubmitted(true)
        setFormData({ name: '', email: '', subject: '', message: '' })
        setTimeout(() => setSubmitted(false), 5000)
    }

    const contactDetails = [
        {
            id: 1,
            title: 'Customer Support',
            value: '+92 300 1234567',
            sub: 'Mon - Sat: 9:00 AM - 9:00 PM',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
            )
        },
        {
            id: 2,
            title: 'Email Us',
            value: 'support@yourstore.com',
            sub: 'We respond within 24 hours',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                </svg>
            )
        },
        {
            id: 3,
            title: 'Store Location',
            value: 'Main Commercial Avenue, Block C',
            sub: 'Lahore, Pakistan',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                </svg>
            )
        }
    ]

    return (
        <div className="contact-container">
            {/* 1. Header */}
            <section className="contact-hero">
                <h1>Contact Us</h1>
                <p>Have questions about an order or product? We are here to help you.</p>
            </section>

            {/* 2. Info Cards */}
            <section className="contact-info-grid">
                {contactDetails.map((item) => (
                    <div className="info-card" key={item.id}>
                        <div className="info-icon">{item.icon}</div>
                        <h3>{item.title}</h3>
                        <p className="info-primary">{item.value}</p>
                        <span className="info-sub">{item.sub}</span>
                    </div>
                ))}
            </section>

            {/* 3. Form & Details Grid */}
            <section className="contact-main-grid">
                <div className="contact-form-wrapper">
                    <h2>Send Us a Message</h2>
                    {submitted && (
                        <div className="success-alert">
                            Thank you! Your message has been sent successfully. We will contact you shortly.
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="contact-form">
                        <div className="form-group-row">
                            <div className="form-group">
                                <label htmlFor="name">Your Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="subject">Subject</label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                placeholder="Order Inquiry, Product Query, etc."
                                value={formData.subject}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="message">Message</label>
                            <textarea
                                id="message"
                                name="message"
                                rows="5"
                                placeholder="Type your message here..."
                                value={formData.message}
                                onChange={handleChange}
                                required
                            ></textarea>
                        </div>

                        <button type="submit" className="btn-submit">
                            Send Message
                        </button>
                    </form>
                </div>

                <div className="contact-map-wrapper">
                    <h2>Visit Our Store</h2>
                    <p>Stop by our physical store or operational warehouse for direct pick-ups and support.</p>
                    <div className="map-frame">
                        <iframe
                            title="Store Location"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3401.532353138855!2d74.3587!3d31.5204!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDMxJzEzLjQiTiA3NMKwMjEnMzEuMyJF!5e0!3m2!1sen!2spk!4v1620000000000!5m2!1sen!2spk"
                            width="100%"
                            height="320"
                            style={{ border: 0, borderRadius: '12px' }}
                            allowFullScreen=""
                            loading="lazy"
                        ></iframe>
                    </div>
                </div>
            </section>
        </div>
    )
}