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
import './style/dashboard.css'

import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'

import WebsiteLayout from './components/WebsiteLayout.jsx'
import DashboardLayout from './components/DashboardLayout.jsx'
import AdminDashboardLayout from './components/AdminDashboardLayout.jsx'
import AdminRoute from './components/AdminRoute.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { hydrateCart } from './redux/slices/cartSlice'
import { hydrateWishlist } from './redux/slices/wishlistSlice'
import { fetchProducts } from './redux/slices/productsSlice'
import { fetchCategories } from './redux/slices/categoriesSlice'

import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
import Cart from './pages/Cart.jsx'
import Wishlist from './pages/Wishlist.jsx'
import ProductDetails from './pages/ProductDetails.jsx'
import Checkout from './pages/Checkout.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Success from './pages/Success.jsx'
import Signup from './pages/Signup.jsx'
import Login from './pages/Login.jsx'
import Account from './pages/Account.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import UserDashboard from './pages/UserDashboard.jsx'
import UserOrders from './pages/UserOrders.jsx'
import UserOrderDetails from './pages/UserOrderDetails.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import AdminUsers from './pages/AdminUsers.jsx'
import AdminOrders from './pages/AdminOrders.jsx'
import AdminProducts from './pages/AdminProducts.jsx'
import AdminProductForm from './pages/AdminProductForm.jsx'
import AdminCategories from './pages/AdminCategories.jsx'

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

  // Fetch live products and categories from MongoDB on initial mount
  useEffect(() => {
    dispatch(fetchProducts())
    dispatch(fetchCategories())
  }, [dispatch])

  useEffect(() => {
    const previousIdentity = identityRef.current
    const previousCart = previousIdentity
      ? JSON.parse(localStorage.getItem(`cart:${previousIdentity}`) || '[]')
      : []
    const savedCart = JSON.parse(localStorage.getItem(cartKey) || '[]')
    const savedWishlist = JSON.parse(localStorage.getItem(wishlistKey) || '[]')
    const nextCart =
      identity !== 'guest' && previousIdentity === 'guest' && savedCart.length === 0
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
      <Routes>
        <Route element={<WebsiteLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/success" element={<Success />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        </Route>

        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/dashboard/orders" element={<UserOrders />} />
          <Route path="/dashboard/orders/:orderId" element={<UserOrderDetails />} />
          <Route path="/dashboard/profile" element={<Account />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<AdminRoute><AdminDashboardLayout /></AdminRoute>}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/products/add" element={<AdminProductForm />} />
          <Route path="/admin/products/edit/:id" element={<AdminProductForm />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
