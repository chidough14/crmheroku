import { InputLabel, Select, MenuItem, Button, Snackbar, CircularProgress } from '@mui/material'
import React, { useEffect, useReducer, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setShowSaveNotification, updateUserSettings } from '../../features/userSlice'
import instance from '../../services/fetchApi'
import MuiAlert from '@mui/material/Alert';
import { Box } from '@mui/system'


const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const AppModeSettings = ({user}) => {
  const { showSaveNotification } = useSelector(state => state.user)
  const dispatch = useDispatch()

  
  const initialState = {
    dashboard_mode: "",
    calendar_mode: "",
    product_sales_mode: "",
    top_sales_mode: "",
    openAlert: false,
    text: "",
    severity: ""
  };

  const [data, updateData] = useReducer(
    (state, updates) => ({ ...state, ...updates }),
    initialState
  );

  const handleCloseAlert = () => {
    updateData({openAlert: false})
  }

  useEffect(() => {
    if (user?.setting) {
      updateData({
        dashboard_mode: user?.setting?.dashboard_mode,
        calendar_mode: user?.setting?.calendar_mode,
        product_sales_mode: user?.setting?.product_sales_mode,
        top_sales_mode: user?.setting?.top_sales_mode
      })
    }
  }, [user?.setting])

  const updateSettings = async () => {
    dispatch(setShowSaveNotification({showSaveNotification: true}))
    let body = {
      user_id: user?.id,
      dashboard_mode: data.dashboard_mode,
      calendar_mode: data.calendar_mode,
      product_sales_mode: data.product_sales_mode,
      top_sales_mode: data.top_sales_mode
    }

    await instance.patch(`settings`, body)
    .then((res) => {
      dispatch(setShowSaveNotification({showSaveNotification: false}))
      dispatch(updateUserSettings({setting: res.data.setting}))
      updateData({openAlert: true, severity: "success", text: "Sttings updated successfully"})
    })
    .catch(() => {
      dispatch(setShowSaveNotification({showSaveNotification: false}))
      updateData({openAlert: true, severity: "error", text: "Ooops an error was encountered"})
    })
  }

  return (
    <div>
      <InputLabel id="demo-select-small">Dashboard Mode</InputLabel>
      <Select
        id='dashboard_mode'
        name="dashboard_mode"
        label="Dashboard Mode"
        size='small'
        style={{width: "50%"}}
        //fullWidth
        value={data.dashboard_mode}
        onChange={(e)=> updateData({dashboard_mode: e.target.value})}
      >
        <MenuItem value="show_graphs">Show All Graphs</MenuItem>
        <MenuItem value="show_bar_graph">Show Bar Graph</MenuItem>
        <MenuItem value="show_doughnut_graph">Show Doughnut Graph</MenuItem>
      </Select>
      <p></p>
      <InputLabel id="demo-select-small">Calendar Mode</InputLabel>
      <Select
        id='calendar_mode'
        name="calendar_mode"
        label="Calendar Mode"
        size='small'
        style={{width: "50%"}}
        //fullWidth
        value={data.calendar_mode}
        onChange={(e)=> updateData({calendar_mode: e.target.value})}
      >
        <MenuItem value="day">Day</MenuItem>
        <MenuItem value="week">Week</MenuItem>
        <MenuItem value="month">Month</MenuItem>
        <MenuItem value="agenda">Agenda</MenuItem>
      </Select>
      <p></p>

      <InputLabel id="demo-select-small">Bar Graph Default Mode</InputLabel>
      <Select
        id='product_sales_mode'
        name="product_sales_mode"
        label="Product Sales Graph Mode"
        size='small'
        style={{width: "50%"}}
        //fullWidth
        value={data.product_sales_mode}
        onChange={(e)=> updateData({product_sales_mode: e.target.value})}
      >
        <MenuItem value="allusers">All Users</MenuItem>
        <MenuItem value="mine">Mine</MenuItem>
      </Select>
      <p></p>

      
      <InputLabel id="demo-select-small">Doughnut Graph Default Mode</InputLabel>
      <Select
        id='top_sales_mode'
        name="top_sales_mode"
        label="Top Sales Persons/Products Graph Mode"
        size='small'
        style={{width: "50%"}}
        //fullWidth
        value={data.top_sales_mode}
        onChange={(e)=> updateData({top_sales_mode: e.target.value})}
      >
        <MenuItem value="salespersons">Sales Persons</MenuItem>
        <MenuItem value="products">Products</MenuItem>
      </Select>
      <p></p>

      <Button
        size='small' 
        color="primary" 
        variant="contained" 
        style={{borderRadius: "30px"}}
        onClick={updateSettings}
      >
          {
            showSaveNotification ? (
              <Box sx={{ display: 'flex' }}>
                <CircularProgress size={24} color="inherit" />
              </Box>
            ) : "Save"
          }
      </Button>


      <Snackbar open={data.openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={data.severity} sx={{ width: '100%' }}>
          {data.text}
        </Alert>
      </Snackbar>
    </div>
  )
}

export default AppModeSettings