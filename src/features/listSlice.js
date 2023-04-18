import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  //lists: [],
  lists: undefined,
  openAlert: false,
  alertMessage: "",
  severity: "",
  list: undefined,
  selectedCompanyId: undefined,
  loadingCompanies: false,
  sortOption: "all"
}

export const listSlice = createSlice({
  name: 'list',
  initialState,
  reducers: {
    setLists: (state, action) => {
      state.lists = action.payload.lists
    },
    addList: (state, action) => {
      state.lists.data = [...state.lists.data, action.payload.list]
    },
    getSingleList: (state, action) => {
      state.list = state.lists.data.find((a) => a.id === action.payload.id)
    },
    removeCompanyFromList: (state, action) => {
      state.list.companies = state.list.companies.filter((a)=> a.id !== action.payload.companyId)
      if (state.list.companies.length) {
        state.selectedCompanyId = state.list.companies[0].id
      }
      
    },
    setSingleList: (state, action) => {
      state.list = action.payload.list
    },
    updateList: (state, action) => {
      let idx
      idx = state.lists.data.findIndex((a) => a.id === action.payload.list.id)
      state.lists.data[idx] = action.payload.list
    },
    removeList: (state, action) => {
      state.lists.data = state.lists.data.filter((a) => a.id !== action.payload.listId)
    },
    showAlert: (state, action) => {
      state.openAlert = true
      state.alertMessage = action.payload.alertMessage
      state.severity = action.payload.severity
    },
    closeAlert: (state, action) => {
      state.openAlert = false
      state.alertMessage = action.payload.alertMessage
      state.severity = action.payload.severity
    },
    setSelectedCompanyId: (state, action) => {
      state.selectedCompanyId = action.payload.id
    },
    setLoadingCompanies: (state, action) => {
      state.loadingCompanies = action.payload.value
    },
    setSortOptionValue: (state, action) => {
      state.sortOption = action.payload.option
    },
  },
})

export const { 
  setLists,
  addList, 
  updateList, 
  removeList, 
  showAlert, 
  closeAlert, 
  getSingleList, 
  setSingleList,
  setSelectedCompanyId ,
  removeCompanyFromList,
  setLoadingCompanies,
  setSortOptionValue
} = listSlice.actions

export default listSlice.reducer