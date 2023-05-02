import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  id: undefined,
  email: "",
  name: "",
  created_at: "",
  profile_pic: "",
  setting: undefined,
  role: "",
  allUsers: [],
  onlineUsers: [],
  loadingDashboard: false,
  showSpinner: false,
  showSaveNotification: false,
  showDeleteNotification: false,
}

export const userSlice = createSlice({
  name: 'user_info',
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
      state.id = action.payload.id
      state.email = action.payload.email
      state.name = action.payload.name
      state.created_at = action.payload.created_at
      state.profile_pic = action.payload.profile_pic
      state.setting = action.payload.setting
      state.role = action.payload.role
    },
    unsetUserInfo: (state, action) => {
      state.id = action.payload.id
      state.email = action.payload.email
      state.name = action.payload.name
      state.created_at = action.payload.created_at
      state.profile_pic = action.payload.profile_pic
      state.setting = action.payload.setting
      state.role = action.payload.role
    },
    setAllUsersData : (state, action) => {
      state.allUsers = action.payload.users
    },
    updateUserSettings : (state, action) => {
      state.setting = action.payload.setting
    },
    setLoadingDashboard: (state, action) => {
      state.loadingDashboard = action.payload.value
    }, 
    updateAllUsers: (state, action) => {
      let idx = state.allUsers.findIndex((a) => a.id === action.payload.user.id)
      let arr = [...state.allUsers]
      arr[idx].profile_pic = action.payload.user.profile_pic
      arr[idx].role = action.payload.user.role
      state.allUsers = arr
    },
    removeUser: (state, action) => {
      state.allUsers = state.allUsers.filter((a) => a.id !== action.payload.id)
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload.onlineUsers
    },
    setShowSpinner: (state, action) => {
      state.showSpinner = action.payload.showSpinner
    },
    setShowSaveNotification: (state, action) => {
      state.showSaveNotification = action.payload.showSaveNotification
    },
    setShowDeleteNotification: (state, action) => {
      state.showDeleteNotification = action.payload.showDeleteNotification
    }
  },
})

export const { 
  setUserInfo, 
  unsetUserInfo, 
  setAllUsersData, 
  updateUserSettings, 
  setLoadingDashboard, 
  updateAllUsers, 
  removeUser, 
  setOnlineUsers, 
  setShowSpinner,
  setShowSaveNotification,
  setShowDeleteNotification 
} = userSlice.actions

export default userSlice.reducer