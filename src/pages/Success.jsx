import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import jsPDF from 'jspdf'

import { clearCart } from '../redux/slices/cartSlice'
import { API_BASE_URL } from '../services/api'
import Icon from '../components/Icon'
import '../style/pages/success.css'

export default function Success() {
    const [searchParams] = useSearchParams()
    const dispatch = useDispatch()
    const sessionId = searchParams.get('session_id')

    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    /*
    |--------------------------------------------------------------------------
    | Get Order From Stripe / Backend
    |--------------------------------------------------------------------------
    */
    useEffect(() => {
        if (!sessionId) {
            setError('Order session was not found.')
            setLoading(false)
            return
        }

        const fetchOrder = async () => {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/api/checkout-session/${sessionId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                )

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(
                        data.message || 'Unable to load order.'
                    )
                }

                setOrder(data.order)

                // Clear Redux cart after successful payment
                if (data.order.paymentStatus === 'paid') {
                    dispatch(clearCart())
                }
            } catch (err) {
                console.error('Order Error:', err)
                setError(err.message || 'Unable to load order.')
            } finally {
                setLoading(false)
            }
        }

        fetchOrder()
    }, [sessionId, dispatch])

    /*
    |--------------------------------------------------------------------------
    | Order ID Formatting Helper
    |--------------------------------------------------------------------------
    */
    const getDisplayOrderId = () => {
        if (!order) return ''
        // Priority: custom order number -> database ID -> trimmed Stripe session ID
        if (order.orderNumber) return `#${order.orderNumber}`
        if (order._id) return `#${order._id.slice(-8).toUpperCase()}`
        if (order.id) return `#${order.id.slice(-8).toUpperCase()}`
        return order.sessionId ? `#${order.sessionId.slice(-10).toUpperCase()}` : '#ORDER'
    }

    /*
    |--------------------------------------------------------------------------
    | Amount Formatter
    |--------------------------------------------------------------------------
    */
    const formatAmount = (amount, currency = 'usd') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase()
        }).format(amount / 100)
    }

    /*
    |--------------------------------------------------------------------------
    | Professional Download PDF Receipt
    |--------------------------------------------------------------------------
    */
    const downloadReceipt = () => {
        if (!order) return

        const doc = new jsPDF()
        const displayId = getDisplayOrderId()

        // Colors
        const primaryColor = [31, 41, 55] // Dark Gray (#1F2937)
        const accentColor = [16, 185, 129] // Emerald Green (#10B981)
        const lightGray = [243, 244, 246] // #F3F4F6
        const darkText = [55, 65, 81]

        // --- HEADER SECTION ---
        doc.setFillColor(...primaryColor)
        doc.rect(0, 0, 210, 35, 'F')

        doc.setTextColor(255, 255, 255)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(20)
        doc.text('STORE RECEIPT', 15, 22)

        // Paid Stamp/Badge
        doc.setFillColor(...accentColor)
        doc.roundedRect(155, 12, 40, 12, 3, 3, 'F')
        doc.setFontSize(10)
        doc.setTextColor(255, 255, 255)
        doc.text('PAYMENT PAID', 175, 19.5, { align: 'center' })

        // --- ORDER & CUSTOMER METADATA ---
        let currentY = 48

        // Order Info Box (Left)
        doc.setTextColor(...darkText)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text('ORDER DETAILS', 15, currentY)
        
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.text(`Order ID: ${displayId}`, 15, currentY + 7)
        doc.text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`, 15, currentY + 13)
        doc.text(`Status: Completed`, 15, currentY + 19)

        // Customer Info Box (Right)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.text('CUSTOMER DETAILS', 125, currentY)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        const customerName = order.customer?.name || 'Valued Customer'
        const customerEmail = order.customer?.email || 'N/A'
        doc.text(`Name: ${customerName}`, 125, currentY + 7)
        doc.text(`Email: ${customerEmail}`, 125, currentY + 13)

        currentY += 32

        // --- TABLE HEADER ---
        doc.setFillColor(...lightGray)
        doc.rect(15, currentY, 180, 10, 'F')

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(...primaryColor)
        doc.text('ITEM DESCRIPTION', 20, currentY + 6.5)
        doc.text('QTY', 125, currentY + 6.5, { align: 'center' })
        doc.text('AMOUNT', 185, currentY + 6.5, { align: 'right' })

        currentY += 12

        // --- TABLE ROWS ---
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...darkText)

        order.items.forEach((item) => {
            const itemPrice = formatAmount(item.amountTotal, item.currency)
            
            // Handle long item titles
            const splitTitle = doc.splitTextToSize(item.name, 95)
            doc.text(splitTitle, 20, currentY)
            
            doc.text(`${item.quantity}`, 125, currentY, { align: 'center' })
            doc.text(itemPrice, 185, currentY, { align: 'right' })

            // Dynamic height addition based on line count
            const lines = splitTitle.length
            currentY += lines * 6 + 4

            // Light horizontal line between items
            doc.setDrawColor(229, 231, 235)
            doc.line(15, currentY - 2, 195, currentY - 2)
        })

        currentY += 6

        // --- SUBTOTAL / SHIPPING ---
        if (order.subtotalAmount !== null && order.subtotalAmount !== undefined) {
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(10)
            doc.setTextColor(75, 85, 99)
            doc.text('Subtotal:', 122, currentY + 4)
            doc.text(formatAmount(order.subtotalAmount, order.currency), 188, currentY + 4, { align: 'right' })
            doc.text('Shipping:', 122, currentY + 11)
            doc.text(
                Number(order.shippingFee || 0) > 0 ? formatAmount(order.shippingFee, order.currency) : 'FREE',
                188,
                currentY + 11,
                { align: 'right' }
            )
            currentY += 16
        }

        // --- TOTAL SECTION ---
        doc.setFillColor(...lightGray)
        doc.rect(115, currentY, 80, 18, 'F')

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.setTextColor(...primaryColor)
        doc.text('Total Amount:', 122, currentY + 11)
        doc.setTextColor(16, 185, 129) // Green for total
        doc.text(
            formatAmount(order.amountTotal, order.currency),
            188,
            currentY + 11,
            { align: 'right' }
        )

        // --- FOOTER SECTION ---
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(156, 163, 175)
        doc.text('Thank you for shopping with us!', 105, 275, { align: 'center' })
        doc.text('For support or queries, please contact us.', 105, 281, { align: 'center' })

        // Save PDF file
        doc.save(`Receipt-${displayId.replace('#', '')}.pdf`)
    }

    /*
    |--------------------------------------------------------------------------
    | Loading State
    |--------------------------------------------------------------------------
    */
    if (loading) {
        return (
            <div className="success-page">
                <section className="success-card success-card--state">
                    <span className="ui-spinner ui-spinner--lg" aria-hidden="true"></span>
                    <h1>Confirming your order...</h1>
                    <p>Please wait while we retrieve your payment information.</p>
                </section>
            </div>
        )
    }

    /*
    |--------------------------------------------------------------------------
    | Error State
    |--------------------------------------------------------------------------
    */
    if (error) {
        return (
            <div className="success-page">
                <section className="success-card success-card--state">
                    <span className="success-badge success-badge--error">
                        <Icon name="alertTriangle" />
                    </span>
                    <h1>We couldn't confirm this order</h1>
                    <p className="success-error">{error}</p>
                    <div className="success-actions">
                        <Link to="/dashboard/orders" className="ui-btn ui-btn--secondary">
                            View My Orders
                        </Link>
                        <Link to="/shop" className="ui-btn">
                            Continue Shopping
                        </Link>
                    </div>
                </section>
            </div>
        )
    }

    if (!order) return null

    const displayOrderId = getDisplayOrderId()

    /*
    |--------------------------------------------------------------------------
    | Main UI Render
    |--------------------------------------------------------------------------
    */
    return (
        <div className="success-page">
            <section className="success-card">
                <div className="success-hero">
                    <span className="success-badge">
                        <Icon name="check" strokeWidth={2.4} />
                    </span>
                    <h1>Thank you for your order</h1>
                    <p>
                        Your payment was successful and your order has been placed.
                        You can follow its progress from your orders page.
                    </p>
                </div>

                <dl className="success-meta">
                    <div>
                        <dt>Order ID</dt>
                        <dd>{displayOrderId}</dd>
                    </div>
                    <div>
                        <dt>Customer</dt>
                        <dd>{order.customer?.name || 'N/A'}</dd>
                    </div>
                    <div>
                        <dt>Email</dt>
                        <dd>{order.customer?.email || 'N/A'}</dd>
                    </div>
                    <div>
                        <dt>Payment</dt>
                        <dd><span className="ui-badge ui-badge--dot ui-badge--success">Paid</span></dd>
                    </div>
                </dl>

                <div className="success-items">
                    <h2>Your order</h2>
                    <ul>
                        {order.items.map((item, index) => (
                            <li className="success-item" key={item.id || index}>
                                <span className="success-item__icon"><Icon name="package" /></span>
                                <div>
                                    <h3>{item.name}</h3>
                                    <p>Quantity: {item.quantity}</p>
                                </div>
                                <strong>
                                    {formatAmount(
                                        item.amountTotal,
                                        item.currency
                                    )}
                                </strong>
                            </li>
                        ))}
                    </ul>

                    {order.subtotalAmount !== null && order.subtotalAmount !== undefined && (
                        <div className="success-breakdown">
                            <div>
                                <span>Subtotal</span>
                                <span>{formatAmount(order.subtotalAmount, order.currency)}</span>
                            </div>
                            <div>
                                <span>{order.shippingMethod || 'Shipping'}</span>
                                <span>
                                    {Number(order.shippingFee || 0) > 0
                                        ? formatAmount(order.shippingFee, order.currency)
                                        : 'FREE'}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="success-total">
                        <span>Total paid</span>
                        <strong>
                            {formatAmount(
                                order.amountTotal,
                                order.currency
                            )}
                        </strong>
                    </div>
                </div>

                <div className="success-actions">
                    <button
                        type="button"
                        className="ui-btn ui-btn--secondary"
                        onClick={downloadReceipt}
                    >
                        <Icon name="download" />
                        Download Receipt
                    </button>
                    <Link to="/dashboard/orders" className="ui-btn ui-btn--secondary">
                        <Icon name="package" />
                        Track Order
                    </Link>
                    <Link to="/shop" className="ui-btn">
                        Continue Shopping
                    </Link>
                </div>
            </section>
        </div>
    )
}
