import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  users: [],
  hide: true,
  chatMessages: [],
  inbox: undefined,
  outbox: undefined,
  singleMessage: undefined,
  fetchNotifications: undefined,
  sendingMessage: false
}

export const MessageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload.users
    },
    setHide: (state, action) => {
      state.hide =action.payload.value
    },
    removeUser: (state, action) => {
      state.users = state.users.filter((a) => a.userName !== action.payload.userName)
    },
    setChatMessages: (state, action) => {
      state.chatMessages = [...state.chatMessages, action.payload.data]
    },
    setInboxMessages: (state, action) => {
      state.inbox = action.payload.inbox
    },
    readInboxMessages: (state, action) => {
      let idx = state.inbox.data.findIndex((a) => a.id === action.payload.messageId)
      state.inbox.data[idx].isRead = true 
    },
    setOutboxMessages: (state, action) => {
      state.outbox = action.payload.outbox
    },
    setSingleMessage: (state, action) => {
      state.singleMessage = action.payload.message
    },
    addNewMessage: (state, action) => {
      state.outbox.data = [...state.outbox.data, action.payload.message]
    },
    removeMessage: (state, action) => {
      state.outbox.data = state.outbox.data.filter((a) => a.id !== action.payload.messageId)
    },
    reloadNotifications: (state, action) => {
      state.fetchNotifications = !state.fetchNotifications
    },
    setSendingMessage: (state, action) => {
      state.sendingMessage = action.payload.isSending
    }
  },
})

export const { 
  setUsers, 
  setHide, 
  removeUser, 
  setChatMessages, 
  setUserMessages, 
  setInboxMessages, 
  setOutboxMessages,
  setSingleMessage,
  addNewMessage,
  removeMessage,
  readInboxMessages,
  reloadNotifications,
  setSendingMessage
} = MessageSlice.actions

export default MessageSlice.reducer