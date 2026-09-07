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
  items: [],
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
        state.items = Array.isArray(action.payload) ? action.payload : []
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