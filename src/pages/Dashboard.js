import {  CircularProgress,  Typography, Box, Snackbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../services/LocalStorageService';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DashboardCard from '../components/dashboard/DashboardCard';
import { BarChart } from '../components/dashboard/BarChart';
import { DoughnutChart } from '../components/dashboard/DoughnutChart';
import moment from 'moment';
import instance from '../services/fetchApi';
import { setLoadingDashboard, setShowAnnouncementsLoading, setShowBarGraphLoadingNotification, setShowDoughnutGraphLoadingNotification } from '../features/userSlice';
import MuiAlert from '@mui/material/Alert';
import AnnouncementsCard from '../components/dashboard/AnnouncementsCard';


const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});


const Dashboard = ({socket}) => {
  const navigate = useNavigate()
  const token = getToken()
  //const { events } = useSelector(state => state.event)
  const { lists } = useSelector(state => state.list)
  const [eventsToday, setEventsToday] = useState([])
  const { setting, loadingDashboard, showBarGraphLoadingNotification, showDoughnutGraphLoadingNotification, showAnnouncementsLoading } = useSelector(state => state.user)
  const [events, setEvents] = useState([])
  const [list, setList] = useState()
  const [results, setResults] = useState([])
  const [announcementsResults, setAnnouncementsResults] = useState([])
  const [owner, setOwner] = useState(setting?.product_sales_mode)
  const [doughnutResults, setDoughnutResults] = useState()
  const [measurement, setMeasurement] = useState(setting?.top_sales_mode)
  const [openAlert, setOpenAlert] = useState(false);
  const [severity, setSeverity] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = (msg, sev) => {
    setOpenAlert(true)
    setAlertMessage(msg)
    setSeverity(sev)
  }

  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenAlert(false);
  };

  //const [activitySummary, setActivitySummary] = useState()
  const dispatch = useDispatch()

  useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [token])

  useEffect(() => {
    setOwner(setting?.product_sales_mode)
  }, [setting?.product_sales_mode])

  
  useEffect(() => {
    setMeasurement(setting?.top_sales_mode)
  }, [setting?.top_sales_mode])

  // Store User Data in Local State
  // useEffect(() => {
  //   if (data && isSuccess) {
  //     setUserData({
  //       email: data.user.email,
  //       name: data.user.name,
  //     })
  //   }
  // }, [data, isSuccess])
  const getDoughnutChartResults = async (url) => {
    dispatch(setShowDoughnutGraphLoadingNotification({showDoughnutGraphLoadingNotification: true}))
    await  instance.get(`${url}`)
    .then((res) => {
     dispatch(setShowDoughnutGraphLoadingNotification({showDoughnutGraphLoadingNotification: false}))
      setDoughnutResults(res.data.results)
    })
    .catch(()=> {
      showAlert("Ooops an error was encountered", "error")
     dispatch(setShowDoughnutGraphLoadingNotification({showDoughnutGraphLoadingNotification: false}))
    })
  }

  const getTotalProductsSales = async (url) => {
    dispatch(setShowBarGraphLoadingNotification({showBarGraphLoadingNotification: true}))
    await  instance.get(`${url}`)
    .then((res) => {
    dispatch(setShowBarGraphLoadingNotification({showBarGraphLoadingNotification: false}))
      setResults(res.data.results)
    })
    .catch(()=> {
      showAlert("Ooops an error was encountered", "error")
    dispatch(setShowBarGraphLoadingNotification({showBarGraphLoadingNotification: false}))
    })
  }

  const getAnnouncements = async () => {
    dispatch(setShowAnnouncementsLoading({showAnnouncementsLoading: true}))
    await  instance.get(`dashboardannouncements`)
    .then((res) => {
      dispatch(setShowAnnouncementsLoading({showAnnouncementsLoading: false}))
      setAnnouncementsResults(res.data.announcements)
    })
    .catch(()=> {
      showAlert("Ooops an error was encountered", "error")
      dispatch(setShowAnnouncementsLoading({showAnnouncementsLoading: false}))
    })
  }

  useEffect(() => {
   
    socket.on('new_announcement_created', (arr) => {
      getAnnouncements()
    });
  }, [socket])

  useEffect(() => {
    if (owner === 'allusers') {
      getTotalProductsSales('dashboard-total-products/allusers')
    } 

    if(owner === 'mine') {
      getTotalProductsSales('dashboard-total-products/mine')
    }
  }, [owner])

  useEffect(() => {
    if (measurement === 'salespersons') {
      getDoughnutChartResults('dashboard-total-sales-users')
    } 

    if(measurement === 'products') {
      getDoughnutChartResults('dashboard-total-sales-topproducts')
    }
  }, [measurement])

  useEffect(() => {

    getAnnouncements()

    let requests = []
    requests.push(
      instance.get(`dashboardevents`)
      .then((res) => {
        setEvents(res.data.events)
      }),
      instance.get(`mylists-dashboard`)
      .then((res) => {
        setList(res.data.list)
      }),
      // instance.get(`activities-summary`)
      // .then((res) => {
      //   setActivitySummary(res.data)
      // })
    )

    const  runAll = async () => {
      dispatch(setLoadingDashboard({value: true}))
      await Promise.all(requests).then((results)=>{
      
        dispatch(setLoadingDashboard({value: false}))
      })
      .catch((err)=> {
        console.log(err);
        showAlert("Ooops an error was encountered", "error")
      })
    }

    runAll()
  }, [])

  useEffect(() => {
    

    let ev = events.filter((ev) =>  moment().isBefore(ev.end))
    .map((a) => {
      return {
        ...a,
        start : moment(a.start).toDate(),
        end : moment(a.end).toDate()
      }
    })
    .sort((a, b)=> new Date(a.start) - new Date(b.start))

    setEventsToday(ev)
  }, [events])

  const renderGraph = (type) => {
    if(type === "") {

    } else {

    }
  }



  return (
    <>
      {
        loadingDashboard ? (
          <Box sx={{ display: 'flex', marginLeft: "50%" }}>
            <CircularProgress />
          </Box>
        ) : (
          <div>
            <Typography variant='h6'><b>Dashboard</b></Typography>
            <div style={{display: "flex", justifyContent: "space-between", columnGap: "30px", marginBottom: "30px"}}>
              <div style={{width: "90%"}}>
                <DashboardCard type="list" list={list}  />
              </div>
              <div style={{width: "90%"}}>
                <DashboardCard type="event" events={eventsToday}/>
              </div>
              <div style={{width: "90%"}}>
                <DashboardCard type="activity" />
              </div>
            </div>
      
            <div style={{display: "flex", justifyContent: "space-between",  columnGap: "10px", }}>
              {
                setting?.dashboard_mode === "show_graphs" && (
                  <>
                  <div style={{width: "50%"}}>
                    <BarChart 
                      results={results} 
                      owner={owner} 
                      setOwner={setOwner} 
                      showBarGraphLoadingNotification={showBarGraphLoadingNotification} 
                    />
                  </div>
                  <div style={{width: "35%"}}>
                    <DoughnutChart 
                      results={doughnutResults} 
                      measurement={measurement} 
                      setMeasurement={setMeasurement} 
                      showDoughnutGraphLoadingNotification={showDoughnutGraphLoadingNotification}  
                    />
                  </div>
                  </>
                )
              }
      
              {
                setting?.dashboard_mode === "show_bar_graph" && (
                  <>
                  <div style={{width: "50%"}}>
                    <BarChart 
                      results={results} 
                      owner={owner} 
                      setOwner={setOwner} 
                      showBarGraphLoadingNotification={showBarGraphLoadingNotification}  
                    />
                  </div>
                  <div style={{width: "30%"}}>
                    
                  </div>
                  </>
                )
              }
      
              {
                setting?.dashboard_mode === "show_doughnut_graph" && (
                  <>
                  <div style={{width: "40%"}}>
                    <DoughnutChart 
                      results={doughnutResults} 
                      measurement={measurement} 
                      setMeasurement={setMeasurement} 
                      showDoughnutGraphLoadingNotification={showDoughnutGraphLoadingNotification} 
                    />
                  </div>
                  <div style={{width: "30%"}}>
                  
                  </div>
                  </>
                )
              }
            
            </div>

            {
              setting?.announcements_mode === "show" && (
                <div style={{width: "50%"}}>
                  <AnnouncementsCard
                    announcements={announcementsResults}
                    showAnnouncementsLoading={showAnnouncementsLoading}
                  />
                </div>
              )
            }
          
          </div>
        )
      }

      <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={severity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
   
  )
};

export default Dashboard;
