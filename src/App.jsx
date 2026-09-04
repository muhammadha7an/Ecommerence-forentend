import './style/App.css'
import './style/header.css'
import './style/footer.css'
import './style/Home.css'
import './style/shop.css'
import './style/Wishlist.css'
import './style/cart.css'
import './style/about.css'
import './style/Contact.css'
import './style/checkout.css'
import './style/success.css'
import './style/account.css'

import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'

import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'

import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
import Cart from './pages/Cart.jsx'
import Wishlist from './pages/Wishlist.jsx'
import Checkout from './pages/Checkout.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Success from './pages/Success.jsx'


import Signup from './pages/Signup.jsx'
import Login from './pages/Login.jsx'
import Account from './pages/Account.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'

import ProtectedRoute from './components/ProtectedRoute.jsx'
import { hydrateCart } from './redux/slices/cartSlice'
import { hydrateWishlist } from './redux/slices/wishlistSlice'

function UserDataPersistence() {
    const dispatch = useDispatch()
    const location = useLocation()
    const cartItems = useSelector((state) => state.cart.items)
    const wishlistItems = useSelector((state) => state.wishlist.items)
    const identityRef = useRef(null)
    const skipSaveRef = useRef(true)
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    const identity = user?.id || user?._id || 'guest'
    const cartKey = `cart:${identity}`
    const wishlistKey = `wishlist:${identity}`

    useEffect(() => {
        const previousIdentity = identityRef.current
        const previousCart = previousIdentity
            ? JSON.parse(localStorage.getItem(`cart:${previousIdentity}`) || '[]')
            : []
        const savedCart = JSON.parse(localStorage.getItem(cartKey) || '[]')
        const savedWishlist = JSON.parse(localStorage.getItem(wishlistKey) || '[]')
        const nextCart = identity !== 'guest' && previousIdentity === 'guest' && savedCart.length === 0
            ? previousCart
            : savedCart

        skipSaveRef.current = true
        dispatch(hydrateCart(nextCart))
        dispatch(hydrateWishlist(savedWishlist))

        if (identity !== 'guest' && previousIdentity === 'guest') {
            localStorage.removeItem('cart:guest')
        }

        identityRef.current = identity
    }, [cartKey, wishlistKey, identity, dispatch, location.pathname])

    useEffect(() => {
        if (skipSaveRef.current) {
            skipSaveRef.current = false
            return
        }

        localStorage.setItem(cartKey, JSON.stringify(cartItems))
        localStorage.setItem(wishlistKey, JSON.stringify(wishlistItems))
    }, [cartItems, wishlistItems, cartKey, wishlistKey])

    return null
}


function App() {
    return (
        <BrowserRouter>
            <UserDataPersistence />

            <div className="app-shell">

                <Header />

                <main className="site-main">

                    <Routes>

                       

                        <Route
                            path="/"
                            element={<Home />}
                        />

                        <Route
                            path="/shop"
                            element={<Shop />}
                        />

                        <Route
                            path="/cart"
                            element={<Cart />}
                        />

                        <Route
                            path="/checkout"
                            element={
                                <ProtectedRoute>
                                    <Checkout />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/wishlist"
                            element={<Wishlist />}
                        />

                        <Route
                            path="/about"
                            element={<About />}
                        />

                        <Route
                            path="/contact"
                            element={<Contact />}
                        />

                        <Route
                            path="/success"
                            element={<Success />}
                        />


                       

                        <Route
                            path="/signup"
                            element={<Signup />}
                        />

                        <Route
                            path="/login"
                            element={<Login />}
                        />

                        <Route
                            path="/forgot-password"
                            element={<ForgotPassword />}
                        />

                        <Route
                            path="/reset-password/:token"
                            element={<ResetPassword />}
                        />

 

                        <Route
                            path="/account"
                            element={
                                <ProtectedRoute>
                                    <Account />
                                </ProtectedRoute>
                            }
                        />

                    </Routes>

                </main>

                <Footer />

            </div>

        </BrowserRouter>
    )
}

export default App