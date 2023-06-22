import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  companies: undefined,
  company: undefined,
  searchResults: [],
  showAddSpinner: false,
  showDeleteNotification: false
}

export const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    setSearchResults: (state, action) => {
      state.searchResults = action.payload.companies
    },
    setCompany: (state, action) => {
      state.companies = action.payload.companies
    },
    setSingleCompany: (state, action) => {
      state.company = action.payload.company
    },
    addActivityToCompany: (state, action) => {
      state.company.activities = [...state.company.activities, action.payload.activity]
    },
    emptyCompanyObject: (state, action) => {
      state.company = undefined
    },
    addCompany: (state, action) => {
      state.companies.data = [...state.companies.data, action.payload.company]
    },
    addCompanies: (state, action) => {
      state.companies.data = [...state.companies.data, ...action.payload.companies]
    },
    updateCompany: (state, action) => {
      let idx = state.companies.data.findIndex((a) => a.id === action.payload.company.id)
      state.companies.data[idx] = action.payload.company
    },
    removeCompany: (state, action) => {
      state.companies.data = state.companies.data.filter((a) => a.id !== action.payload.companyId)
    },
    removeCompanies: (state, action) => {
      state.companies.data = state.companies.data.filter((a) => !action.payload.companyIds.includes(a.id))
    },
    setShowAddSpinner: (state, action) => {
      state.showAddSpinner = action.payload.showAddSpinner
    },
    setShowDeleteNotification: (state, action) => {
      state.showDeleteNotification = action.payload.showDeleteNotification
    },
  },
})

export const { 
  setCompany, 
  setSingleCompany, 
  addActivityToCompany, 
  emptyCompanyObject,
  addCompany,
  updateCompany ,
  removeCompany,
  setSearchResults,
  setShowAddSpinner,
  setShowDeleteNotification,
  removeCompanies,
  addCompanies
} = companySlice.actions

export default companySlice.reducer