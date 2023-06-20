import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  activities: [],
  activity: undefined,
  openPrompt: false,
  sortOption: "all",
  showCompanySearchNotification: false,
  showSendingSpinner: false,
  showCloningNotification: false,
  showDeleteNotification: false,
  showTransferNotification: false,
  showCreatingInvoiceSpinner: false,
  activityIds: []
}

export const ActivitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    setActivities: (state, action) => {
      state.activities = action.payload.activities
    },
    addActivity: (state, action) => {
      state.activities = [...state.activities, action.payload.activity]
    },
    editActivity: (state, action) => {
      let idx
      idx = state.activities.findIndex((a) => a.id === action.payload.activity.id)
      
      let total = state.activities[idx].total
      state.activities[idx] = action.payload.activity
      state.activities[idx].total = total
    },
    editActivityProbability: (state, action) => {
      let idx
      idx = state.activities.findIndex((a) => a.id === action.payload.activity.id)
      state.activities[idx].probability = action.payload.activity.probability
      state.activities[idx].decreased_probability = action.payload.activity.decreased_probability
    },
    removeActivity: (state, action) => {
      state.activities = state.activities.filter((a) => a.id !== action.payload.activityId)
    },
    removeActivities: (state, action) => {
      state.activities = state.activities.filter((a) => !action.payload.activityIds.includes(a.id))
    },
    setSingleActivity: (state, action) => {
      state.activity = {...state.activity, ...action.payload.activity}
    },
    addEventToActivity: (state, action) => {
      state.activity.events = [...state.activity.events, action.payload.event]
    },
    updateActivityEvent: (state, action) => {
      let idx = state.activity.events.findIndex((a) => a.id === action.payload.event.id)
      state.activity.events[idx] = action.payload.event
    },
    deleteActivityEvent: (state, action) => {
      state.activity.events = state.activity.events.filter((a) => a.id !== action.payload.id)
    },
    addProductItemToActivity: (state, action) => {
      state.activity.products = [...state.activity.products, action.payload.product]
    },
    updateProductItem: (state, action) => {
      let idx = state.activity.products.findIndex((a) => a.id === action.payload.product.id)
      state.activity.products[idx] = action.payload.product
    },
    removeProductItem: (state, action) => {
      state.activity.products = state.activity.products.filter((a) => a.id !== action.payload.id)
    },
    setOpenPrompt: (state, action) => {
      state.openPrompt = action.payload.value
    },
    setClosePrompt: (state, action) => {
      state.openPrompt = action.payload.value
    },
    addInvoiceToActivity: (state, action) => {
      state.activity.invoices = [...state.activity.invoices, action.payload.invoice]
    },
    removeInvoiceFromActivity: (state, action) => {
      state.activity.invoices = state.activity.invoices.filter((a) => a.id !== action.payload.invoiceId)
    },
    setSortOptionValue: (state, action) => {
      state.sortOption = action.payload.option
    },
    setShowCompanySearchNotification: (state, action) => {
      state.showCompanySearchNotification = action.payload.showCompanySearchNotification
    },
    setShowSendingSpinner: (state, action) => {
      state.showSendingSpinner = action.payload.showSendingSpinner
    },
    setShowCloningNotification: (state, action) => {
      state.showCloningNotification = action.payload.showCloningNotification
    },
    setShowDeleteNotification: (state, action) => {
      state.showDeleteNotification = action.payload.showDeleteNotification
    },
    setShowTransferNotification: (state, action) => {
      state.showTransferNotification = action.payload.showTransferNotification
    },
    setShowCreatingInvoiceSpinner: (state, action) => {
      state.showCreatingInvoiceSpinner = action.payload.showCreatingInvoiceSpinner
    },
    addActivityId: (state, action)  => {
      state.activityIds = [...state.activityIds, action.payload.id]
    },
    removeActivityId: (state, action) => {
      state.activityIds = state.activityIds.filter((a) => a !== action.payload.id)
    },
    addActivityIds: (state, action)  => {
      state.activityIds = action.payload.activityIds
    },
    removeActivityIds: (state, action) => {
      state.activityIds = state.activityIds.filter((a) => !action.payload.activityIds.includes(a))
    }
  },
})

export const { 
  setActivities,
  addActivity,
  editActivity,
  removeActivity,
  setSingleActivity,
  addProductItemToActivity,
  updateProductItem,
  removeProductItem,
  addEventToActivity,
  updateActivityEvent,
  deleteActivityEvent,
  setOpenPrompt,
  setClosePrompt,
  addInvoiceToActivity,
  removeInvoiceFromActivity,
  setSortOptionValue,
  editActivityProbability,
  setShowCompanySearchNotification,
  setShowSendingSpinner,
  setShowCloningNotification,
  setShowDeleteNotification,
  setShowTransferNotification,
  setShowCreatingInvoiceSpinner,
  addActivityId,
  removeActivityId,
  addActivityIds,
  removeActivityIds,
  removeActivities
} = ActivitySlice.actions

export default ActivitySlice.reducer