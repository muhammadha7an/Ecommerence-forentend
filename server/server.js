import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import Stripe from 'stripe'

dotenv.config()

const app = express()
const PORT = 5000

const stripe = new Stripe(
    process.env.STRIPE_SECRET_KEY
)

app.use(cors())
app.use(express.json())


/*
|--------------------------------------------------------------------------
| Test Route
|--------------------------------------------------------------------------
*/

app.get('/api/test', (req, res) => {

    res.json({
        success: true,
        message: 'Stripe backend is working!'
    })

})


/*
|--------------------------------------------------------------------------
| Create Stripe Checkout Session
|--------------------------------------------------------------------------
*/

app.post(
    '/api/create-checkout-session',
    async (req, res) => {

        try {

            const {
                items,
                origin
            } = req.body


            if (!items || items.length === 0) {

                return res.status(400).json({
                    success: false,
                    message: 'Cart is empty.'
                })

            }


            if (!origin) {

                return res.status(400).json({
                    success: false,
                    message: 'Frontend URL is missing.'
                })

            }


            const lineItems = items.map((item) => ({

                price_data: {

                    currency: 'usd',

                    product_data: {
                        name: item.name
                    },

                    unit_amount: Math.round(
                        Number(item.price) * 100
                    )

                },

                quantity: Number(item.quantity)

            }))


            const session =
                await stripe.checkout.sessions.create({

                    mode: 'payment',

                    line_items: lineItems,


                    /*
                    |--------------------------------------------------------------------------
                    | Customer Information
                    |--------------------------------------------------------------------------
                    */

                    billing_address_collection:
                        'required',


                    /*
                    |--------------------------------------------------------------------------
                    | Stripe Checkout Page
                    |--------------------------------------------------------------------------
                    */

                    success_url:
                        `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,

                    cancel_url:
                        `${origin}/checkout`,


                    /*
                    |--------------------------------------------------------------------------
                    | Payment Methods
                    |--------------------------------------------------------------------------
                    */

                    payment_method_types: [
                        'card'
                    ]

                })


            res.json({

                success: true,

                url: session.url

            })


        } catch (error) {

            console.error(
                'Stripe Error:',
                error
            )


            res.status(500).json({

                success: false,

                message:
                    error.message ||
                    'Unable to create Stripe session.'

            })

        }

    }
)





/*
|--------------------------------------------------------------------------
| Get Checkout Session / Order Details
|--------------------------------------------------------------------------
*/

app.get(
    '/api/checkout-session/:sessionId',
    async (req, res) => {

        try {

            const { sessionId } = req.params

            if (!sessionId) {

                return res.status(400).json({
                    success: false,
                    message: 'Session ID is required.'
                })

            }


            // Retrieve Checkout Session from Stripe
            const session =
                await stripe.checkout.sessions.retrieve(
                    sessionId
                )


            // Retrieve products/order items
            const lineItems =
                await stripe.checkout.sessions.listLineItems(
                    sessionId,
                    {
                        limit: 100
                    }
                )


            /*
            |--------------------------------------------------------------------------
            | Make sure payment was actually successful
            |--------------------------------------------------------------------------
            */

            if (
                session.payment_status !== 'paid'
            ) {

                return res.status(400).json({
                    success: false,
                    message: 'Payment has not been completed.'
                })

            }


            /*
            |--------------------------------------------------------------------------
            | Send clean order data to React
            |--------------------------------------------------------------------------
            */

            res.json({

                success: true,

                order: {

                    sessionId: session.id,

                    paymentStatus:
                        session.payment_status,

                    status:
                        session.status,

                    amountTotal:
                        session.amount_total,

                    currency:
                        session.currency,

                    customer: {

                        name:
                            session.customer_details?.name ||
                            '',

                        email:
                            session.customer_details?.email ||
                            '',

                        phone:
                            session.customer_details?.phone ||
                            '',

                        address:
                            session.customer_details?.address ||
                            null

                    },

                    items:
                        lineItems.data.map((item) => ({

                            id:
                                item.id,

                            name:
                                item.description,

                            quantity:
                                item.quantity,

                            amountTotal:
                                item.amount_total,

                            currency:
                                item.currency

                        }))

                }

            })


        } catch (error) {

            console.error(
                'Order Retrieval Error:',
                error
            )


            res.status(500).json({

                success: false,

                message:
                    error.message ||
                    'Unable to retrieve order.'

            })

        }

    }
)

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

app.listen(PORT, () => {

    console.log(
        `Server running on http://localhost:${PORT}`
    )

})