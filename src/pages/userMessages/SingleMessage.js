import { ArrowBack } from '@mui/icons-material'
import { Box, Button, CircularProgress, Snackbar, Tooltip, Typography } from '@mui/material'
import moment from 'moment'
import React, {useEffect, useState} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { readInboxMessages, reloadNotifications, setSingleMessage } from '../../features/MessagesSlice'
import instance from '../../services/fetchApi'
import { getToken } from '../../services/LocalStorageService'
import ComposeMessage from './ComposeMessage'
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const SingleMessage = ({socket}) => {
  const params = useParams()
  const location = useLocation()
  const dispatch = useDispatch()
  const { singleMessage } = useSelector(state => state.message)
  const {allUsers} = useSelector(state => state.user)
  const [replyMode, setReplyMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activityId, setActivityId] = useState()
  const navigate = useNavigate()
  const [openAlert, setOpenAlert] = useState(false)
  const [severity, setSeverity] = useState("")
  const [text, setText] = useState("")

  const token = getToken()

  const handleCloseAlert = () => {
    setOpenAlert(false)
  }

  useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [token])

  useEffect(() => {

    const getMessage = async () => {
      setLoading(true)
      await instance.get(`messages/${params.id}`)
      .then((res) => {
        dispatch(setSingleMessage({message: res.data.messageDetails}))
        setLoading(false)
      })
      .catch(() => {
        setOpenAlert(true)
        setSeverity("error")
        setText("Ooops an error was encountered")
      })
    }

    const readMessage = async () => {
      await instance.patch(`messages/${params.id}/read`, {isRead: true})
      .then((res) => {
       // dispatch(readInboxMessages({messageId: res.data.messageDetails.id}))
        dispatch(reloadNotifications())
      })
    }

    if (params.id) {
      getMessage()

      if (!location.state?.isRead && location.state?.isInbox) {
        readMessage()
      }
    
    }

  }, [params?.id])

  useEffect(()=> {
    if(location.state?.auto) {
      let mySubString = singleMessage?.message?.substring(
        singleMessage?.message.indexOf("(") + 1, 
        singleMessage?.message.lastIndexOf(")")
      );

      setActivityId(parseInt(mySubString))
    }
   

  
  }, [singleMessage])

  const getInitials = (string) => {
    let names = string?.split(' '),
        initials = names[0].substring(0, 1).toUpperCase();
    
    if (names.length > 1) {
        initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  }

  const getImage = (id) => {

    let image_src
    image_src = allUsers?.find((a)=> a.id === id)?.profile_pic

    if ( image_src === ""  || image_src === null) {
      return (
        <div 
          style={{
            display: "inline-block",
            backgroundColor: "gray" ,
            borderRadius: "50%",
            cursor: "pointer",
            marginBottom: "-5px"
          }}
          onClick={() => {
            navigate(`/profile/${allUsers?.find((a)=> a.id === id)?.id}`)
          }}
        >
          <p 
            style={{
              color: "white",
              display: "table-cell",
              verticalAlign: "middle",
              textAlign: "center",
              textDecoration: "none",
              height: "30px",
              width: "30px",
              fontSize: "15px"
            }}
          >
            {getInitials(allUsers?.find((a)=> a.id === id)?.name) }
          </p>
        </div>
      )
    } else {
      return (
        <img 
          width="30px" 
          height="30px" 
          src={image_src}  
          alt='profile_pic' 
          style={{borderRadius: "50%", cursor: "pointer", marginBottom: "-5px"}} 
          onClick={() => {
            navigate(`/profile/${allUsers?.find((a)=> a.id === id)?.id}`)
          }}
        />
      )
    }
  }

  return (
    <>
      {
        loading ? (
          <Box sx={{ display: 'flex', marginLeft: "50%" }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
          {
            replyMode &&
            <Tooltip title="Back" placement="top">
              <Button onClick={() => setReplyMode(false)}>
                <ArrowBack />
              </Button>
            </Tooltip>
          }
    
          {
            !replyMode &&
            <Tooltip title="Back to Messages" placement="top">
              <Button onClick={() => navigate("/messages")}>
                <ArrowBack />
              </Button>
            </Tooltip>
          }
          
          {
            replyMode ? (
              <ComposeMessage replyMode={replyMode} singleMessage={singleMessage} socket={socket}/>
            ) : (
              <Box
                sx={{  bgcolor: 'background.paper', height: 224, marginTop: "20px" }}
              >
                <Typography variant='h7'>
                  <b>Subject</b> : {singleMessage?.subject}
                </Typography>
                <p></p>
                {
                  location.state?.isInbox &&
                  <>
                  {
                    location?.state?.auto ? (
                    <Typography variant='h7'>
                      <b>Sent By</b> : Auto Generated
                    </Typography>
                    ) : (
                    <Typography variant='h7'>
                      <b>Sent By</b> : &nbsp;&nbsp;
                      { getImage(singleMessage?.sender_id) } &nbsp;&nbsp;
                      {allUsers?.find((a) => a.id === singleMessage?.sender_id)?.name}
                      ({allUsers?.find((a) => a.id === singleMessage?.sender_id)?.email})
                    </Typography>
                    )
                  }
                    <p></p>
                  </>
                }
              
                <Typography variant='h7'>
                  <b>Date</b> : {moment(singleMessage?.created_at).format("MMMM Do YYYY, h:mm a")}
                </Typography>
                <p></p>
                <Typography variant='h7'>
                  <b>Message</b> : 
                </Typography>
                <div style={{border: "1px solid black", width: "50%", height: "250px", borderRadius: "10px"}}>
                  {!singleMessage?.sender_id ? singleMessage?.message.replace(/ *\([^)]*\) */g, "") : singleMessage?.message}
                  {
                    activityId ? (
                      <>
                      <p></p>
                      <Button onClick={()=> singleMessage?.subject.includes("List") ? navigate(`/listsview/${activityId}`) : navigate(`/activities/${activityId}`) }>
                        View {singleMessage?.subject.includes("List") ? "List" : "Activity"}
                      </Button>
                      </>
                    ) : null
                  }
                
                </div>
                <p></p>
                
                {
                  location.state?.isInbox && (
                    <Button 
                      size='small' 
                      color="error" 
                      variant="contained" 
                      onClick={() => {
                        setReplyMode(true)
                      }}
                      disabled={location?.state?.auto }
                      style={{borderRadius: "30px"}}
                    >
                      Reply
                    </Button>
                  ) 
                } 
              
              </Box>
            )
          }
          </>
        )
      }

      <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={severity} sx={{ width: '100%' }}>
          { text }
        </Alert>
      </Snackbar>
    </>
  )
}

export default SingleMessage