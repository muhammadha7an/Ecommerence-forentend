import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    items: []
}

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,

    reducers: {
        addToWishlist: (state, action) => {
            const product = action.payload

            const exists = state.items.some(
                (item) => item.id === product.id
            )

            if (!exists) {
                state.items.push(product)
            }
        },

        removeFromWishlist: (state, action) => {
            state.items = state.items.filter(
                (item) => item.id !== action.payload
            )
        },

        toggleWishlist: (state, action) => {
            const product = action.payload

            const exists = state.items.some(
                (item) => item.id === product.id
            )

            if (exists) {
                state.items = state.items.filter(
                    (item) => item.id !== product.id
                )
            } else {
                state.items.push(product)
            }
        },

        clearWishlist: (state) => {
            state.items = []
        }
    }
})

export const {
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist
} = wishlistSlice.actions

export default wishlistSlice.reducer