import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import LoginReg from "./pages/auth/LoginReg";
import ResetPassword from "./pages/auth/ResetPassword";
import SendPasswordResetEmail from "./pages/auth/SendPasswordResetEmail";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import { useDispatch, useSelector } from "react-redux";
import Lists from "./pages/Lists";
import { useEffect, useState } from "react";
import { getToken } from "./services/LocalStorageService";
import { setAllUsersData, setConnectionError, setDashboardEvents, setDashboardList, setExchangeRates, setFollowersData, setLabels, setLabelsLoading, setUserInfo, setWeatherDetails, setWeatherLoading } from "./features/userSlice";
import { useGetLoggedUserQuery } from "./services/userAuthApi";
import Activities from "./pages/Activities";
import SingleList from "./pages/SingleList";
import CalendarEvents from "./pages/CalendarEvents";
import Company from "./pages/Company";
import instance from "./services/fetchApi";
import {  setReloadDashboardLists } from "./features/listSlice";
import { setActivities, setActivitiesLoading, setReloadActivities } from "./features/ActivitySlice";
import ActivityDetails from "./pages/activities/ActivityDetails";
import { setReloadDashboardEvents } from "./features/EventSlice";
import Settings from "./pages/settings/Settings";
import MyMeetings from "./pages/meetings/MyMeetings";
import JoinMeeting from "./pages/meetings/JoinMeeting";
import UserMessages from "./pages/userMessages/UserMessages";
import SingleMessage from "./pages/userMessages/SingleMessage";
import AppLayout from "./pages/AppLayout";
import { setUserToken } from "./features/authSlice";
import Orders from "./pages/orders/Orders";
import MyAccount from "./pages/auth/MyAccount";

import socketIO from 'socket.io-client';
import CheckoutSuccess from "./components/CheckoutSuccess";
import Announcements from "./pages/announcements/Announcements";
import ChatButton from "./components/ChatButton";
import Conversations from "./components/Conversations";
import UserToUserChat from "./components/UserToUserChat";
import Weather from "./pages/weather/Weather";
import MyLabel from "./pages/labels/MyLabel";

const socket = socketIO('');
// const socket = socketIO('http://localhost:4000');

function App() {
  const token =  getToken()
  const auth = useSelector(state => state.auth)
  const { reloadActivities } = useSelector(state => state.activity)
  const { reloadDashboardEvents } = useSelector(state => state.event)
  const { reloadDashboardLists } = useSelector(state => state.list)
  const dispatch = useDispatch()
  const { data, isSuccess } = useGetLoggedUserQuery(token)
  const navigate = useNavigate()

  const fetchExchangeRates = async () => {
    await instance.get(`https://api.currencyfreaks.com/v2.0/rates/latest?apikey=${process.env.REACT_APP_CURRENCY_API_SECRET_KEY}`)
    .then((res) => {
      dispatch(setExchangeRates({exchangeRates: res.data.rates}))
    })
    .catch((e) => {
       console.log(e);
    })
  }

  const fetchWeatherUpdate = async () => {
    dispatch(setWeatherLoading({weatherLoading: true}))
    dispatch(setConnectionError({connectionError: false}))

    await instance.get(`http://api.weatherapi.com/v1/forecast.json?key=${process.env.REACT_APP_WEATHER_API_KEY}&q=auto:ip&days=7`)
    .then((res) => {
      dispatch(setWeatherDetails({weatherDetails: res.data}))
      dispatch(setConnectionError({connectionError: false}))
      dispatch(setWeatherLoading({weatherLoading: false}))
    })
    .catch((e) => {
      dispatch(setConnectionError({connectionError: true}))
      dispatch(setWeatherLoading({weatherLoading: false}))
    })
  }


  useEffect(() => {
    const fetchDataAtIntervals = async () => {
      // Initial delay of 15 minutes
      await new Promise(resolve => setTimeout(resolve, 15 * 60 * 1000));

      // Fetch data initially
      await fetchWeatherUpdate();

      // Set up interval to fetch data every 15 minutes
      const intervalId = setInterval(async () => {
        await fetchWeatherUpdate();
      }, 15 * 60 * 1000);
      
      return () => clearInterval(intervalId);
    };

    fetchDataAtIntervals();
  }, []);

  useEffect(() => {
    let rates = {
      GBP: 0.8240269799382,
      SEK: 10.952982985376233,
      EUR: 0.9447777410364212,
    }

    dispatch(setExchangeRates({exchangeRates: rates}))
    // fetchExchangeRates()
   }, [])
  
  useEffect(() => {
   
    if(data?.user?.id) {
      socket.emit('userId', {id: data?.user?.id, role: data?.user?.role});
    }
  }, [data])


  useEffect(() => {
    if (token) {
      dispatch(setUserToken({
        token: token,
      }))
    }
  }, [token])


  useEffect(() => {
    if (data && isSuccess) {
      dispatch(setUserInfo({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        created_at: data.user.created_at,
        profile_pic: data.user.profile_pic,
        setting: data.user.setting,
        role: data.user.role,
      }))
    }
  }, [data, isSuccess, dispatch])

  const getActivities = async () => {
    dispatch(setActivitiesLoading({activitiesLoading: true}))
    await instance.get(`activities`)
    .then((res)=> {
      dispatch(setActivities({activities: res.data.activities}))
      dispatch(setActivitiesLoading({activitiesLoading: false}))
      return Promise.resolve(true);
    })
    .catch((e)=>{
      return Promise.resolve(false);
    })
  }

  const getLabels = async () => {
    dispatch(setLabelsLoading({labelsLoading: true}))
    await instance.get(`labels`)
    .then((res)=> {
      dispatch(setLabels({labels: res.data.labels}))
      dispatch(setLabelsLoading({labelsLoading: false}))
      return Promise.resolve(true);
    })
    .catch((e)=>{
      return Promise.resolve(false);
    })
  }

  useEffect(() => {


    let requests = []
    requests.push(
      getActivities(),
      getLabels(),
      instance.get(`followers-offline-activities`)
      .then((res)=> {
        dispatch(setFollowersData({followersData: res.data.followersData}))
        return Promise.resolve(true);
      })
      .catch((e)=>{
        return Promise.resolve(false);
      }),
      instance.get(`users`)
      .then((res) => {
        dispatch(setAllUsersData({users: res.data.users}))
        return Promise.resolve(true);
      })
      .catch((e)=>{
        return Promise.resolve(false);
      }),
    )


    const  runAll = async () => {
      // dispatch(setLoadingDashboard({value: true}))
      await Promise.all(requests).then((results)=>{
       
        // dispatch(setLoadingDashboard({value: false}))
      })
      .catch((err)=> {
        console.log(err);
      })
    }

    if (auth?.token) {
      runAll()
    }
   
  
  }, [auth?.token])



  const fetchActivities = async () => {
    await instance.get(`/activities`)
    .then((res) => {
      dispatch(setActivities({activities: res.data.activities}))
      dispatch(setReloadActivities({reloadActivities: false}))
    })
  }

  const fetchDashboardEvents = async () => {
    await instance.get(`dashboardevents`)
    .then((res) => {
      dispatch(setDashboardEvents({events: res.data.events}))
      dispatch(setReloadDashboardEvents({reloadDashboardEvents: false}))
    })
  }

  const fetchDashboardList = async () => {
    await  instance.get(`mylists-dashboard`)
    .then((res) => {
      dispatch(setDashboardList({list: res.data.list}))
      dispatch(setReloadDashboardLists({reloadDashboardLists: false}))
    })
  }

  useEffect(() => {
    if (reloadActivities) {
      fetchActivities()
    }

  }, [reloadActivities])

  useEffect(() => {
    if (reloadDashboardEvents) {
      fetchDashboardEvents()
    }

  }, [reloadDashboardEvents])

  useEffect(() => {
    if (reloadDashboardLists) {
      fetchDashboardList()
    }

  }, [reloadDashboardLists])

  const renderChatButton = () => {
    if (!data) {
      return null
    } else {
      if (data?.user?.role === "super admin" || data?.user?.role === "admin") {
        return null
      } else {
        return  <ChatButton socket={socket} />
      }
    }
  }

  return (
    <>
      {/* <SessionTimer socket={socket} /> */}
      {/* <BrowserRouter> */}
        <Routes>
          <Route path="/" element={<AppLayout  socket={socket} />}>
            <Route index element={<Home />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<LoginReg />} />
            <Route path="sendpasswordresetemail" element={<SendPasswordResetEmail />} />
            <Route path="api/reset/:token" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard  socket={socket} />} />
            <Route path="/lists" element={<Lists socket={socket}/>} />
            <Route path="/listsview/:id" element={<SingleList />} />
            <Route path="/companies/:id" element={<Company socket={socket}  />} />
            <Route path="/activities" element={<Activities socket={socket}  />} />
            <Route path="/activities/:id" element={<ActivityDetails socket={socket}  />} />
            <Route path="/profile/:id" element={<MyAccount socket={socket} />} />
            <Route path="/events" element={<CalendarEvents socket={socket} />} />
            {/* <Route path="/messages" element={<Messages socket={socket} />} /> */}
            <Route path="/settings" element={<Settings socket={socket} />} />
            <Route path="/mymeetings" element={<MyMeetings />} />
            <Route path="/join/:id" element={<JoinMeeting />} />
            <Route path="/messages" element={<UserMessages socket={socket} />} /> 
            <Route path="/messages/:id" element={<SingleMessage  socket={socket} />} /> 
            <Route path="/orders" element={<Orders  />} /> 
            <Route path="/checkout-success" element={<CheckoutSuccess />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/weather" element={<Weather fetchWeatherUpdate={fetchWeatherUpdate} />} />
            <Route path="/conversations/:id" element={<Conversations socket={socket}/>} />
            <Route path="/labels/:id" element={<MyLabel socket={socket}/>} />
            <Route path="/messages/users-conversations/:id" element={<UserToUserChat socket={socket}/>} />
          </Route>
          <Route path="*" element={<h1>Error 404 Page not found !!</h1>} />
        </Routes>

        {
          renderChatButton()
        }
       
    
      {/* </BrowserRouter> */}
    </>
  );
}

export default App;
