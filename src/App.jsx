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

import { BrowserRouter, Routes, Route } from 'react-router-dom'

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


function App() {
    return (
        <BrowserRouter>

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
                            element={<Checkout />}
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