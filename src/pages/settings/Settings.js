import * as React from 'react';
import { Box, CircularProgress, Snackbar, Tab, Tabs, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import instance from '../../services/fetchApi';
import { useState } from 'react';
import { setProducts } from '../../features/ProductSlice';
import ProductsTable from './ProductsTable';
import CompaniesTable from './CompaniesTable';
import { setCompany } from '../../features/companySlice';
import AppModeSettings from './AppModeSettings';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../services/LocalStorageService';
import UserManagementTable from './UserManagementTable';
import MuiAlert from '@mui/material/Alert';
import AnnouncementsTable from './AnnouncementsTable';
import { setAnnouncements, setAnnouncementsLoading } from '../../features/AnnouncementsSlice';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});


function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const Settings = ({socket}) => {
  const dispatch = useDispatch()
  const {products} = useSelector((state) => state.product) 
  const {companies} = useSelector((state) => state.company) 
  const {announcements, announcementsLoading} = useSelector((state) => state.announcement) 
  const user = useSelector(state => state.user)
  const [value, setValue] = useState(0)
  const [loading, setLoading] = useState(false)
  const token = getToken()
  const navigate = useNavigate()
  const [openSnackAlert, setOpenSnackAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [severity, setSeverity] = useState("");

  
  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenSnackAlert(false);
  };

  const showAlert = () => {
    setAlertMessage("Ooops an error was encountered")
    setSeverity("error")
    setOpenSnackAlert(true)
  }
  

  React.useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [token])

  const getProducts = (page = 1) => {
    setLoading(true)
    instance.get(`products?page=${page}`)
    .then((res) => {
      setLoading(false)
      dispatch(setProducts({products: res.data.products}))
      return Promise.resolve(true);
    })
    .catch((e)=>{
      showAlert()
      return Promise.resolve(false);
    })
  }

  const getCompanies = (page = 1) => {
    setLoading(true)
    instance.get(`companies?page=${page}`)
    .then((res) => {
      dispatch(setCompany({companies: res.data.companies}))
      setLoading(false)
      return Promise.resolve(true);
    })
    .catch((e)=>{
      showAlert()
      return Promise.resolve(false);
    })
  }

  const getAnnouncements = (page = 1) => {
    dispatch(setAnnouncementsLoading({announcementsLoading: true}))
    instance.get(`announcements?page=${page}`)
    .then((res) => {
      dispatch(setAnnouncements({announcements: res.data.announcements}))
      dispatch(setAnnouncementsLoading({announcementsLoading: false}))
      return Promise.resolve(true);
    })
    .catch((e)=>{
      showAlert()
      return Promise.resolve(false);
    })
  }

  React.useEffect(() => {

    let requests = []
    requests.push(
      getProducts(), getCompanies(), getAnnouncements()
    )

   

    const  runAll = async () => {
     // setLoading(true)
      await Promise.all(requests).then((results)=>{
        
        //setLoading(false)
      })
      .catch((err)=> {
        showAlert()
      })
    }

     runAll()
  }, [])

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };


  return (
    <>
      <Typography variant='h6'>Settings</Typography>  
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="App Settings" {...a11yProps(0)} />
          <Tab label="Companies" {...a11yProps(1)} />
          <Tab label="Products" {...a11yProps(2)} />
          {
            (user?.role === "admin" || user?.role === "super admin")  && (
              <Tab label="User management" {...a11yProps(3)} />
            )
          }

          {
            user?.role === "super admin" && (
              <Tab label="Announcements" {...a11yProps(4)} />
            )
          }
        </Tabs>
      </Box>

      <TabPanel value={value} index={0}>
      
        <AppModeSettings user={user} />
      
      </TabPanel>

      <TabPanel value={value} index={1}>
        <CompaniesTable rows={companies} getCompanies={getCompanies} loading={loading} user={user} />
      </TabPanel>

      <TabPanel value={value} index={2}>
        <ProductsTable rows={products} getProducts={getProducts} loading={loading}  user={user}/> 
      </TabPanel>

      <TabPanel value={value} index={3}>
        <UserManagementTable rows={user?.allUsers} />
      </TabPanel>

      <TabPanel value={value} index={4}>
        <AnnouncementsTable rows={announcements} loading={announcementsLoading} socket={socket} getAnnouncements={getAnnouncements}  />
      </TabPanel>


      <Snackbar open={openSnackAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={severity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
 
  );
}


export default Settings