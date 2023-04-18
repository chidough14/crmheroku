import * as React from 'react';
import { Box, Snackbar, Tab, Tabs, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import instance from '../../services/fetchApi';
import { setInvitedMeetings, setMeetings } from '../../features/MeetingSlice';
import { useState } from 'react';
import MeetingsTable from './MeetingsTable';
import EditMeetingModal from './EditMeetingModal';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../services/LocalStorageService';
import MuiAlert from '@mui/material/Alert';


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

const MyMeetings = () => {
  const dispatch = useDispatch()
  const { meetings } = useSelector((state) => state.meeting) 
  const { invitedMeetings } = useSelector((state) => state.meeting) 
  const user = useSelector((state) => state.user) 
  const [value, setValue] = useState(0)
  const [showEditMeetingModal, setShowEditMeetingModal] = useState(false)
  const [meeting, setMeeting] = useState()
  const token = getToken()
  const navigate = useNavigate()
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [severity, setSeverity] = useState("");

  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenAlert(false);
  };

  React.useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [token])

  React.useEffect(() => {
    const  fetchMeetings = async () => {
      await instance.get(`meetings`)
      .then((res) => {
        dispatch(setMeetings({meetings: res.data.meetings}))
        dispatch(setInvitedMeetings({invitedMeetings: res.data.invitedMeetings}))
      })
      .catch(() => {
        setAlertMessage("Ooops an error was encountered")
        setSeverity("error")
        setOpenAlert(true)
      })
    }

    fetchMeetings()
  }, [])

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const showModal = (row) => {
    setMeeting(row)
    setShowEditMeetingModal(true)
  };


  return (
    <>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            <Tab label="Invited" {...a11yProps(0)} />
            <Tab label="My meetings" {...a11yProps(1)} />
          </Tabs>
        </Box>

        <TabPanel value={value} index={0}>
          <MeetingsTable meetings={invitedMeetings} showModal={showModal} user={user} own={false}/>
       
        </TabPanel>

        <TabPanel value={value} index={1}>
          <MeetingsTable meetings={meetings}  showModal={showModal} user={user} own={true} />
        
        </TabPanel>

        

        {
          showEditMeetingModal &&
          <EditMeetingModal
            setOpen={setShowEditMeetingModal}
            open={showEditMeetingModal}
            meeting={meeting}
            user={user}
          />
        }

      <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={severity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
 
  );
}


export default MyMeetings