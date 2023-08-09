import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  users: [],
  hide: true,
  chatMessages: [],
  inbox: undefined,
  outbox: undefined,
  singleMessage: undefined,
  fetchNotifications: undefined,
  sendingMessage: false,
  showUpdateNotification: false,
  showDeleteteNotification: false,
  reloadMessages: false,
  showSingleMessage: false,
  page: 1,
  currentMessageId: undefined,
  fromBell: false,
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
      state.inbox.data[idx].isRead = action.payload.isRead 
    },
    massReadInboxMessages: (state, action) => {

      if(action.payload.readArray.length) {
        for(let i = 0; i < action.payload.readArray.length; i++) {
          let idx = state.inbox.data.findIndex((a) => a.id === action.payload.readArray[i])
          state.inbox.data[idx].isRead = false 
        }
      }

      if(action.payload.unreadArray.length) {
        for(let i = 0; i < action.payload.unreadArray.length; i++) {
          let idx = state.inbox.data.findIndex((a) => a.id === action.payload.unreadArray[i])
          state.inbox.data[idx].isRead = true 
        }
      }
    
   
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
      if (action.payload.isInbox) {
        state.inbox.data = state.inbox.data.filter((a) => a.id !== action.payload.messageId)
      } else {
        state.outbox.data = state.outbox.data.filter((a) => a.id !== action.payload.messageId)
      }
    },
    removeMessages: (state, action) => {
      if (action.payload.isInbox) {
        state.inbox.data = state.inbox.data.filter((a) => !action.payload.messageIds.includes(a.id))
      } else {
        state.outbox.data = state.outbox.data.filter((a) => !action.payload.messageIds.includes(a.id))
      }
    },
    reloadNotifications: (state, action) => {
      state.fetchNotifications = !state.fetchNotifications
    },
    setSendingMessage: (state, action) => {
      state.sendingMessage = action.payload.isSending
    },
    setShowUpdateNotification: (state, action) => {
      state.showUpdateNotification = action.payload.showUpdateNotification
    },
    setShowDeleteNotification: (state, action) => {
      state.showDeleteteNotification = action.payload.showDeleteteNotification
    },
    setReloadMessages: (state, action) => {
      state.reloadMessages = action.payload.reloadMessages
    },
    setShowSingleMessage: (state, action) => {
      state.showSingleMessage = action.payload.showSingleMessage
    },
    setPage: (state, action) => {
      state.page = action.payload.page
    },
    setCurrentMessageId: (state, action) => {
      state.currentMessageId = action.payload.currentMessageId
    },
    setFromBell: (state, action) => {
      state.fromBell = action.payload.fromBell
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
  setSendingMessage,
  removeMessages,
  massReadInboxMessages,
  setShowUpdateNotification,
  setShowDeleteNotification,
  setReloadMessages,
  setShowSingleMessage,
  setPage,
  setCurrentMessageId,
  setFromBell
} = MessageSlice.actions

export default MessageSlice.reducer