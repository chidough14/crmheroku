import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  announcements: undefined,
  announcementsLoading: false,
  showAddSpinner: false,
  showDeleteNotification: false
}

export const AnnouncementsSlice = createSlice({
  name: 'announcement',
  initialState,
  reducers: {
    setAnnouncements: (state, action) => {
      state.announcements = action.payload.announcements
    },
    addAnnouncement: (state, action) => {
      state.announcements.data = [...state.announcements.data, action.payload.announcement]
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
  },
})

export const { 
  setAnnouncements,
  setAnnouncementsLoading,
  addAnnouncement,
  setShowAddSpinner,
  updateAnnouncement,
  setShowDeleteNotification,
  removeAnnouncement
} = AnnouncementsSlice.actions

export default AnnouncementsSlice.reducer