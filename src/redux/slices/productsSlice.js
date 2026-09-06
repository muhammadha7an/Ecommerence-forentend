import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authService from '../../services/authService'

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params, { rejectWithValue }) => {
    try {
      const data = await authService.getProducts(params)
      return data.products || []
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load products')
    }
  }
)

const initialState = {
  items: [
    // --- Everyday Essentials (categoryId: 1) ---
    { id: 1, name: 'Canvas Tote Bag', price: 24, categoryId: 1, category: 'Everyday Essentials', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&q=80' },
    { id: 2, name: 'Stainless Steel Water Bottle', price: 28, categoryId: 1, category: 'Everyday Essentials', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80' },
    { id: 3, name: 'Eco Mesh Shopping Bag', price: 12, categoryId: 1, category: 'Everyday Essentials', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&q=80' },
    { id: 4, name: 'Insulated Travel Tumbler', price: 32, categoryId: 1, category: 'Everyday Essentials', image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500&q=80' },
    { id: 5, name: 'Reusable Cotton Face Pads', price: 15, categoryId: 1, category: 'Everyday Essentials', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80' },
    { id: 31, name: 'Foldable Reusable Shopping Crate', price: 20, categoryId: 1, category: 'Everyday Essentials', image: 'https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?w=500&q=80' },
    { id: 32, name: 'Silicone Food Storage Bags (Set of 3)', price: 19, categoryId: 1, category: 'Everyday Essentials', image: 'https://images.unsplash.com/photo-1584473457406-6240486418e9?w=500&q=80' },
    { id: 48, name: 'Collapsible Silicone Cup', price: 13, categoryId: 1, category: 'Everyday Essentials', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80' },
    { id: 49, name: 'Organic Cotton Produce Bags (Set of 5)', price: 16, categoryId: 1, category: 'Everyday Essentials', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&q=80' },
    { id: 50, name: 'Reusable Beeswax Food Wraps', price: 21, categoryId: 1, category: 'Everyday Essentials', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80' },

    // --- Home Accents (categoryId: 2) ---
    { id: 6, name: 'Ceramic Coffee Mug', price: 18, categoryId: 2, category: 'Home Accents', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80' },
    { id: 7, name: 'Soy Wax Scented Candle', price: 22, categoryId: 2, category: 'Home Accents', image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500&q=80' },
    { id: 8, name: 'Woven Cotton Throw Blanket', price: 45, categoryId: 2, category: 'Home Accents', image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500&q=80' },
    { id: 9, name: 'Minimalist Ceramic Vase', price: 30, categoryId: 2, category: 'Home Accents', image: 'https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?w=500&q=80' },
    { id: 10, name: 'Decorative Brass Tray', price: 38, categoryId: 2, category: 'Home Accents', image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=500&q=80' },
    { id: 11, name: 'Tabletop Succulent Planter', price: 26, categoryId: 2, category: 'Home Accents', image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&q=80' },
    { id: 33, name: 'Macrame Wall Hanging', price: 34, categoryId: 2, category: 'Home Accents', image: 'https://images.unsplash.com/photo-1587384215930-3b7f174e0bfd?w=500&q=80' },
    { id: 34, name: 'Rattan Storage Basket', price: 29, categoryId: 2, category: 'Home Accents', image: 'https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?w=500&q=80' },
    { id: 35, name: 'Terracotta Plant Pot Trio', price: 24, categoryId: 2, category: 'Home Accents', image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&q=80' },
    { id: 51, name: 'Linen Throw Pillow Cover', price: 19, categoryId: 2, category: 'Home Accents', image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500&q=80' },
    { id: 52, name: 'Wooden Wall Clock', price: 40, categoryId: 2, category: 'Home Accents', image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=500&q=80' },
    { id: 53, name: 'Woven Jute Doormat', price: 27, categoryId: 2, category: 'Home Accents', image: 'https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?w=500&q=80' },

    // --- Accessories (categoryId: 3) ---
    { id: 12, name: 'Minimalist Wrist Watch', price: 85, categoryId: 3, category: 'Accessories', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80' },
    { id: 13, name: 'Handcrafted Leather Keychain', price: 14, categoryId: 3, category: 'Accessories', image: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=500&q=80' },
    { id: 14, name: 'Canvas Baseball Cap', price: 25, categoryId: 3, category: 'Accessories', image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&q=80' },
    { id: 15, name: 'Wool Blend Knit Scarf', price: 35, categoryId: 3, category: 'Accessories', image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=500&q=80' },
    { id: 16, name: 'Polarized Sunglasses', price: 48, categoryId: 3, category: 'Accessories', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80' },
    { id: 36, name: 'Leather Belt', price: 32, categoryId: 3, category: 'Accessories', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80' },
    { id: 37, name: 'Woven Friendship Bracelet Set', price: 10, categoryId: 3, category: 'Accessories', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&q=80' },
    { id: 38, name: 'Canvas Crossbody Bag', price: 44, categoryId: 3, category: 'Accessories', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&q=80' },
    { id: 54, name: 'Silk Neck Tie', price: 30, categoryId: 3, category: 'Accessories', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80' },
    { id: 55, name: 'Merino Wool Beanie', price: 26, categoryId: 3, category: 'Accessories', image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=500&q=80' },
    { id: 56, name: 'Leather Wallet', price: 52, categoryId: 3, category: 'Accessories', image: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=500&q=80' },

    // --- Stationery & Office (categoryId: 4) ---
    { id: 17, name: 'Linen Hardcover Notebook', price: 16, categoryId: 4, category: 'Stationery & Office', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80' },
    { id: 18, name: 'Classic Fountain Pen Set', price: 40, categoryId: 4, category: 'Stationery & Office', image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&q=80' },
    { id: 19, name: 'Wooden Desk Organizer', price: 28, categoryId: 4, category: 'Stationery & Office', image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=500&q=80' },
    { id: 20, name: 'Leather Pocket Journal', price: 22, categoryId: 4, category: 'Stationery & Office', image: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=500&q=80' },
    { id: 21, name: 'Brass Bookmarks (Set of 3)', price: 12, categoryId: 4, category: 'Stationery & Office', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80' },
    { id: 39, name: 'Washi Tape Collection', price: 9, categoryId: 4, category: 'Stationery & Office', image: 'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=500&q=80' },
    { id: 40, name: 'Recycled Paper Sticky Notes', price: 7, categoryId: 4, category: 'Stationery & Office', image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&q=80' },
    { id: 41, name: 'Wooden Desk Calendar', price: 18, categoryId: 4, category: 'Stationery & Office', image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=500&q=80' },
    { id: 57, name: 'Kraft Paper Envelope Set', price: 11, categoryId: 4, category: 'Stationery & Office', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80' },
    { id: 58, name: 'Leather Pen Holder', price: 15, categoryId: 4, category: 'Stationery & Office', image: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=500&q=80' },
    { id: 59, name: 'Corkboard Wall Planner', price: 24, categoryId: 4, category: 'Stationery & Office', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80' },

    // --- Kitchen & Dining (categoryId: 5) ---
    { id: 22, name: 'Wooden Salad Bowl Set', price: 42, categoryId: 5, category: 'Kitchen & Dining', image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=500&q=80' },
    { id: 23, name: 'Glass Teapot with Infuser', price: 36, categoryId: 5, category: 'Kitchen & Dining', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80' },
    { id: 24, name: 'Marble Coaster Set (Set of 4)', price: 20, categoryId: 5, category: 'Kitchen & Dining', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500&q=80' },
    { id: 25, name: 'Linen Dinner Napkins (Set of 4)', price: 22, categoryId: 5, category: 'Kitchen & Dining', image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=500&q=80' },
    { id: 42, name: 'Cast Iron Trivet', price: 17, categoryId: 5, category: 'Kitchen & Dining', image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=500&q=80' },
    { id: 43, name: 'Handblown Glass Tumbler Set', price: 34, categoryId: 5, category: 'Kitchen & Dining', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80' },
    { id: 44, name: 'Bamboo Cutting Board', price: 26, categoryId: 5, category: 'Kitchen & Dining', image: 'https://images.unsplash.com/photo-1584346133934-260ef1f42e59?w=500&q=80' },
    { id: 60, name: 'Stoneware Dinner Plate Set', price: 48, categoryId: 5, category: 'Kitchen & Dining', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500&q=80' },
    { id: 61, name: 'Copper Moscow Mule Mugs (Set of 2)', price: 30, categoryId: 5, category: 'Kitchen & Dining', image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=500&q=80' },
    { id: 62, name: 'Olive Wood Serving Spoons', price: 21, categoryId: 5, category: 'Kitchen & Dining', image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=500&q=80' },
    { id: 78, name: 'Handwoven Wool Area Rug', price: 480, categoryId: 2, category: 'Home Accents', image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500&q=80' },
    { id: 79, name: 'Antique Brass Floor Lamp', price: 320, categoryId: 2, category: 'Home Accents', image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=500&q=80' },
    { id: 80, name: 'Solid Teak Dining Table', price: 890, categoryId: 2, category: 'Home Accents', image: 'https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?w=500&q=80' },
    { id: 81, name: 'Swiss Automatic Chronograph Watch', price: 750, categoryId: 3, category: 'Accessories', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80' },
    { id: 82, name: 'Full-Grain Leather Duffel Bag', price: 360, categoryId: 3, category: 'Accessories', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&q=80' },
    { id: 83, name: 'Cashmere Wool Overcoat', price: 620, categoryId: 3, category: 'Accessories', image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=500&q=80' },
    { id: 84, name: 'Ergonomic Leather Office Chair', price: 540, categoryId: 4, category: 'Stationery & Office', image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=500&q=80' },
    { id: 85, name: 'Solid Walnut Executive Desk', price: 920, categoryId: 4, category: 'Stationery & Office', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80' },
    { id: 86, name: 'Limited Edition Fountain Pen', price: 280, categoryId: 4, category: 'Stationery & Office', image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&q=80' },
    { id: 87, name: 'Copper Cookware Set (10-Piece)', price: 680, categoryId: 5, category: 'Kitchen & Dining', image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=500&q=80' },
    { id: 88, name: 'Handmade Porcelain Dinnerware Set', price: 510, categoryId: 5, category: 'Kitchen & Dining', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500&q=80' },
    { id: 89, name: 'Crystal Wine Decanter Set', price: 340, categoryId: 5, category: 'Kitchen & Dining', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80' },
    { id: 90, name: 'Professional Massage Chair', price: 980, categoryId: 6, category: 'Self Care & Wellness', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80' },
    { id: 91, name: 'Premium Infrared Sauna Blanket', price: 350, categoryId: 6, category: 'Self Care & Wellness', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&q=80' },
    { id: 92, name: 'Luxury Silk Robe & Slipper Set', price: 240, categoryId: 6, category: 'Self Care & Wellness', image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500&q=80' },
    // --- Self Care & Wellness (categoryId: 6) ---
    { id: 26, name: 'Aroma Essential Oil Diffuser', price: 35, categoryId: 6, category: 'Self Care & Wellness', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&q=80' },
    { id: 27, name: 'Organic Herbal Tea Sampler', price: 18, categoryId: 6, category: 'Self Care & Wellness', image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=500&q=80' },
    { id: 28, name: 'Silk Sleep Eye Mask', price: 24, categoryId: 6, category: 'Self Care & Wellness', image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500&q=80' },
    { id: 29, name: 'Bamboo Dry Body Brush', price: 16, categoryId: 6, category: 'Self Care & Wellness', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80' },
    { id: 45, name: 'Lavender Bath Salts', price: 15, categoryId: 6, category: 'Self Care & Wellness', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&q=80' },
    { id: 46, name: 'Weighted Meditation Cushion', price: 55, categoryId: 6, category: 'Self Care & Wellness', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80' },
    { id: 47, name: 'Natural Loofah Sponge Set', price: 11, categoryId: 6, category: 'Self Care & Wellness', image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=500&q=80' },
    { id: 63, name: 'Jade Facial Roller', price: 20, categoryId: 6, category: 'Self Care & Wellness', image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500&q=80' },
    { id: 64, name: 'Shea Butter Hand Cream', price: 13, categoryId: 6, category: 'Self Care & Wellness', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&q=80' },
    { id: 65, name: 'Herbal Bath Soak Sampler', price: 22, categoryId: 6, category: 'Self Care & Wellness', image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=500&q=80' }


    
  ],
  loading: false,
  error: null,
}

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    addProductLocally: (state, action) => {
      state.items.unshift(action.payload)
    },
    updateProductLocally: (state, action) => {
      const updated = action.payload
      const index = state.items.findIndex(
        (item) => (updated._id && item._id === updated._id) || (updated.id && item.id === updated.id)
      )
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updated }
      }
    },
    removeProductLocally: (state, action) => {
      const idToRemove = action.payload
      state.items = state.items.filter(
        (item) => item._id !== idToRemove && item.id !== idToRemove && item.legacyId !== idToRemove
      )
    },
    setProducts: (state, action) => {
      state.items = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        if (Array.isArray(action.payload) && action.payload.length > 0) {
          state.items = action.payload
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error?.message
      })
  }
})

export const {
  addProductLocally,
  updateProductLocally,
  removeProductLocally,
  setProducts
} = productsSlice.actions

export default productsSlice.reducer
