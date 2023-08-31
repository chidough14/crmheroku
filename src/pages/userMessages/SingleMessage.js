import { ArrowBack, DownloadOutlined, FilePresent } from '@mui/icons-material'
import { Box, Button, CircularProgress, Snackbar, Tooltip, Typography } from '@mui/material'
import moment from 'moment'
import React, {useEffect, useState} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { readInboxMessages, reloadNotifications, setFromBell, setPage, setShowSingleMessage, setSingleDraft, setSingleMessage } from '../../features/MessagesSlice'
import instance from '../../services/fetchApi'
import { getToken } from '../../services/LocalStorageService'
import ComposeMessage from './ComposeMessage'
import MuiAlert from '@mui/material/Alert';
import deltaToString from "delta-to-string-converter"
import { checkFileType } from '../../services/checkers'

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const SingleMessage = ({socket, currentMessageId}) => {
  const params = useParams()
  const location = useLocation()
  const dispatch = useDispatch()
  const { inbox, singleMessage, sendingMessage, fromBell, singleDraft } = useSelector(state => state.message)
  const {allUsers} = useSelector(state => state.user)
  const [replyMode, setReplyMode] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activityId, setActivityId] = useState()
  const navigate = useNavigate()
  const [openAlert, setOpenAlert] = useState(false)
  const [severity, setSeverity] = useState("")
  const [content, setContent] = useState("")
  const [currentFile, setCurrentFile] = useState("")
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


  useEffect(() => {

    // const readMessage = async () => {
    //   await instance.patch(`messages/${currentMessageId}/read`, {isRead: true})
    //   .then((res) => {
    //     console.log(inbox, res.data.messageDetails);
    //     // dispatch(readInboxMessages({messageId: res.data.messageDetails.id}))
    //     dispatch(reloadNotifications())
    //   })
    // }

    if (currentMessageId && !singleDraft) {
      getMessage()
    
    }

  }, [currentMessageId])

  useEffect(() => {
    if (singleDraft) {
      if(singleDraft?.message) {
        setContent(singleDraft?.message)
      } else {
        setContent("")
      }
    }

  }, [currentMessageId, singleDraft])

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

    if (!singleDraft) {
      if (isMessageFormat(singleMessage?.message)) {
  
        let mySubString = singleMessage?.message?.substring(
          singleMessage?.message?.indexOf("(") + 1, 
          singleMessage?.message?.lastIndexOf(")")
        );
    
        setActivityId(parseInt(mySubString))
      } else {
        setActivityId(null)
      }

      if(singleMessage?.quill_message) {
        if (isValidJson(singleMessage?.quill_message)) {

          if (JSON.parse(singleMessage?.quill_message).ops) {
            setContent(deltaToString(JSON.parse(singleMessage?.quill_message).ops))
          } else {
            setContent(singleMessage?.quill_message)
          }
        } else {
          setContent(singleMessage?.quill_message)
        }
      } else {
        setContent("")
      }
    }

  
  }, [singleMessage, location, singleDraft])

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

  const renderFiles = (files, type) => {
    return files.map((a) => {
      const isImage = checkFileType(a) === "image";
  
      return (
        <div
          key={a} // Add a unique key for each rendered element
          style={{
            marginRight: "20px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            marginTop: "40px",
          }}
          onMouseEnter={() => {
            setCurrentFile(a)
          }}
          onMouseLeave={() => {
            setCurrentFile("")
          }}
        >
          <div>
            {isImage ? (
              <img
                src={`${process.env.REACT_APP_BASE_URL}${a}`}
                alt="Image"
                style={{ height: "30px" }}
              />
            ) : (
              <FilePresent />
            )}

            {
              currentFile === a && (
                <span
                  style={{ marginLeft: "6px", color: "green", cursor: "pointer" }}
                  onClick={() => downloadFile(a.replace("files/", ""))}
                >
                  <DownloadOutlined />
                </span>
              )
            }
         
          </div>
          <p style={{ marginTop: "-7px", fontSize: "14px" }}>{a.replace("files/", "")}</p>
        </div>
      );
    });
  };


  
  const downloadFile = async (filename) => {
    try {
      const response = await instance.get(`download-file/${filename}`, {
        responseType: 'blob', // Important for binary data
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename); // Change the filename as needed
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

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
                  dispatch(setSingleDraft({singleDraft: undefined}))
                  // dispatch(setPage({page: 1}))
                  // navigate("/messages", {state: {isInbox: location?.state?.isInbox}})
                }}
              >
                <ArrowBack />
              </Button>
            </Tooltip>
          }
          
          {
            replyMode || editMode ? (
              <ComposeMessage 
                replyMode={replyMode} 
                singleMessage={singleMessage} 
                editMode={editMode} 
                singleDraft={singleDraft} 
                socket={socket} 
                sendingMessage={sendingMessage} 
              />
            ) : (
              <Box
                sx={{  bgcolor: 'background.paper', height: 224, marginTop: "20px" }}
              >
                <Typography variant='h7'>
                  <b>Subject</b> : {singleDraft ? singleDraft?.subject : singleMessage?.subject}
                </Typography>
                <p></p>
                {
                  (location.state?.isInbox && !singleDraft) &&
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
                  <b>Date</b> : {
                    singleDraft ? 
                    moment(singleDraft?.created_at).format("MMMM Do YYYY, h:mm a") : 
                    moment(singleMessage?.created_at).format("MMMM Do YYYY, h:mm a")
                  }
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

                <div style={{display: "flex"}}>
                  {
                    singleMessage?.files?.length && renderFiles(singleMessage?.files)
                  }
                  
                  {
                    singleDraft?.files?.length && renderFiles(singleDraft?.files)
                  }
                </div>
            
                
                {
                  location.state?.isInbox && (
                    <Button 
                      size='small' 
                      color="error" 
                      variant="contained" 
                      onClick={() => {
                        if (singleDraft) {
                          setEditMode(true)
                        
                        } else {
                          setReplyMode(true)
                        }
                       
                      }}
                      disabled={location?.state?.auto }
                      style={{borderRadius: "30px"}}
                    >
                      {
                        singleDraft ? "Edit" : "Reply"
                      }
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