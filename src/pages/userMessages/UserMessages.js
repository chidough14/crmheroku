import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import UserMessagesTable from './UserMessagesTable';
import ComposeMessage from './ComposeMessage';
import { useEffect } from 'react';
import instance from '../../services/fetchApi';
import { setInboxMessages, setOutboxMessages } from '../../features/MessagesSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { getToken } from '../../services/LocalStorageService';
import { CreateOutlined, InboxOutlined, OutboxOutlined, PhoneOutlined, SendOutlined } from '@mui/icons-material';
import { Snackbar, Tooltip } from '@mui/material';
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
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
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

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

const UserMessages = ({socket}) => {
  const [value, setValue] = React.useState(0);
  const [inboxLoading, setInboxLoading] = React.useState(false);
  const [outboxLoading, setOutboxLoading] = React.useState(false);
  const dispatch = useDispatch()

  const token = getToken()
  const navigate = useNavigate()
  const {inbox, outbox}  = useSelector(state => state.message)
  const [openAlert, setOpenAlert] = React.useState(false)
  const [severity, setSeverity] = React.useState("")
  const [text, setText] = React.useState("")
  const [isInbox, setIsInbox] = React.useState("")
  
  const {state} = useLocation();

  // useEffect(() => {
  //   socket.on('receiveNotification', (message) => {
  //     console.log(`received notification: ${message}`);
  //   });
  // }, [socket])

  useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [token])


  useEffect(() => {
    if (state) {
      setValue(2)
    }
  }, [state])

  const handleCloseAlert = () => {
    setOpenAlert(false)
  }

  const showAlert = () => {
    setOpenAlert(true)
    setSeverity("error")
    setText("Ooops an error was encountered")
  }



  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const getInboxMessages = async (page = 1) => {
    setInboxLoading(true)

    await instance.get(`inboxmessages?page=${page}`)
    .then((res)=> {
      dispatch(setInboxMessages({inbox: res.data.inbox}))
      setInboxLoading(false)
    })
    .catch(() => {
      showAlert()
    })
  }

  const getOutboxMessages = async (page = 1) => {
    setOutboxLoading(true)
    await instance.get(`outboxmessages?page=${page}`)
    .then((res)=> {
      dispatch(setOutboxMessages({outbox: res.data.outbox}))
      setOutboxLoading(false)
    })
    .catch(() => {
      showAlert()
    })
  }

  useEffect(()=> {
    if (!outbox?.data){
      getOutboxMessages()
    }
   
    if (!inbox?.data) {
      getInboxMessages()
    }
    
   
  }, [inbox?.data, outbox?.data])

  return (
    <>
    <Typography variant='h6'>Messages</Typography>
      <Box
        sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', height: 224, marginTop: "20px" }}
      >
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleChange}
          aria-label="Vertical tabs example"
          sx={{ borderRight: 1, borderColor: 'divider' }}
        >
          <Tab icon={<Tooltip title="Inbox"><InboxOutlined /></Tooltip>}  {...a11yProps(0)} />
          <Tab icon={<Tooltip title="Outbox"><OutboxOutlined /></Tooltip>}  {...a11yProps(1)} />
          <Tab icon={<Tooltip title="Compose"><CreateOutlined /></Tooltip>} {...a11yProps(2)} />
        </Tabs>
        <TabPanel value={value} index={0}>
          <UserMessagesTable messages={inbox} isInbox={true} getInboxMessages={getInboxMessages} loading={inboxLoading} />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <UserMessagesTable messages={outbox} isInbox={false} getOutboxMessages={getOutboxMessages} loading={outboxLoading} />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <ComposeMessage socket={socket} state={state} />
        </TabPanel>
      </Box>

      <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={severity} sx={{ width: '100%' }}>
          { text }
        </Alert>
      </Snackbar>
    </>
  );
}

export default UserMessages