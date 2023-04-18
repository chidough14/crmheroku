import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  products: undefined,
  productsAll: []
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
  },
})

export const { 
  setProducts,
  addProduct,
  updateProduct,
  removeProduct,
  setProductsAll
} = ProductSlice.actions

export default ProductSlice.reducer