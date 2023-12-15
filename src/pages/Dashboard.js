import {  CircularProgress,  Typography, Box, Snackbar} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../services/LocalStorageService';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DashboardCard from '../components/dashboard/DashboardCard';
import { BarChart } from '../components/dashboard/BarChart';
import { DoughnutChart } from '../components/dashboard/DoughnutChart';
import moment from 'moment';
import instance from '../services/fetchApi';
import { 
  setBarSelect,
  setConnectionError,
  setDashboardAnnouncements, 
  setDashboardEvents, 
  setDashboardList, 
  setDoughnutChartResults, 
  setDoughnutSelect, 
  setLoadingDashboard, 
  setMeasurement, 
  setOwner, 
  setShowAnnouncementsLoading, 
  setShowBarGraphLoadingNotification, 
  setShowDoughnutGraphLoadingNotification, 
  setTotalProductsSales, 
  setWeatherDetails,
  setWeatherLoading
} from '../features/userSlice';
import MuiAlert from '@mui/material/Alert';
import AnnouncementsCard from '../components/dashboard/AnnouncementsCard';
import ActivityModal from '../components/activities/ActivityModal';
import WeatherCard from '../components/dashboard/WeatherCard';


const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});


const Dashboard = ({socket}) => {
  const navigate = useNavigate()
  const token = getToken()
  const { lists } = useSelector(state => state.list)
  const [eventsToday, setEventsToday] = useState([])
  const { 
    setting, 
    loadingDashboard, 
    showBarGraphLoadingNotification, 
    showDoughnutGraphLoadingNotification, 
    showAnnouncementsLoading, 
    exchangeRates,
    list,
    events,
    announcementsResults,
    totalProductSales,
    doughnutChartResults,
    doughnutSelect,
    measurement,
    owner,
    barSelect,
    weatherDetails 
  } = useSelector(state => state.user)
  const [openAlert, setOpenAlert] = useState(false);
  const [severity, setSeverity] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState("$")
  const [eventsLoading, setEventsLoading] = useState(false)
  const [listsLoading, setListsLoading] = useState(false)
  // const handleOpen = () => setOpen(true);

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
    if (!owner) {
      dispatch(setOwner({owner: setting?.product_sales_mode}))
    }
  }, [owner, setting?.product_sales_mode])

  
  useEffect(() => {
    if (!measurement) {
      dispatch(setMeasurement({measurement: setting?.top_sales_mode}))
    }
  }, [measurement, setting?.top_sales_mode])

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

      if (setting?.currency_mode === "USD" || setting?.currency_mode === null) {
        setCurrencySymbol("$")
        dispatch(setDoughnutChartResults({doughnutChartResults: res.data.results}))
      } else {
        if (setting?.currency_mode === "EUR") {
          setCurrencySymbol("€")
        }
  
        if (setting?.currency_mode === "GBP") {
          setCurrencySymbol("£")
        }

        const result = res.data.results.map((a) => {
          return {
            ...a,
            total: a.total * exchangeRates[setting?.currency_mode]
          }
        })
        
        
        dispatch(setDoughnutChartResults({doughnutChartResults: result}))
      }

      dispatch(setShowDoughnutGraphLoadingNotification({showDoughnutGraphLoadingNotification: false}))
      dispatch(setDoughnutSelect({doughnutSelect: false}))
    
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

      if (setting?.currency_mode === "USD" || setting?.currency_mode === null) {
        setCurrencySymbol("$")
        dispatch(setTotalProductsSales({totalProductSales: res.data.results}))
      } else {
        if (setting?.currency_mode === "EUR") {
          setCurrencySymbol("€")
        }
  
        if (setting?.currency_mode === "GBP") {
          setCurrencySymbol("£")
        }

        const result = res.data.results.map((item) => {
          const newObj = {};
          for (const key in item) {
            if (item.hasOwnProperty(key)) {
              newObj[key] = item[key] * exchangeRates[setting?.currency_mode];
            }
          }
          return newObj;
        });
        dispatch(setTotalProductsSales({totalProductSales: result}))
      }

      dispatch(setShowBarGraphLoadingNotification({showBarGraphLoadingNotification: false}))
      dispatch(setBarSelect({barSelect: false}))
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
      dispatch(setDashboardAnnouncements({announcementsResults: res.data.announcements}))
    })
    .catch(()=> {
      showAlert("Ooops an error was encountered", "error")
      dispatch(setShowAnnouncementsLoading({showAnnouncementsLoading: false}))
    })
  }

  useEffect(() => {

    socket.on('activity_closed', (arr) => {
      let arg = `dashboard-total-products/${owner}`
      let arg2 = measurement === 'salespersons' ? 'dashboard-total-sales-users' : 'dashboard-total-sales-topproducts'

      getTotalProductsSales(arg)
      getDoughnutChartResults(arg2)
    });


    return () => {
      socket.off('activity_closed');
    };
  }, [])

  useEffect(() => {
    if (!totalProductSales.length || barSelect) {
      if (owner === 'allusers') {
        getTotalProductsSales('dashboard-total-products/allusers')
      } 
  
      if(owner === 'mine') {
        getTotalProductsSales('dashboard-total-products/mine')
      }
    }  
  }, [owner])

  useEffect(() => {
    if (!doughnutChartResults.length || doughnutSelect) {
      if (measurement === 'salespersons') {
        getDoughnutChartResults('dashboard-total-sales-users')
      } 
  
      if(measurement === 'products') {
        getDoughnutChartResults('dashboard-total-sales-topproducts')
      }
    }
  }, [measurement])

  const fetchDashboardEvents = () => {
    setEventsLoading(true)
    instance.get(`dashboardevents`)
    .then((res) => {
      dispatch(setDashboardEvents({events: res.data.events}))
      setEventsLoading(false)
    })
  }

  const fetchDashboardLists = async () => {
    setListsLoading(true)
    await instance.get(`mylists-dashboard`)
    .then((res) => {
      setListsLoading(false)
      dispatch(setDashboardList({list: res.data.list}))
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
    if (!weatherDetails) {
      fetchWeatherUpdate()
    }
  }, [weatherDetails])

  useEffect(() => {

    if (!announcementsResults.length) {
      getAnnouncements()
    }

    let requests = []

    if (events.length < 1) {
      requests.push(
        fetchDashboardEvents()
      )
    }

    if (!list) {
      fetchDashboardLists()
    }

    const  runAll = async () => {
      //dispatch(setLoadingDashboard({value: true}))
      await Promise.all(requests).then((results)=>{
      
        //dispatch(setLoadingDashboard({value: false}))
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


  return (
    <>
      {
        loadingDashboard ? (
          <Box sx={{ display: 'flex', marginLeft: "50%" }}>
            <CircularProgress />
          </Box>
        ) : (
          <div>
            
            <div style={{display: "flex", justifyContent: "space-between"}}>
              <Typography variant='h6'><b>Dashboard</b></Typography>
            </div>

            <div style={{display: "flex", justifyContent: "space-between", columnGap: "30px", marginBottom: "30px"}}>
              <div style={{width: "90%"}}>
                <DashboardCard type="list" list={list} listsLoading={listsLoading} />
              </div>
              <div style={{width: "90%"}}>
                <DashboardCard type="event" events={eventsToday} eventsLoading={eventsLoading}/>
              </div>
              <div style={{width: "90%"}}>
                <DashboardCard type="activity" />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', columnGap: '10px' }}>
              {setting && (
                <>
                  <div style={{ width: setting.dashboard_mode === 'show_doughnut_graph' ? '40%' : '50%' }}>
                    {setting.dashboard_mode === 'show_graphs' && (
                      <BarChart
                        results={totalProductSales}
                        owner={owner}
                        setOwner={setOwner}
                        showBarGraphLoadingNotification={showBarGraphLoadingNotification}
                        currencySymbol={currencySymbol}
                      />
                    )}
                    {setting.dashboard_mode === 'show_bar_graph' && (
                      <BarChart
                        results={totalProductSales}
                        owner={owner}
                        setOwner={setOwner}
                        showBarGraphLoadingNotification={showBarGraphLoadingNotification}
                        currencySymbol={currencySymbol}
                      />
                    )}
                  </div>
                  <div style={{ width: setting.dashboard_mode === 'show_doughnut_graph' ? '30%' : '35%' }}>
                    {setting.dashboard_mode === 'show_graphs' && (
                      <DoughnutChart
                        results={doughnutChartResults}
                        measurement={measurement}
                        setMeasurement={setMeasurement}
                        showDoughnutGraphLoadingNotification={showDoughnutGraphLoadingNotification}
                        currencySymbol={currencySymbol}
                      />
                    )}
                  </div>
                </>
              )}
            </div>

            <div style={{display: "flex", justifyContent: "space-between", columnGap: "200px"}}>
              {
                 setting?.announcements_mode === "show" && (
                  <AnnouncementsCard
                    announcements={announcementsResults}
                    showAnnouncementsLoading={showAnnouncementsLoading}
                  />
                 )
              }

              {
                 setting?.show_weather_widget === "show" && (
                  <WeatherCard 
                    weatherDetails={weatherDetails}
                    fetchWeatherUpdate={fetchWeatherUpdate}
                  />
                 )
              }
            </div>
          
          </div>
        )
      }

      <ActivityModal
        open={open}
        setOpen={setOpen}
        mode="dashboard"
        socket={socket}
      />

      <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={severity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
   
  )
};

export default Dashboard;
