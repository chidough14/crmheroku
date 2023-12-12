import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import UserMessagesTable from './UserMessagesTable';
import ComposeMessage from './ComposeMessage';
import instance from '../../services/fetchApi';
import { setDrafts, setDraftsLoading, setFromChat, setInboxMessages, setOutboxMessages, setUsersConversations } from '../../features/MessagesSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { getToken } from '../../services/LocalStorageService';
import { ChatBubbleOutline, CreateOutlined, DraftsOutlined, InboxOutlined, OutboxOutlined } from '@mui/icons-material';
import { Snackbar, Tooltip } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import SingleMessage from './SingleMessage';
import Drafts from './Drafts';
import ChatMessages from './ChatMessages';
import deltaToString from "delta-to-string-converter"


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
  const {
    inbox,
    outbox, 
    sendingMessage, 
    showSingleMessage, 
    currentMessageId,
    inboxPage,
    outboxPage,
    chatsPage,
    draftsPage,
    inboxMode,
    fromChat,
    draftsLoading
  }  = useSelector(state => state.message)
  const [openAlert, setOpenAlert] = React.useState(false)
  const [severity, setSeverity] = React.useState("")
  const [text, setText] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  
  const {state} = useLocation();

  React.useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [token])


  React.useEffect(() => {
    if (state?.sendMessage) {
      setValue(2)
    } else {
      if (!state?.isInbox) {
        setValue(1)
      }
  
      if (state?.isInbox) {
        setValue(0)
      }

      if (state?.chat) {
        setValue(4)
      }
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

    // if (newValue === 0) {
    //   dispatch(setInboxPage({page: 1}))
    // }

    // if (newValue === 1) {
    //   dispatch(setOutboxPage({page: 1}))
    // }
  };

  const getConversations = async (page = 1) => {
    setLoading(true)
    await instance.get(`conversations/users?page=${page}`)
    .then((res) => {
       dispatch(setUsersConversations({users_conversations: res.data.conversations}))
       setLoading(false)

    })
  }

  const getInboxMessages = async (page = 1) => {
    setInboxLoading(true)

    await instance.get(`inboxmessages?page=${page}`)
    .then((res)=> {
      dispatch(setInboxMessages({inbox: res.data.inbox}))
      setInboxLoading(false)
    })
    .catch((e) => {
      console.log(e);
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
    .catch((e) => {
      console.log(e);
      showAlert()
    })
  }

  const isValidJson = (string) => {
    try {
      JSON.parse(string)
      return true
    } catch (error) {
      return false
    }
  }

  const getDrafts = async (page = 1) => {
    dispatch(setDraftsLoading({draftsLoading: true}))

    await instance.get(`/drafts?page=${page}`)
    .then((res) => {
      let formttedDrafts = res.data.drafts.data.map((a)=> {
        return {
          ...a,
          message: isValidJson(a.message) ? deltaToString(JSON.parse(a.message).ops) : a.message
        }
      })
      res.data.drafts.data = formttedDrafts
      dispatch(setDrafts({drafts: res.data.drafts}))
      dispatch(setDraftsLoading({draftsLoading: false}))
    })
    .catch(() => {

    })
  }

  React.useEffect(() => {
    if (!fromChat) {
      getInboxMessages(inboxPage)
    }
    dispatch(setFromChat({fromChat: false}))
  }, [inboxPage])

  React.useEffect(() => {
    if (!fromChat) {
      getOutboxMessages(outboxPage)
    }
    dispatch(setFromChat({fromChat: false}))
  }, [outboxPage])

  React.useEffect(() => {
    if (!fromChat) {
      getConversations(chatsPage)
    }
    dispatch(setFromChat({fromChat: false}))
  }, [chatsPage])

  React.useEffect(() => {
    if (!fromChat) {
      getDrafts(draftsPage)
    }
    dispatch(setFromChat({fromChat: false}))
  }, [draftsPage])

 React.useEffect(()=> {
    if (!outbox?.data.length){
      getOutboxMessages()
    }
   
    if (!inbox?.data.length) {
      getInboxMessages()
    }
    
   
  }, [inbox?.data.length, outbox?.data.length])

  return (
    <>
    <Typography variant='h6'>Messages</Typography>
      {
      showSingleMessage ? (
        <>
          <SingleMessage
            currentMessageId={currentMessageId}
            socket={socket}
            inboxMode={inboxMode}
          />
        </>
      ) :
      
      <Box
        sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', height: 224, marginTop: "20px" }}
      >
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleChange}
          aria-label="Vertical tabs example"
          sx={{ borderRight: 1, borderColor: 'divider', height: "400px" }}
        >
          <Tab icon={<Tooltip title="Inbox"><InboxOutlined /></Tooltip>}  {...a11yProps(0)} />
          <Tab icon={<Tooltip title="Outbox"><OutboxOutlined /></Tooltip>}  {...a11yProps(1)} />
          <Tab icon={<Tooltip title="Compose"><CreateOutlined /></Tooltip>} {...a11yProps(2)} />
          <Tab icon={<Tooltip title="Drafts"><DraftsOutlined /></Tooltip>} {...a11yProps(3)} />
          <Tab icon={<Tooltip title="Chat Messages"><ChatBubbleOutline /></Tooltip>} {...a11yProps(4)} />
        </Tabs>
        <TabPanel value={value} index={0}>
          <UserMessagesTable 
            messages={inbox} 
            isInbox={true} 
            getInboxMessages={getInboxMessages} 
            loading={inboxLoading} 
          />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <UserMessagesTable messages={outbox} isInbox={false} getOutboxMessages={getOutboxMessages} loading={outboxLoading} />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <ComposeMessage socket={socket} state={state} sendingMessage={sendingMessage} />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <Drafts 
            setValue={setValue}  
            socket={socket} 
            sendingMessage={sendingMessage} 
            draftsLoading={draftsLoading}
          />
        </TabPanel>
        <TabPanel value={value} index={4}>
          <ChatMessages
            loading={loading}
            setLoading={setLoading}
            getConversations={getConversations}
          />
        </TabPanel>
      </Box>
      }

      <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={severity} sx={{ width: '100%' }}>
          { text }
        </Alert>
      </Snackbar>
    </>
  );
}

export default UserMessages