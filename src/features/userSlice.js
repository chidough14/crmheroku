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
  followersData: [],
  exchangeRates: undefined,
  list: undefined,
  events: [],
  announcementsResults: [],
  totalProductSales: [],
  doughnutChartResults: [],
  doughnutSelect: false,
  measurement: null,
  barSelect: false,
  owner: null,
  weatherDetails: undefined,
  weatherLoading: false, 
  connectionError: false
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
      if(action.payload.mine) {
        state.usersFollowed = [...state.usersFollowed, action.payload.follower]
      } else {
        state.followers = [...state.followers, action.payload.follower]
      }
     
    },
    removeFollower: (state, action) => {
      if (action.payload.mine) {
        state.usersFollowed = state.usersFollowed.filter((a) => a.followee_id !== parseInt(action.payload.id))
      } else {
        state.followers = state.followers.filter((a) => a.follower_id !== parseInt(action.payload.id))
      }
     
    },
    reloadFollowers: (state, action) => {
      state.reload = !state.reload
    },
    setFollowersData: (state, action) => {
    
      if (Array.isArray(action.payload.followersData)) {
        state.followersData = [...state.followersData, ...action.payload.followersData]
      } else {
        state.followersData = [...state.followersData, action.payload.followersData]
      }
    },
    removeFollowersData: (state, action) => {
      state.followersData = state.followersData.filter((a)=> a.id !== action.payload.id)
    },
    emptyFollowersData: (state, action) => {
      state.followersData = []
    },
    setExchangeRates: (state, action) => {
      state.exchangeRates = action.payload.exchangeRates
    },
    setDashboardList: (state, action) => {
      state.list = action.payload.list
    },
    setDashboardEvents: (state, action) => {
      state.events = action.payload.events
    },
    setDashboardAnnouncements: (state, action) => {
      state.announcementsResults = action.payload.announcementsResults
    },
    setTotalProductsSales: (state, action) => {
      state.totalProductSales = action.payload.totalProductSales
    },
    setDoughnutChartResults: (state, action) => {
      state.doughnutChartResults = action.payload.doughnutChartResults
    },
    setDoughnutSelect: (state, action) => {
      state.doughnutSelect = action.payload.doughnutSelect
    },
    setMeasurement: (state, action) => {
      state.measurement = action.payload.measurement
    },
    setBarSelect: (state, action) => {
      state.barSelect = action.payload.barSelect
    },
    setOwner: (state, action) => {
      state.owner = action.payload.owner
    },
    setWeatherDetails: (state, action) => {
      state.weatherDetails = action.payload.weatherDetails
    },
    setWeatherLoading: (state, action) => {
      state.weatherLoading = action.payload.weatherLoading
    },
    setConnectionError: (state, action) => {
      state.connectionError = action.payload.connectionError
    },
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
  reloadFollowers,
  setFollowersData,
  removeFollowersData,
  emptyFollowersData,
  setExchangeRates,
  setDashboardList,
  setDashboardEvents,
  setDashboardAnnouncements,
  setTotalProductsSales,
  setDoughnutChartResults,
  setDoughnutSelect,
  setMeasurement,
  setBarSelect,
  setOwner,
  setWeatherDetails,
  setWeatherLoading,
  setConnectionError
} = userSlice.actions

export default userSlice.reducer