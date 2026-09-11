import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authService from '../../services/authService'

// Public store settings (shipping rules, store name) managed in Admin → Settings.
export const fetchStoreSettings = createAsyncThunk(
  'settings/fetchStoreSettings',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authService.getStoreSettings()
      return data.settings
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Unable to load store settings')
    }
  }
)

const initialState = {
  shipping: null,
  storeName: 'Aura',
  status: 'idle',
  error: null,
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    // Used by the admin Settings page so the storefront updates immediately after saving.
    setShippingSettings: (state, action) => {
      state.shipping = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStoreSettings.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchStoreSettings.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.shipping = action.payload?.shipping || null
        state.storeName = action.payload?.storeName || 'Aura'
        state.error = null
      })
      .addCase(fetchStoreSettings.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error?.message
      })
  },
})

export const { setShippingSettings } = settingsSlice.actions
export default settingsSlice.reducer
