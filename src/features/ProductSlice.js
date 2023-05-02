import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  products: undefined,
  productsAll: [],
  productAdding: false,
  showDeleteNotification: false
}

export const ProductSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload.products
    },
    addProduct: (state, action) => {
      state.products.data = [...state.products.data, action.payload.product]
    },
    updateProduct: (state, action) => {
      let idx = state.products.data.findIndex((a) => a.id === action.payload.product.id)
      state.products.data[idx] = action.payload.product
    },
    removeProduct: (state, action) => {
      state.products.data = state.products.data.filter((a) => a.id !== action.payload.productId)
    },
    setProductsAll: (state, action) => {
      state.productsAll = action.payload.products
    },
    setProductAdding: (state, action) => {
      state.productAdding = action.payload.productAdding
    },
    setShowDeleteNotification: (state, action) => {
      state.showDeleteNotification = action.payload.showDeleteNotification
    },
  },
})

export const { 
  setProducts,
  addProduct,
  updateProduct,
  removeProduct,
  setProductsAll,
  setProductAdding,
  setShowDeleteNotification
} = ProductSlice.actions

export default ProductSlice.reducer