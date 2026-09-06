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

const cartSlice = createSlice({
    name: 'cart',
    initialState,

    reducers: {
        hydrateCart: (state, action) => {
            state.items = Array.isArray(action.payload) ? action.payload : []
        },

        addToCart: (state, action) => {
            const product = action.payload
            const existingItem = state.items.find((item) => matchesProduct(item, product))

            if (existingItem) {
                existingItem.quantity = (existingItem.quantity || 1) + 1
            } else {
                state.items.push({
                    ...product,
                    id: product._id || product.id,
                    quantity: 1
                })
            }
        },

        removeFromCart: (state, action) => {
            state.items = state.items.filter((item) => !matchesId(item, action.payload))
        },

        increaseQuantity: (state, action) => {
            const item = state.items.find((i) => matchesId(i, action.payload))
            if (item) {
                item.quantity = (item.quantity || 1) + 1
            }
        },

        decreaseQuantity: (state, action) => {
            const item = state.items.find((i) => matchesId(i, action.payload))
            if (item && item.quantity > 1) {
                item.quantity -= 1
            }
        },

        clearCart: (state) => {
            state.items = []
        }
    }
})

export const {
    addToCart,
    hydrateCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart
} = cartSlice.actions

export default cartSlice.reducer