import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    items: []
}

const matchesProduct = (item, product) => {
    if (!item || !product) return false
    if (product._id && item._id && String(item._id) === String(product._id)) return true
    if (product.id && item.id && String(item.id) === String(product.id)) return true
    if (product.id && item._id && String(item._id) === String(product.id)) return true
    if (product._id && item.id && String(item.id) === String(product._id)) return true
    return false
}

const matchesId = (item, targetId) => {
    if (!item || targetId === undefined || targetId === null) return false
    const idStr = String(targetId)
    return (
        (item._id && String(item._id) === idStr) ||
        (item.id && String(item.id) === idStr) ||
        (item.legacyId && String(item.legacyId) === idStr)
    )
}

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,

    reducers: {
        hydrateWishlist: (state, action) => {
            state.items = Array.isArray(action.payload) ? action.payload : []
        },

        addToWishlist: (state, action) => {
            const product = action.payload
            const exists = state.items.some((item) => matchesProduct(item, product))

            if (!exists) {
                state.items.push({
                    ...product,
                    id: product._id || product.id
                })
            }
        },

        removeFromWishlist: (state, action) => {
            state.items = state.items.filter((item) => !matchesId(item, action.payload))
        },

        toggleWishlist: (state, action) => {
            const product = action.payload
            const exists = state.items.some((item) => matchesProduct(item, product))

            if (exists) {
                state.items = state.items.filter((item) => !matchesProduct(item, product))
            } else {
                state.items.push({
                    ...product,
                    id: product._id || product.id
                })
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
    hydrateWishlist,
    clearWishlist
} = wishlistSlice.actions

export default wishlistSlice.reducer