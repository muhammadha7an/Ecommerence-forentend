import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authService from '../../services/authService'

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authService.getCategories()
      return data.categories || []
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load categories')
    }
  }
)

const initialState = {
  items: [
    { id: 1, name: 'Everyday Essentials', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600' },
    { id: 2, name: 'Home Accents', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600' },
    { id: 3, name: 'Accessories', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600' },
    { id: 4, name: 'Stationery & Office', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600' },
    { id: 5, name: 'Kitchen & Dining', image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&q=80&w=600' },
    { id: 6, name: 'Self Care & Wellness', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600' }
  ],
  loading: false,
  error: null,
}

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    addCategoryLocally: (state, action) => {
      state.items.push(action.payload)
    },
    updateCategoryLocally: (state, action) => {
      const updated = action.payload
      const index = state.items.findIndex(
        (item) => (updated._id && item._id === updated._id) || (updated.id && item.id === updated.id)
      )
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updated }
      }
    },
    removeCategoryLocally: (state, action) => {
      const idToRemove = action.payload
      state.items = state.items.filter(
        (item) => item._id !== idToRemove && item.id !== idToRemove && item.legacyId !== idToRemove
      )
    },
    setCategories: (state, action) => {
      state.items = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false
        if (Array.isArray(action.payload) && action.payload.length > 0) {
          state.items = action.payload
        }
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error?.message
      })
  }
})

export const {
  addCategoryLocally,
  updateCategoryLocally,
  removeCategoryLocally,
  setCategories
} = categoriesSlice.actions

export default categoriesSlice.reducer