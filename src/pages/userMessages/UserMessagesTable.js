import * as React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import { Button, Checkbox, Chip, CircularProgress, Menu, MenuItem, Pagination, Snackbar, TableHead, Tooltip, Typography } from '@mui/material';
import { ArrowDropDown, ContentPasteOff, DeleteOutlined, EditOutlined, MarkAsUnreadOutlined, MarkEmailRead, ReadMoreOutlined } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import DeleteDialog from './DeleteDialog';
import instance from '../../services/fetchApi';
import { massReadInboxMessages, readInboxMessages, reloadNotifications, removeMessage, removeMessages, setInboxMessages, setReloadMessages, setShowDeleteNotification, setShowUpdateNotification } from '../../features/MessagesSlice';
import MuiAlert from '@mui/material/Alert';


const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

const UserMessagesTable = ({messages, isInbox, getInboxMessages, getOutboxMessages, loading}) => {

  const [page, setPage] = React.useState(1);
  const {allUsers} = useSelector(state => state.user)
  const {showUpdateNotification, showDeleteteNotification, reloadMessages} = useSelector(state => state.message)
  const navigate = useNavigate()
  const [openDialog, setOpenDialog] = React.useState(false);
  const [messageId, setMessageId] = React.useState();
  const dispatch = useDispatch()
  const [openAlert, setOpenAlert] = React.useState(false)
  const [severity, setSeverity] = React.useState("")
  const [text, setText] = React.useState("")
  const [showTableActions, setShowTableActions] = React.useState(false)
  const [checked, setChecked] = React.useState(false);
  const [messageIds, setMessageIds] = React.useState([]);
  const [showNewMessageTag, setShowNewMessageTag] = React.useState(false);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMenu = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleChange = (event) => {
    setChecked(event.target.checked);
  };

  React.useEffect(() => {
     if(isInbox){
      getInboxMessages(page)
    } else {
      getOutboxMessages(page)
    }
  }, [page])

  const reloadInbox = async () => {
    await instance.get(`inboxmessages?page=1`)
    .then((res)=> {
      dispatch(setInboxMessages({inbox: res.data.inbox}))
      dispatch(setReloadMessages({reloadMessages: false}))

      setShowNewMessageTag(true); // Set the state to true initially

      setTimeout(() => {
        setShowNewMessageTag(false); // Set the state back to false after 4 seconds
      }, 4000);

    })
    .catch(() => {
      showAlert()
    })
  }

  React.useEffect(() => {
    if (reloadMessages && page === 1) {
     reloadInbox()
    }
  }, [reloadMessages])


  const handleCloseAlert = () => {
    setOpenAlert(false)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  };

  const deleteMessage = (message) => {
    setOpenDialog(true)
    setMessageId(message?.id)
  };

  const showAlert = (message, severity) => {
    setOpenAlert(true)
    setSeverity(severity)
    setText(message)
  };

  const handleDelete = async () => {
    dispatch(setShowDeleteNotification({showDeleteteNotification: true}))
    if (messageIds.length) {

      let body = {
        messageIds,
        mode: isInbox ? "inbox" : "outbox"
      }

      await instance.post(`mass-delete-messages`, body)
      .then(() => {
       
        showAlert("Messages deleted","success")
        dispatch(removeMessages({messageIds: messageIds.map((a) => a.id), isInbox}))
        dispatch(setShowDeleteNotification({showDeleteteNotification: false}))
        dispatch(reloadNotifications())
        setOpenDialog(false)
        setMessageIds([])
      })
      .catch(() => {
        showAlert("Ooops an error was encountered","error")
      })
    } else {
      await instance.delete(`messages/${messageId}`)
      .then(() => {
       
        showAlert("Message deleted","success")
        dispatch(removeMessage({messageId: messageId, isInbox}))
        dispatch(setShowDeleteNotification({showDeleteteNotification: false}))
        dispatch(reloadNotifications())
        setOpenDialog(false)
      })
      .catch(() => {
        showAlert("Ooops an error was encountered","error")
      })
    }
    
    
  };

  const markAsRead = async (text) => {
    dispatch(setShowUpdateNotification({showUpdateNotification: true}))
    await instance.patch(`messages/${messageId}/read`, {isRead: text === "read" ? false : true})
    .then((res) => {
      dispatch(readInboxMessages({messageId, isRead: text === "read" ? false : true}))
      dispatch(setShowUpdateNotification({showUpdateNotification: false}))
      dispatch(reloadNotifications())
    })
    .catch(() => {

    })
  }

  const massMarkAsRead = async () => {
    dispatch(setShowUpdateNotification({showUpdateNotification: true}))
    const readArray = messageIds.filter(item => item.read)
    const unreadArray = messageIds.filter(item => !item.read)
   

    await instance.post(`mass-mark-as-read`, {messageIds})
    .then((res) => {
      dispatch(massReadInboxMessages({readArray: readArray.map((a) => a.id), unreadArray: unreadArray.map((a) => a.id)}))
      dispatch(reloadNotifications())
      dispatch(setShowUpdateNotification({showUpdateNotification: false}))
      setMessageIds([])
    })
    .catch(() => {

    })
  }

  const getInitials = (string) => {
    let names = string?.split(' '),
        initials = names[0].substring(0, 1).toUpperCase();
    
    if (names.length > 1) {
        initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  }

  const renderMarkAsRead = (row) => {
    if(isInbox) {
      if (row.isRead) {
        return   <Tooltip title="Mark as unread">
                    <MarkAsUnreadOutlined
                      style={{cursor: "pointer"}}
                      onClick={()=> markAsRead("read")}
                    />
                  </Tooltip>
      } else {
        return   <Tooltip title="Mark as read">
                    <MarkAsUnreadOutlined
                      style={{cursor: "pointer"}}
                      onClick={()=> markAsRead("unread")}
                    />
                  </Tooltip>
      }
    } else {
      return null
    }
   
  }

  const getImage = (row) => {

    let image_src = allUsers?.find((a)=> a.id === row.sender_id)?.profile_pic

    if ( image_src === ""  || image_src === null) {
      return (
        <div 
          style={{
            display: "inline-block",
            backgroundColor: "gray" ,
            borderRadius: "50%",
            cursor: "pointer",
          }}
          onClick={() => navigate(`/profile/${allUsers?.find((a)=> a.id === row.sender_id)?.id}`)}
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
            {getInitials(allUsers?.find((a)=> a.id === row.sender_id)?.name)}
          </p>
        </div>
      )
    } else {
      if (!image_src) {
         return (
          <p>Auto Generated</p>
         )
      } else {
        return (
          <img 
            width="30px" 
            height="30px" 
            src={image_src}  
            alt='profile_pic' 
            style={{borderRadius: "50%", cursor: "pointer"}} 
            onClick={() => navigate(`/profile/${allUsers?.find((a)=> a.id === row.sender_id)?.id}`)}
          />
        )
      }
    }
  }

  const arraysHaveSameContents = (array1, array2) => {
    // Check if the arrays have the same length
    if (array1?.length !== array2?.length) {
      return false;
    }

    if (!array1.length && !array2.length) {
      return false;
    }
  
    // Sort the arrays to ensure consistent ordering for comparison
    const sortedArray1 = array1?.slice().sort();
    const sortedArray2 = array2?.slice().sort();
  
    // Compare each element in the arrays
    for (let i = 0; i < sortedArray1.length; i++) {
      if (sortedArray1[i] !== sortedArray2[i]) {
        return false;
      }
    }
  
    return true;
  }



  return (
    <>
    <div style={{display: "flex"}}>
      <Typography variant='h7'><b>{ isInbox ? "Inbox" : "Outbox"}</b></Typography>

      {
        messageIds.length ? (
          <div style={{marginLeft: "30px"}}>

            {
              isInbox && (
                <Tooltip title="Mark as read/unread">
                  <MarkEmailRead
                    style={{cursor: "pointer", marginLeft: "20px"}}
                    onClick={()=> massMarkAsRead()}
                  />
                </Tooltip>
              )
            }
    
            <Tooltip title="Delete">
              <DeleteOutlined
                style={{cursor: "pointer", marginLeft: "20px"}}
                onClick={()=> setOpenDialog(true)}
              />
             </Tooltip>

             <span style={{marginLeft: "10px"}}>
              {messageIds.length} Items Selected
            </span>
          </div>
        ) : null
      }


      {
        showUpdateNotification && (
          <span style={{color: "green", marginLeft: "12px"}}>Updating...</span>
        )
      }

     
    </div>
   
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="custom pagination table">
        <TableHead>
            <TableRow>
              <TableCell >
                <Checkbox
                  checked={arraysHaveSameContents(messages?.data?.map((a) => a.id), messageIds.map((a) => a.id))}
                  indeterminate={messageIds.length > 0 && messageIds.length < messages?.data?.length}
                  onChange={(e,f) => {
                    if (f) {
                      let ids = messages?.data?.map((a) => {
                        return {
                          id: a.id,
                          read: a.isRead
                        }
                      })
  
                      setMessageIds(ids)
                    } else {
                      setMessageIds([])
                    }
                  }}
                  inputProps={{ 'aria-label': 'controlled' }}
                />

                <span>
                  <Button
                    id="basic-button"
                    aria-controls={openMenu ? 'basic-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={openMenu ? 'true' : undefined}
                    onClick={handleClick}
                  >
                    <ArrowDropDown />
                  </Button>
                  <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={openMenu}
                    onClose={handleCloseMenu}
                    MenuListProps={{
                      'aria-labelledby': 'basic-button',
                    }}
                  >
                    {isInbox &&
                      <>
                        <MenuItem 
                          onClick={() => {
                            let readIds = messages?.data?.filter((a) => a.isRead).map((b) => {
                              return {
                                id: b.id,
                                read: b.isRead
                              }
                            })
                        
                            setMessageIds(readIds)
                          }}
                        >
                          Read
                        </MenuItem>
                        
                        <MenuItem 
                          onClick={() => {
                            let readIds = messages?.data?.filter((a) => !a.isRead).map((b) => {
                              return {
                                id: b.id,
                                read: b.isRead
                              }
                            })
                        
                            setMessageIds(readIds)
                          }}
                        >
                          Unread
                        </MenuItem>
                      </>
                    }
                   
                    <MenuItem 
                      onClick={() => {
                        let ids = messages.data.map((a) => {
                          return {
                            id: a.id,
                            read: a.isRead
                          }
                        })
    
                        setMessageIds(ids)
                      }}
                    >
                      All
                    </MenuItem>
                    
                    <MenuItem 
                      onClick={() => {
    
                        setMessageIds([])
                      }}
                    >
                      None
                    </MenuItem>
                  </Menu>
                </span>
              </TableCell>
              <TableCell >Subject</TableCell>

              {isInbox && <TableCell >Sent By</TableCell>}
              {!isInbox && <TableCell >Recipient</TableCell>}
              {isInbox && <TableCell >Message</TableCell>}
              <TableCell >Date Sent</TableCell>
              <TableCell >Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              !messages?.data?.length ? (
                <div style={{marginTop: "50px", marginLeft: "150%"}}>
                  <ContentPasteOff sx={{fontSize: "64px"}}/>
                  <Typography variant='h7' sx={{display: "flex", width: "150px"}}>No Messages</Typography>
                </div>
              ) : (
                <>
                 {
                    loading ? (
                      <div style={{ marginLeft: "200%", marginTop: "70px" }}>
                        <Typography variant='h7'>
                            <b>Loading...</b>
                          </Typography>
                      </div>
                    ) :
                    messages?.data?.map((row) => (
                      <TableRow
                        key={row.name} 
                        sx={{backgroundColor: (isInbox && row.isRead) ? "lightgrey" : null}} 
                        onMouseEnter={() => {
                          setMessageId(row.id)
                          setShowTableActions(true)
                        }}
                        onMouseLeave={()=> {
                          setShowTableActions(false)
                        }}
                      >
                        <TableCell component="th" scope="row">
                          <Checkbox
                             checked={messageIds.map((a) => a.id).includes(row.id)}
                             onChange={(e,f) => {
                             
                               if(f) {
                                 setMessageIds([...messageIds, {id: row.id, read: row.isRead}])
                               } else {
                                setMessageIds(messageIds.filter((b) => b.id !== row.id))
                               }
                             }}
                            inputProps={{ 'aria-label': 'controlled' }}
                          />
                        </TableCell>

                        <TableCell component="th" scope="row">
                          {row.subject}
                        </TableCell>

                        {
                          isInbox &&
                          <TableCell style={{ width: 160 }} >
                            {/* {allUsers?.find((a) => a.id === row.sender_id)?.name} */}
                            <Tooltip title={allUsers?.find((a)=> a.id === row.sender_id)?.name}>
                              {getImage(row)}
                            </Tooltip>
                          </TableCell>
                        }
                      
                        {
                          !isInbox &&
                          <TableCell style={{ width: 160 }} >
                            {allUsers?.find((a) => a.id === row.receiver_id)?.name}
                          </TableCell>
                        }

                        { isInbox &&
                          <TableCell style={{ width: 160 }} >
                            {
                              row.message.length > 15 ?
                              `${row.message.substring(0, 15)}.....` :
                              row.message
                            }
                          </TableCell>
                        }
                      
                        <TableCell style={{ width: 160 }} >
                          {moment(row.created_at).format("MMMM Do YYYY")}
                        </TableCell>
                        <TableCell style={{ width: 160 }} >
                          <div style={{display: "flex", justifyContent: "space-evenly"}}>

                            {
                              (showTableActions && messageId === row.id) && (
                                <>
                                  <Tooltip title="View message">
                                    <ReadMoreOutlined
                                      style={{cursor: "pointer"}}
                                      onClick={()=> navigate(`/messages/${row.id}`, {state: {isInbox, isRead: row.isRead, auto: !row.sender_id ? true : false}})}
                                    />
                                  </Tooltip>

                                  {
                                    renderMarkAsRead(row)
                                  }

                                  <Tooltip title="Delete">
                                    <DeleteOutlined
                                      style={{cursor: "pointer"}}
                                      onClick={()=> deleteMessage(row)}
                                    />
                                  </Tooltip>
                                </>
                              )
                            }

                            {
                              (showNewMessageTag && row.new) && (
                                <Chip label="New" color="success" />
                              )
                            }
                          
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  }
                </>
              )
            }
           
          </TableBody>
      </Table>
    </TableContainer>


    <div style={{marginTop: "20px"}}>
      <Pagination
        count={ Math.ceil(messages?.total / messages?.per_page)}
        page={page}
        onChange={(page, idx) => {
          handleChangePage(page, idx)
        }}
        color="secondary"
        showFirstButton
        showLastButton
      />
    </div>

    <DeleteDialog
      open={openDialog}
      setOpen={setOpenDialog}
      handleDelete={handleDelete}
      showDeleteteNotification={showDeleteteNotification}
    />

    <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
      <Alert onClose={handleCloseAlert} severity={severity} sx={{ width: '100%' }}>
        { text }
      </Alert>
    </Snackbar>
    </>
  );
}

export default UserMessagesTable