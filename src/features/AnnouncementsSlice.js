import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  announcements: undefined,
  announcementsLoading: false,
  showAddSpinner: false,
  showDeleteNotification: false,
  categories: [],
  sortOption: "all",
}

export const AnnouncementsSlice = createSlice({
  name: 'announcement',
  initialState,
  reducers: {
    setAnnouncements: (state, action) => {
      state.announcements = action.payload.announcements
    },
    addAnnouncement: (state, action) => {
      state.announcements.data = [action.payload.announcement, ...state.announcements.data]
    },
    addAnnouncements: (state, action) => {
      state.announcements.data = [...state.announcements.data, ...action.payload.announcements]
    },
    setAnnouncementsLoading: (state, action) => {
      state.announcementsLoading = action.payload.announcementsLoading
    },
    setShowAddSpinner: (state, action) => {
      state.showAddSpinner = action.payload.showAddSpinner
    },
    updateAnnouncement: (state, action) => {
      let idx = state.announcements.data.findIndex((a) => a.id === action.payload.announcement.id)
      state.announcements.data[idx] = action.payload.announcement
    },
    setShowDeleteNotification: (state, action) => {
      state.showDeleteNotification = action.payload.showDeleteNotification
    },
    removeAnnouncement: (state, action) => {
      state.announcements.data = state.announcements.data.filter((a) => a.id !== action.payload.announcementId)
    },
    removeAnnouncements: (state, action) => {
      state.announcements.data = state.announcements.data.filter((a) => !action.payload.announcementsIds.includes(a.id))
    },
    setCategories: (state, action) => {
      state.categories = action.payload.categories
    },
    addCategory: (state, action) => {
      state.categories = [...state.categories, action.payload.category]
    },
    removeCategory: (state, action) => {
      state.categories = state.categories.filter((a) => a.id !== action.payload.id)
    },
    addCategories: (state, action) => {
      state.categories = [...state.categories, ...action.payload.categories]
    },
    setSortOptionValue: (state, action) => {
      state.sortOption = action.payload.option
    },
  },
})

export const { 
  setAnnouncements,
  setAnnouncementsLoading,
  addAnnouncement,
  setShowAddSpinner,
  updateAnnouncement,
  setShowDeleteNotification,
  removeAnnouncement,
  setCategories,
  setSortOptionValue,
  removeAnnouncements,
  addAnnouncements,
  addCategory,
  addCategories,
  removeCategory
} = AnnouncementsSlice.actions

export default AnnouncementsSlice.reducer