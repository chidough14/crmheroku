import { BrowserRouter, Route, Routes, Navigate, useNavigate } from "react-router-dom";
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
import { setAllUsersData, setLoadingDashboard, setUserInfo } from "./features/userSlice";
import { useGetLoggedUserQuery } from "./services/userAuthApi";
import Activities from "./pages/Activities";
import SingleList from "./pages/SingleList";
import CalendarEvents from "./pages/CalendarEvents";
import Company from "./pages/Company";
import instance from "./services/fetchApi";
import { setLists } from "./features/listSlice";
import { setActivities } from "./features/ActivitySlice";
import ActivityDetails from "./pages/activities/ActivityDetails";
import { setEvents } from "./features/EventSlice";
import Messages from "./pages/messages/Messages";
import Settings from "./pages/settings/Settings";
import MyMeetings from "./pages/meetings/MyMeetings";
import JoinMeeting from "./pages/meetings/JoinMeeting";
import UserMessages from "./pages/userMessages/UserMessages";
import { setInboxMessages, setOutboxMessages } from "./features/MessagesSlice";
import SingleMessage from "./pages/userMessages/SingleMessage";
import { setInvitedMeetings, setMeetings } from "./features/MeetingSlice";
import AppLayout from "./pages/AppLayout";
import { setUserToken } from "./features/authSlice";
import Orders from "./pages/orders/Orders";
import MyAccount from "./pages/auth/MyAccount";

import socketIO from 'socket.io-client';
import CheckoutSuccess from "./components/CheckoutSuccess";

const socket = socketIO('');
// const socket = socketIO('http://localhost:4000');

function App() {
  const token =  getToken()
  const auth = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const { data, isSuccess } = useGetLoggedUserQuery(token)
  
  useEffect(() => {
   
    if(data?.user?.id) {
      socket.emit('userId', data?.user?.id);
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

  useEffect(() => {


    let requests = []
    requests.push(
      // instance.get(`mylists`)
      // .then((res)=> {
      //     dispatch(setLists({lists: res.data.lists}))
      //   return Promise.resolve(true);
      // })
      // .catch((e)=>{
      //   return Promise.resolve(false);
      // }),
      instance.get(`activities`)
      .then((res)=> {
        dispatch(setActivities({activities: res.data.activities}))
        return Promise.resolve(true);
      })
      .catch((e)=>{
        return Promise.resolve(false);
      }),
      // instance.get(`events`)
      // .then((res)=> {
      //   dispatch(setEvents({events: res.data.events}))
      //   return Promise.resolve(true);
      // })
      // .catch((e)=>{
      //   return Promise.resolve(false);
      // }),
      // instance.get(`messages`)
      // .then((res)=> {
      //   dispatch(setInboxMessages({inbox: res.data.inbox}))
      //   dispatch(setOutboxMessages({outbox: res.data.outbox}))
      //   return Promise.resolve(true);
      // })
      // .catch((e)=>{
      //   return Promise.resolve(false);
      // }),
      instance.get(`users`)
      .then((res) => {
        dispatch(setAllUsersData({users: res.data.users}))
        return Promise.resolve(true);
      })
      .catch((e)=>{
        return Promise.resolve(false);
      }),
      // instance.get(`meetings`)
      // .then((res) => {
      //   dispatch(setMeetings({meetings: res.data.meetings}))
      //   dispatch(setInvitedMeetings({invitedMeetings: res.data.invitedMeetings}))
      //   return Promise.resolve(true);
      // })
      // .catch((e)=>{
      //   return Promise.resolve(false);
      // })
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

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout  socket={socket} />}>
            <Route index element={<Home />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<LoginReg />} />
            <Route path="sendpasswordresetemail" element={<SendPasswordResetEmail />} />
            <Route path="api/reset/:token" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/lists" element={<Lists socket={socket}/>} />
            <Route path="/listsview/:id" element={<SingleList />} />
            <Route path="/companies/:id" element={<Company />} />
            <Route path="/activities" element={<Activities socket={socket}  />} />
            <Route path="/activities/:id" element={<ActivityDetails />} />
            <Route path="/profile/:id" element={<MyAccount />} />
            <Route path="/events" element={<CalendarEvents socket={socket} />} />
            {/* <Route path="/messages" element={<Messages socket={socket} />} /> */}
            <Route path="/settings" element={<Settings />} />
            <Route path="/mymeetings" element={<MyMeetings />} />
            <Route path="/join/:id/:userId" element={<JoinMeeting />} />
            <Route path="/messages" element={<UserMessages socket={socket} />} /> 
            <Route path="/messages/:id" element={<SingleMessage  socket={socket} />} /> 
            <Route path="/orders" element={<Orders  />} /> 
            <Route path="/checkout-success" element={<CheckoutSuccess />} />
          </Route>
          <Route path="*" element={<h1>Error 404 Page not found !!</h1>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
