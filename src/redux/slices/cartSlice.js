import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    items: []
}

const cartSlice = createSlice({
    name: 'cart',
    initialState,

    reducers: {
        hydrateCart: (state, action) => {
            state.items = Array.isArray(action.payload) ? action.payload : []
        },
   
            addToCart: (state, action) => {
                console.log('REDUX RECEIVED:', action.payload)

                const product = action.payload

                const existingItem = state.items.find(
                    (item) => item.id === product.id
                )

                if (existingItem) {
                    existingItem.quantity += 1
                } else {
                    state.items.push({
                        ...product,
                        quantity: 1
                    })
                }

                console.log('CART STATE AFTER ADD:', state.items)
            },

        removeFromCart: (state, action) => {
            state.items = state.items.filter(
                (item) => item.id !== action.payload
            )
        },

        increaseQuantity: (state, action) => {
            const item = state.items.find(
                (item) => item.id === action.payload
            )

            if (item) {
                item.quantity += 1
            }
        },

        decreaseQuantity: (state, action) => {
            const item = state.items.find(
                (item) => item.id === action.payload
            )

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