import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  events: [],
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
    },
  },
})

export const { 
  setEvents,
  addEvent,
  updateEvent,
  deleteEvent
} = EventSlice.actions

export default EventSlice.reducer