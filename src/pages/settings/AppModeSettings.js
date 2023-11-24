import { InputLabel, Select, MenuItem, Button, Snackbar, CircularProgress, FormControlLabel } from '@mui/material'
import React, { useEffect, useReducer, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setShowSaveNotification, updateUserSettings } from '../../features/userSlice'
import instance from '../../services/fetchApi'
import MuiAlert from '@mui/material/Alert';
import { Box } from '@mui/system'
import Switch from '@mui/material/Switch';


const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const AppModeSettings = ({user}) => {
  const { showSaveNotification } = useSelector(state => state.user)
  const [timer, setTimer] = useState(null);
  const [fields, setFields] = useState([]);
  const dispatch = useDispatch()
  const latestChangesRef = useRef({});

  
  const initialState = {
    dashboard_mode: "",
    calendar_mode: "",
    product_sales_mode: "",
    announcements_mode: false,
    top_sales_mode: "",
    currency_mode: "",
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

  const handleChange = (event) => {
    setFields(prev => [...prev, "announcements_mode"])
    updateData({announcements_mode: event.target.checked})

    latestChangesRef.current.announcements_mode = event.target.checked ? "show" : "hide";

    if (timer) {
      clearTimeout(timer);
    }

    // Set a new timer to call the save function after 3 seconds
    setTimer(setTimeout(() => {
      handleSave("announcements_mode");
    }, 3000));
  };

  useEffect(() => {
    if (user?.setting) {
      updateData({
        dashboard_mode: user?.setting?.dashboard_mode,
        calendar_mode: user?.setting?.calendar_mode,
        product_sales_mode: user?.setting?.product_sales_mode,
        top_sales_mode: user?.setting?.top_sales_mode,
        currency_mode: user?.setting?.currency_mode,
        announcements_mode: user?.setting?.announcements_mode === "show" ? true : false,
      })
    }
  }, [user?.setting])

  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [timer]);

  const handleSave = async (name) => {
    dispatch(setShowSaveNotification({showSaveNotification: true}))

    const changes = latestChangesRef.current;

    let body

    body = {
      user_id: user?.id,
      ...changes
    }

    await instance.patch(`settings`, body)
    .then((res) => {
      setFields((prev) => prev.filter((a) => a !== name));

      dispatch(setShowSaveNotification({showSaveNotification: false}))
      dispatch(updateUserSettings({setting: res.data.setting}))
      updateData({openAlert: true, severity: "success", text: "Settings updated successfully"})
    })
    .catch(() => {
      dispatch(setShowSaveNotification({showSaveNotification: false}))
      updateData({openAlert: true, severity: "error", text: "Ooops an error was encountered"})
    })

    latestChangesRef.current = {};
  }

  const renderSelectField = (name, label, value, options) => {
    return (
      <>
        <InputLabel id="demo-select-small">{label}</InputLabel>
        <Select
          id={name}
          name={name}
          label={label}
          size='small'
          style={{width: "50%"}}
          value={value}
          onChange={(e)=> {
            setFields(prev => [...prev, name])
            updateData({[name]: e.target.value})

            latestChangesRef.current[name] = e.target.value;
         

            if (timer) {
              clearTimeout(timer);
            }
        
            // Set a new timer to call the save function after 3 seconds
            setTimer(setTimeout(() => {
              handleSave(name);
            }, 3000));
          }}
        >

          {
            options.map((a, i) => <MenuItem key={i} value={a.value}>{a.text}</MenuItem>)
          }
        </Select>

        {
         showSaveNotification && fields.includes(name) ? <span style={{marginLeft: "10px", color: "green"}}>Saving....</span> : null
        }
      </>
    )
  }

  const renderSwitch = (name, label, value) => {
    return (
       <>
          <FormControlLabel 
            control={
              <Switch
                checked={value}
                onChange={handleChange}
                inputProps={{ 'aria-label': 'controlled' }}
              />
            } 
            label={label}
          />
          {
            showSaveNotification && fields.includes(name) ? <span style={{marginLeft: "10px", color: "green"}}>Saving....</span> : null
          }
       </>
    )
  }

  return (
    <div>
      { 
        renderSelectField("dashboard_mode", "Dashboard Mode", data.dashboard_mode, [
          {value: "show_graphs", text: "Show All Graphs"}, 
          {value: "show_bar_graph", text: "Show Bar Graph"}, 
          {value: "show_doughnut_graph", text: "Show Doughnut Graph"}
        ]) 
      }
      <p></p>

      {
        renderSwitch("announcements_mode", "Show Announcements widget", data.announcements_mode)
      }

      { 
        renderSelectField("calendar_mode", "Calendar Mode", data.calendar_mode, [
          {value: "day", text: "Day"},   {value: "week", text: "Week"}, {value: "month", text: "Month"},   {value: "agenda", text: "Agenda"}
        ]) 
      }
      <p></p>

      { 
        renderSelectField("product_sales_mode", "Bar Graph Default Mode", data.product_sales_mode, [
          {value: "allusers", text: "All Users"},   {value: "mine", text: "Mine"}
        ]) 
      }
      <p></p>

      { 
        renderSelectField("top_sales_mode", "Doughnut Graph Default Mode", data.top_sales_mode, [
          {value: "salespersons", text: "Sales Persons"},   {value: "products", text: "Products"}
        ]) 
      }
      <p></p>

      { 
        renderSelectField("currency_mode", "Currency Mode", data.currency_mode, [
          {value: "USD", text: "USD"},   {value: "EUR", text: "EUR"},   {value: "GBP", text: "GBP"}
        ]) 
      }
      <p></p>

      {/* <Button
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
      </Button> */}


      <Snackbar open={data.openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={data.severity} sx={{ width: '100%' }}>
          {data.text}
        </Alert>
      </Snackbar>
    </div>
  )
}

export default AppModeSettings