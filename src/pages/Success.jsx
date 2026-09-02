import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import jsPDF from 'jspdf'

import { clearCart } from '../redux/slices/cartSlice'
 

export default function Success() {

    const [searchParams] = useSearchParams()

    const dispatch = useDispatch()

    const sessionId =
        searchParams.get('session_id')


    const [order, setOrder] = useState(null)

    const [loading, setLoading] =
        useState(true)

    const [error, setError] =
        useState('')


    /*
    |--------------------------------------------------------------------------
    | Get Order From Stripe
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (!sessionId) {

            setError(
                'Order session was not found.'
            )

            setLoading(false)

            return
        }


        const fetchOrder = async () => {

            try {

                const response =
                    await fetch(
                        `http://localhost:5000/api/checkout-session/${sessionId}`
                    )


                const data =
                    await response.json()


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        'Unable to load order.'
                    )

                }


                setOrder(data.order)


                /*
                |--------------------------------------------------------------------------
                | Clear Redux cart after successful payment
                |--------------------------------------------------------------------------
                */

                if (
                    data.order.paymentStatus === 'paid'
                ) {

                    dispatch(clearCart())

                }

            } catch (error) {

                console.error(
                    'Order Error:',
                    error
                )

                setError(
                    error.message ||
                    'Unable to load order.'
                )

            } finally {

                setLoading(false)

            }

        }


        fetchOrder()

    }, [sessionId, dispatch])


    /*
    |--------------------------------------------------------------------------
    | Loading State
    |--------------------------------------------------------------------------
    */

    if (loading) {

        return (

            <div className="page-content">

                <section className="success-page success-page-loading">

                    <div className="loading-spinner"></div>

                    <h1>
                        Confirming your order...
                    </h1>

                    <p>
                        Please wait while we retrieve
                        your payment information.
                    </p>

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

            <div className="page-content">

                <section className="success-page success-page-error">

                    <div className="error-icon">!</div>

                    <h1>
                        Something went wrong
                    </h1>

                    <p className="error-message">
                        {error}
                    </p>

                    <Link
                        to="/shop"
                        className="button"
                    >
                        Continue Shopping
                    </Link>

                </section>

            </div>

        )

    }


    if (!order) {
        return null
    }


    /*
    |--------------------------------------------------------------------------
    | Amount Formatter
    |--------------------------------------------------------------------------
    */

    const formatAmount = (
        amount,
        currency = 'usd'
    ) => {

        return new Intl.NumberFormat(
            'en-US',
            {
                style: 'currency',
                currency:
                    currency.toUpperCase()
            }
        ).format(amount / 100)

    }


    /*
    |--------------------------------------------------------------------------
    | Download PDF Receipt
    |--------------------------------------------------------------------------
    */

    const downloadReceipt = () => {

        const pdf =
            new jsPDF()


        /*
        |--------------------------------------------------------------------------
        | Header
        |--------------------------------------------------------------------------
        */

        pdf.setFontSize(22)

        pdf.text(
            'Order Confirmation',
            20,
            25
        )


        pdf.setFontSize(11)

        pdf.text(
            'Payment successful',
            20,
            34
        )


        /*
        |--------------------------------------------------------------------------
        | Order Information
        |--------------------------------------------------------------------------
        */

        pdf.setFontSize(12)

        pdf.text(
            `Order ID: ${order.sessionId}`,
            20,
            50
        )

        pdf.text(
            `Customer: ${order.customer.name}`,
            20,
            58
        )

        pdf.text(
            `Email: ${order.customer.email}`,
            20,
            66
        )


        /*
        |--------------------------------------------------------------------------
        | Products
        |--------------------------------------------------------------------------
        */

        let y = 85


        pdf.setFontSize(13)

        pdf.text(
            'Order Items',
            20,
            y
        )


        y += 10


        pdf.setFontSize(11)


        order.items.forEach((item) => {

            const amount =
                formatAmount(
                    item.amountTotal,
                    item.currency
                )


            pdf.text(
                `${item.name}`,
                20,
                y
            )


            pdf.text(
                `Qty: ${item.quantity}`,
                20,
                y + 7
            )


            pdf.text(
                amount,
                150,
                y
            )


            y += 20

        })


        /*
        |--------------------------------------------------------------------------
        | Total
        |--------------------------------------------------------------------------
        */

        y += 5


        pdf.line(
            20,
            y,
            190,
            y
        )


        y += 12


        pdf.setFontSize(14)

        pdf.text(
            'Total',
            20,
            y
        )


        pdf.text(
            formatAmount(
                order.amountTotal,
                order.currency
            ),
            150,
            y
        )


        /*
        |--------------------------------------------------------------------------
        | Footer
        |--------------------------------------------------------------------------
        */

        pdf.setFontSize(10)

        pdf.text(
            'Thank you for your purchase!',
            20,
            280
        )


        pdf.save(
            `order-${order.sessionId}.pdf`
        )

    }


    /*
    |--------------------------------------------------------------------------
    | Success Page
    |--------------------------------------------------------------------------
    */

    return (

        <div className="page-content">

            <section className="success-page">


                {/* =====================================================
                    SUCCESS HEADER
                ====================================================== */}

                <div className="success-icon">

                    ✓

                </div>


                <h1>
                    Thank You for Your Order!
                </h1>


                <p className="success-message">

                    Your payment was successful
                    and your order has been placed.

                </p>


                {/* =====================================================
                    CUSTOMER INFO
                ====================================================== */}

                <div className="order-card">

                    <div className="order-card-header">

                        <div>

                            <span>
                                Order ID
                            </span>

                            <strong>
                                {order.sessionId}
                            </strong>

                        </div>


                        <span className="payment-status">

                            Paid

                        </span>

                    </div>


                    <div className="customer-details">

                        <div>

                            <span>
                                Customer
                            </span>

                            <strong>
                                {order.customer.name}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Email
                            </span>

                            <strong>
                                {order.customer.email}
                            </strong>

                        </div>

                    </div>


                    {/* =================================================
                        ORDER ITEMS
                    ================================================= */}

                    <div className="order-items">

                        <h2>
                            Your Order
                        </h2>


                        {order.items.map((item) => (

                            <div
                                className="order-item"
                                key={item.id}
                            >

                                <div>

                                    <h3>
                                        {item.name}
                                    </h3>

                                    <p>
                                        Quantity:{' '}
                                        {item.quantity}
                                    </p>

                                </div>


                                <strong>

                                    {formatAmount(
                                        item.amountTotal,
                                        item.currency
                                    )}

                                </strong>

                            </div>

                        ))}

                    </div>


                    {/* =================================================
                        TOTAL
                    ================================================= */}

                    <div className="order-total">

                        <span>
                            Total Paid
                        </span>

                        <strong>

                            {formatAmount(
                                order.amountTotal,
                                order.currency
                            )}

                        </strong>

                    </div>


                    {/* =================================================
                        ACTIONS
                    ================================================= */}

                    <div className="success-actions">

                        <button
                            type="button"
                            className="button"
                            onClick={downloadReceipt}
                        >
                            Download Receipt
                        </button>


                        <Link
                            to="/shop"
                            className="button secondary"
                        >
                            Continue Shopping
                        </Link>

                    </div>

                </div>

            </section>

        </div>

    )

}