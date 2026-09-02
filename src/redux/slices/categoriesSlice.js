import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [
    { id: 1, name: 'Everyday Essentials' },
    { id: 2, name: 'Home Accents' },
    { id: 3, name: 'Accessories' },
    { id: 4, name: 'Stationery & Office' },
    { id: 5, name: 'Kitchen & Dining' },
    { id: 6, name: 'Self Care & Wellness' }
  ]
}

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {}
})

export default categoriesSlice.reducer