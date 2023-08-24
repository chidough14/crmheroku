import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  events: [],
  openMask: false,
  showSendingSpinner: false,
  showDeletingNotification: false,
  reloadEvents: false
}

export const EventSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    setEvents: (state, action) => {
      state.events = action.payload.events
    },
    addEvent: (state, action) => {
      state.events = [...state.events, action.payload.event]
    },
    updateEvent: (state, action) => {
      let idx
      idx = state.events.findIndex((a) => a.id === action.payload.event.id)
      state.events[idx] = action.payload.event
    },
    deleteEvent: (state, action) => {
      if (action.payload.eventId) {
        state.events = state.events.filter((a) => a.id !== action.payload.eventId)
      }
     
      if (action.payload.activityId) {
        state.events = state.events.filter((a) => a.activity_id !== action.payload.activityId)
      }

      if (action.payload.activityIds) {
        state.events = state.events.filter((a) => !action.payload.activityIds.includes(a.activity_id))
      }
    },
    setShowSendingSpinner: (state, action) => {
      state.showSendingSpinner = action.payload.showSendingSpinner
    },
    setShowDeletingNotification: (state, action) => {
      state.showDeletingNotification = action.payload.showDeletingNotification
    },
    setOpenMask: (state, action) => {
      state.openMask = action.payload.openMask
    },
    setReloadEvents: (state, action) => {
      state.reloadEvents = !state.reloadEvents
    }
  },
})

export const { 
  setEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  setOpenMask,
  setShowSendingSpinner,
  setShowDeletingNotification,
  setReloadEvents
} = EventSlice.actions

export default EventSlice.reducer