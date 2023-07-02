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
  showBarGraphLoadingNotification: false,
  showDoughnutGraphLoadingNotification: false,
  showLogoutNotification: false,
  showLoginSpinner: false,
  showAnnouncementsLoading: false,
  followers: [],
  followed: [],
  usersFollowers: [],
  usersFollowed: [],
  reload: false,
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
      if (action.payload.user) {
        let idx = state.allUsers.findIndex((a) => a.id === action.payload.user.id)
        let arr = [...state.allUsers]
        arr[idx].profile_pic = action.payload.user.profile_pic
        arr[idx].role = action.payload.user.role
        state.allUsers = arr
      }

      if (action.payload.users) {
        for(let i = 0; i< action.payload.users.length; i++) {
          let idx = state.allUsers.findIndex((a) => a.id === action.payload.users[i].id)
          let arr = [...state.allUsers]
          arr[idx].profile_pic = action.payload.users[i].profile_pic
          arr[idx].role = action.payload.users[i].role
          state.allUsers = arr
        }
      
      }
  
    },
    removeUser: (state, action) => {
      state.allUsers = state.allUsers.filter((a) => a.id !== action.payload.id)
    },
    removeUsers: (state, action) => {
      state.allUsers = state.allUsers.filter((a) => !action.payload.userIds.includes(a.id))
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
    },
    setShowBarGraphLoadingNotification: (state, action) => {
      state.showBarGraphLoadingNotification = action.payload.showBarGraphLoadingNotification
    },
    setShowDoughnutGraphLoadingNotification: (state, action) => {
      state.showDoughnutGraphLoadingNotification = action.payload.showDoughnutGraphLoadingNotification
    },
    setShowLogoutNotification: (state, action) => {
      state.showLogoutNotification = action.payload.showLogoutNotification
    },
    setShowLoginSpinner: (state, action) => {
      state.showLoginSpinner = action.payload.showLoginSpinner
    },
    setShowAnnouncementsLoading: (state, action) => {
      state.showAnnouncementsLoading = action.payload.showAnnouncementsLoading
    },
    setFollwers: (state, action) => {
      if(action.payload.followers) {
        state.followers = action.payload.followers
      }

      if(action.payload.usersFollowers) {
        state.usersFollowers = action.payload.usersFollowers
      }
    },
    setFollwed: (state, action) => {
      if(action.payload.followed) {
        state.followed = action.payload.followed
      }

      if(action.payload.usersFollowed) {
        state.usersFollowed = action.payload.usersFollowed
      }
    },
    addFollowers: (state, action) => {
      state.followers = [...state.followers, action.payload.follower]
    },
    removeFollower: (state, action) => {
      state.followers = state.followers.filter((a) => a.follower_id !== parseInt(action.payload.id))
    },
    reloadFollowers: (state, action) => {
      state.reload = !state.reload
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
  setShowDeleteNotification,
  setShowBarGraphLoadingNotification,
  setShowDoughnutGraphLoadingNotification,
  setShowLogoutNotification,
  setShowLoginSpinner,
  setShowAnnouncementsLoading,
  removeUsers,
  setFollwers,
  setFollwed,
  addFollowers,
  removeFollower,
  reloadFollowers
} = userSlice.actions

export default userSlice.reducer