import { configureStore } from '@reduxjs/toolkit'

import productsReducer from './slices/productsSlice'
import categoriesReducer from './slices/categoriesSlice'
import cartReducer from './slices/cartSlice'
import wishlistReducer from './slices/wishlistSlice'

export const store = configureStore({
    reducer: {
        products: productsReducer,
        categories: categoriesReducer,
        cart: cartReducer,
        wishlist: wishlistReducer
    }
})