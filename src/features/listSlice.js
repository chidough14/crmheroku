import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  lists: undefined,
  openAlert: false,
  alertMessage: "",
  severity: "",
  list: undefined,
  selectedCompanyId: undefined,
  loadingCompanies: false,
  sortOption: "all",
  showSpinner: false,
  showCloningNotification: false,
  showUploadNotification: false,
  listIds: []
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
    removeLists: (state, action) => {
      state.lists.data = state.lists.data.filter((a) => !action.payload.listIds.includes(a.id))
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
    setShowSpinner: (state, action) => {
      state.showSpinner = action.payload.showSpinner
    },
    setShowCloningNotification: (state, action) => {
      state.showCloningNotification = action.payload.showCloningNotification
    },
    setShowUploadNotification: (state, action) => {
      state.showUploadNotification = action.payload.showUploadNotification
    },
    addListId: (state, action)  => {
      state.listIds = [...state.listIds, action.payload.id]
    },
    addListIds: (state, action)  => {
      state.listIds = action.payload.listIds
    },
    removeListId: (state, action) => {
      state.listIds = state.listIds.filter((a) => a !== action.payload.id)
    },
    removeListIds: (state, action) => {
      state.listIds = state.listIds.filter((a) => !action.payload.listIds.includes(a))
    }
  },
})

export const { 
  setLists,
  addList, 
  updateList, 
  removeList, 
  removeLists,
  showAlert, 
  closeAlert, 
  getSingleList, 
  setSingleList,
  setSelectedCompanyId ,
  removeCompanyFromList,
  setLoadingCompanies,
  setSortOptionValue,
  setShowSpinner,
  setShowCloningNotification,
  setShowUploadNotification,
  addListId,
  addListIds,
  removeListId,
  removeListIds
} = listSlice.actions

export default listSlice.reducer