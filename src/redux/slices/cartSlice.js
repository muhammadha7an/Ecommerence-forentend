import { createSlice } from '@reduxjs/toolkit'
import { getEffectivePrice, getStockLimit, sameProduct } from '../../utils/commerce'

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

// Never allow more units in the cart than the product's known stock.
const canAddOneMore = (itemOrProduct, currentQuantity) => {
    const limit = getStockLimit(itemOrProduct)
    return limit === null || currentQuantity < limit
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
                const quantity = existingItem.quantity || 1
                if (canAddOneMore(product, quantity)) {
                    existingItem.quantity = quantity + 1
                }
            } else if (canAddOneMore(product, 0)) {
                state.items.push({
                    ...product,
                    id: product._id || product.id,
                    price: getEffectivePrice(product),
                    originalPrice: Number(product.price || 0),
                    quantity: 1
                })
            }
        },

        removeFromCart: (state, action) => {
            state.items = state.items.filter((item) => !matchesId(item, action.payload))
        },

        increaseQuantity: (state, action) => {
            const item = state.items.find((i) => matchesId(i, action.payload))
            if (item && canAddOneMore(item, item.quantity || 1)) {
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
        },

        // Refresh price / stock / name / image of cart items from the live catalog.
        syncCartWithCatalog: (state, action) => {
            const catalog = Array.isArray(action.payload) ? action.payload : []
            if (catalog.length === 0) return

            state.items.forEach((item) => {
                const product = catalog.find((candidate) => sameProduct(candidate, item))

                if (!product) {
                    if (!item.isUnavailable) item.isUnavailable = true
                    return
                }

                const updates = {
                    _id: product._id || item._id,
                    legacyId: product.legacyId ?? item.legacyId ?? null,
                    name: product.name,
                    image: product.image,
                    category: product.category,
                    price: getEffectivePrice(product),
                    originalPrice: Number(product.price || 0),
                    stock: product.stock,
                    inStock: product.inStock,
                    isUnavailable: false
                }

                Object.entries(updates).forEach(([key, value]) => {
                    if (value !== undefined && item[key] !== value) item[key] = value
                })
            })
        },

        // Apply the quantities the server says are available (after a checkout stock error).
        clampCartQuantities: (state, action) => {
            const issues = Array.isArray(action.payload) ? action.payload : []

            issues.forEach((issue) => {
                const item = state.items.find((i) => matchesId(i, issue.productId))
                if (!item) return
                const available = Math.max(0, Number(issue.available) || 0)
                item.stock = available
                if (available === 0) item.inStock = false
                if ((item.quantity || 1) > available) item.quantity = available
            })

            state.items = state.items.filter((item) => (item.quantity || 0) > 0)
        }
    }
})

export const {
    addToCart,
    hydrateCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    syncCartWithCatalog,
    clampCartQuantities
} = cartSlice.actions

export default cartSlice.reducer
