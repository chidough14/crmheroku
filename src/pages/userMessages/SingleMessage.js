import { ArrowBack } from '@mui/icons-material'
import { Box, Button, CircularProgress, Snackbar, Tooltip, Typography } from '@mui/material'
import moment from 'moment'
import React, {useEffect, useState} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { readInboxMessages, reloadNotifications, setFromBell, setPage, setShowSingleMessage, setSingleMessage } from '../../features/MessagesSlice'
import instance from '../../services/fetchApi'
import { getToken } from '../../services/LocalStorageService'
import ComposeMessage from './ComposeMessage'
import MuiAlert from '@mui/material/Alert';
// import { DeltaToStringConverter } from '../../services/DeltaToStringConverter'
// import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';
import deltaToString from "delta-to-string-converter"

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const SingleMessage = ({socket, currentMessageId}) => {
  const params = useParams()
  const location = useLocation()
  const dispatch = useDispatch()
  const { inbox, singleMessage, sendingMessage, fromBell } = useSelector(state => state.message)
  const {allUsers} = useSelector(state => state.user)
  const [replyMode, setReplyMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activityId, setActivityId] = useState()
  const navigate = useNavigate()
  const [openAlert, setOpenAlert] = useState(false)
  const [severity, setSeverity] = useState("")
  const [content, setContent] = useState("")
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

  // useEffect(() => {

  //   const getMessage = async () => {
  //     setLoading(true)
  //     await instance.get(`messages/${params.id}`)
  //     .then((res) => {
  //       dispatch(setSingleMessage({message: res.data.messageDetails}))
  //       setLoading(false)
  //     })
  //     .catch(() => {
  //       setOpenAlert(true)
  //       setSeverity("error")
  //       setText("Ooops an error was encountered")
  //     })
  //   }

  //   const readMessage = async () => {
  //     await instance.patch(`messages/${params.id}/read`, {isRead: true})
  //     .then((res) => {
  //      // dispatch(readInboxMessages({messageId: res.data.messageDetails.id}))
  //       dispatch(reloadNotifications())
  //     })
  //   }

  //   if (params.id) {
  //     getMessage()

  //     if (!location.state?.isRead && location.state?.isInbox) {
  //       readMessage()
  //     }
    
  //   }

  // }, [params?.id])

  useEffect(() => {

    const getMessage = async () => {
      setLoading(true)
      await instance.get(`messages/${currentMessageId}`)
      .then((res) => {
        dispatch(setSingleMessage({message: res.data.messageDetails}))
        dispatch(reloadNotifications())
        setLoading(false)
      })
      .catch(() => {
        setOpenAlert(true)
        setSeverity("error")
        setText("Ooops an error was encountered")
      })
    }

    // const readMessage = async () => {
    //   await instance.patch(`messages/${currentMessageId}/read`, {isRead: true})
    //   .then((res) => {
    //     console.log(inbox, res.data.messageDetails);
    //     // dispatch(readInboxMessages({messageId: res.data.messageDetails.id}))
    //     dispatch(reloadNotifications())
    //   })
    // }

    if (currentMessageId) {
      getMessage()
     
      // if (location.state?.isRead === 0 && location.state?.isInbox) {
      //   console.log(location);
      //   readMessage()
      // }
    
    }

  }, [currentMessageId])

  const isValidJson = (string) => {
    try {
      JSON.parse(string)
      return true
    } catch (error) {
      return false
    }
  }

  function isMessageFormat(str) {

    const pattern = /^(Activity|List) ID \((\d{1,9}|[1-9]\d{1,8}|1000000000)\)$/;

    return pattern.test(str);
  }

  useEffect(()=> {
    // if(location.state?.auto) {
    //   let mySubString = singleMessage?.quill_message?.substring(
    //     singleMessage?.quill_message.indexOf("(") + 1, 
    //     singleMessage?.quill_message.lastIndexOf(")")
    //   );

    //   setActivityId(parseInt(mySubString))
    // }

    if (isMessageFormat(singleMessage?.message)) {
 
      let mySubString = singleMessage?.message?.substring(
        singleMessage?.message?.indexOf("(") + 1, 
        singleMessage?.message?.lastIndexOf(")")
      );
  
      setActivityId(parseInt(mySubString))
    } else {
      setActivityId(null)
    }
    // let text
    // text = isActivityIDFormat(singleMessage?.message) ? singleMessage?.message : singleMessage?.quill_message
   
    // let mySubString = text?.substring(
    //   text?.indexOf("(") + 1, 
    //   text?.lastIndexOf(")")
    // );

    // console.log(text, mySubString);

    // setActivityId(parseInt(mySubString))

    if(singleMessage?.quill_message) {
      if (isValidJson(singleMessage?.quill_message)) {
        // var converter = new QuillDeltaToHtmlConverter(JSON.parse(singleMessage?.quill_message).ops, {});

        // var html = converter.convert();

        // setContent(DeltaToStringConverter(JSON.parse(singleMessage?.quill_message).ops))
        if (JSON.parse(singleMessage?.quill_message).ops) {
          setContent(deltaToString(JSON.parse(singleMessage?.quill_message).ops))
        } else {
          setContent(singleMessage?.quill_message)
        }
        // setContent(deltaToString(JSON.parse(singleMessage?.quill_message).ops))

        // if (html) {
        //   setContent(html)
        // } else {
        //   setContent(singleMessage?.quill_message)
        // }
      } else {
        setContent(singleMessage?.quill_message)
      }
    } else {
      setContent("")
    }

  
  }, [singleMessage, location])

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

  const renderSentBy = (senderId) => {
    if (senderId === null) {
      return  <Typography variant='h7'>
                <b>Sent By</b> : Auto Generated
              </Typography>
    } else {
    return    <Typography variant='h7'>
                <b>Sent By</b> : &nbsp;&nbsp;
                { getImage(singleMessage?.sender_id) } &nbsp;&nbsp;
                {allUsers?.find((a) => a.id === senderId)?.name}
                ({allUsers?.find((a) => a.id === senderId)?.email})
              </Typography>
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
              <Button 
                onClick={() => {
                  dispatch(setShowSingleMessage({showSingleMessage: false}))
                  if (fromBell) {
                    dispatch(setPage({page: 1}))
                  }

                  dispatch(setFromBell({fromBell: false}))
                  // dispatch(setPage({page: 1}))
                  // navigate("/messages", {state: {isInbox: location?.state?.isInbox}})
                }}
              >
                <ArrowBack />
              </Button>
            </Tooltip>
          }
          
          {
            replyMode ? (
              <ComposeMessage replyMode={replyMode} singleMessage={singleMessage} socket={socket} sendingMessage={sendingMessage} />
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
                    ) : renderSentBy(singleMessage?.sender_id)
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
                   <div dangerouslySetInnerHTML={{ __html: content }} />
                   {
                    // !singleMessage?.sender_id ? singleMessage?.message.replace(/ *\([^)]*\) */g, "") : singleMessage?.message
                   }
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