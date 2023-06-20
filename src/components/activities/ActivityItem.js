import React from 'react'
import { Draggable } from 'react-beautiful-dnd'
import { IconButton, Menu, Typography, MenuItem, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Snackbar, Tooltip, Chip, Checkbox } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import moment from 'moment';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import ChatIcon from '@mui/icons-material/Chat';
import {  ArrowDownwardOutlined, ArrowUpwardOutlined, CopyAllOutlined, DeleteOutlined, EditOutlined, MoreVert, MoveUpOutlined, RestoreFromTrash, ViewListOutlined } from '@mui/icons-material';
import { useState } from 'react';
import ActivityModal from './ActivityModal';
import instance from '../../services/fetchApi';
import { addActivity, addActivityId, removeActivity, removeActivityId, setShowCloningNotification, setShowDeleteNotification, setShowSendingSpinner } from '../../features/ActivitySlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { deleteEvent } from '../../features/EventSlice';
import ActivityTransferModal from './ActivityTransferModal';
import MuiAlert from '@mui/material/Alert';

const showIcon = (type) => {
  if (type === "Call") {
    return <PhoneIcon  fontSize='12'/>
  } else if (type === "Email") {
    return <EmailIcon  fontSize='12'/>
  } else if (type === "Meeting") {
    return <ChatIcon  fontSize='12' />
  }
}

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ActivityItem = ({activity, index, socket, showTrash}) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [openModal, setOpenModal] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [text, setText] = useState("");
  const [severity, setSeverity] = useState("");
  const [openTransferModal, setOpenTransferModal] = useState(false);
  const [activityObj, setActivityObj] = useState();
  const [activityId, setActivityId] = useState();
  const [restoreMode, setRestoreMode] = useState(false);
  const handleOpen = () => setOpenModal(true);
  const user = useSelector(state => state.user)
  const { showCloningNotification, showDeleteNotification, activityIds } = useSelector(state => state.activity)

  const showAlert = (msg, sev) => {
    setOpenAlert(true)
    setText(msg)
    setSeverity(sev)
  }

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget);
    setActivityId(activity.id)
  };
  const handleClose = () => {
    setAnchorEl(null);
    setActivityId(null)
  };

  const showEditModal = (event) => {
    event.stopPropagation()
    handleOpen()
  };

  const handleClickOpen = (event) => {
    event.stopPropagation()
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setRestoreMode(false)
  };

  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenAlert(false)
  };

  const deleteActivity = async (id, e) => {
    let url
    url = showTrash ? `activities-force-delete/${id}` : `activities/${id}`

    dispatch(setShowDeleteNotification({showDeleteNotification: true}))

    await instance.delete(url)
    .then(() => {
      showAlert("Activity deleted", "success")
      handleCloseDialog()
      dispatch(removeActivity({activityId: id}))
      dispatch(removeActivityId({id}))
      dispatch(deleteEvent({activityId: id}))
      dispatch(setShowDeleteNotification({showDeleteNotification: false}))
    })
    .catch(() => {
      showAlert("Ooops an error was encountered", "error")
      dispatch(setShowDeleteNotification({showDeleteNotification: false}))
    })
  };

  const cloneActivity = async (value) => {
    dispatch(setShowCloningNotification({showCloningNotification: true}))

    await instance.get(`activities/${value.id}/clone`)
    .then((res)=> {
      res.data.clonedActivity.decreased_probability = null
      res.data.clonedActivity.total = value.total
      dispatch(addActivity({activity: res.data.clonedActivity}))
      dispatch(setShowCloningNotification({showCloningNotification: false}))
   })
   .catch(() => {
      showAlert("Ooops an error was encountered", "error")
      dispatch(setShowCloningNotification({showCloningNotification: false}))
    })
  };

  const transferActivity =  (value) => {
    setOpenTransferModal(true)
    setActivityObj(value)
  };


  const restoreActivity = async (id) => {
    dispatch(setShowDeleteNotification({showDeleteNotification: true}))

    await instance.get(`activity-restore/${id}`)
    .then(() => {
      handleCloseDialog()
      showAlert("Activity restored", "success")
      dispatch(removeActivity({activityId: id}))
      dispatch(removeActivityId({id}))
      dispatch(setShowDeleteNotification({showDeleteNotification: false}))
    })
    .catch(() => {
      dispatch(setShowDeleteNotification({showDeleteNotification: false}))
      showAlert("Ooops an error was encountered", "error")
    })
  }

  return (
    <>
      <Draggable draggableId={activity.id.toString()} index={index} key={activity.id.toString()} isDragDisabled={activity.probability === "Closed" || showTrash}>
        {provided => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >

            <Card 
              sx={{  width: "96%", margin: "auto", marginTop: "-15px"}}
              onMouseEnter={() => {
                setActivityId(activity.id)
              }}
              onMouseLeave={() => {
                setActivityId(null)
              }}
            >
              <CardContent>
                <div style={{display: "flex", justifyContent: "space-between", marginBottom: "-15px", marginTop: "-10px"}}>
                  <Typography sx={{ fontSize: 12 }} color="text.secondary" gutterBottom>
                    {moment(activity.created_at).format("MMMM Do YYYY")}
                  </Typography>

                  <IconButton 
                    style={{marginLeft: "50%"}}
                    aria-label="settings"
                    id="basic-button"
                    aria-controls={open ? 'basic-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                  >
                    <MoreVert />
                  </IconButton>

                  <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                      'aria-labelledby': 'basic-button',
                    }}
                  >
                    {
                      showTrash ? null : (
                        <>
                          <MenuItem onClick={showEditModal}> <EditOutlined /> Edit</MenuItem>
                          <MenuItem onClick={()=>cloneActivity(activity)} disabled={(activity.user_id !== user.id) && (activity.status === "private") }><CopyAllOutlined /> Clone</MenuItem>
                          <MenuItem onClick={()=>transferActivity(activity)} ><MoveUpOutlined /> Transfer</MenuItem>
                        </>
                      )
                    }

                    {
                      showTrash ? (
                        <MenuItem 
                          onClick={() => {
                            setRestoreMode(true)
                            setOpenDialog(true)
                          }}
                        >
                          <RestoreFromTrash /> Restore
                        </MenuItem>
                      ) : null
                    }
                  
                    <MenuItem onClick={handleClickOpen}><DeleteOutlined /> Delete</MenuItem>

                    {
                      showTrash ? null : (
                       <MenuItem onClick={() => navigate(`/activities/${activity.id}`)}><ViewListOutlined /> View</MenuItem>
                      )
                    }
                    
                  </Menu>


                  {
                      (activityId === activity.id || activityIds.includes(activity.id)) && (
                      <Checkbox
                        size="small"
                        checked={activityIds.includes(activity.id)}
                        onChange={(e,f) => {
                          if(f) {
                            dispatch(addActivityId({id: activity.id}))
                          } else {
                            dispatch(removeActivityId({id: activity.id}))
                          }
                        }}
                        inputProps={{ 'aria-label': 'controlled' }}
                      />
                    )
                  }
                </div>
              
                <Typography sx={{ mb: -0.5 }} color="text.primary">
                  <b>{activity.label}</b>
                  {
                    activityId === activity.id && showCloningNotification ? (
                      <span style={{marginLeft: "20px", fontSize: "13px", color: "green" }}>Cloning...</span>
                    ) : null
                  }
                </Typography>
                <div style={{display: "flex", justifyContent: "space-between"}}>
                  <Typography variant="body2">
                    {activity.description}
                  </Typography>
                  {showIcon(activity.type)}
                </div>

                <div 
                  style={{
                    display: "flex", 
                    justifyContent: "space-between", 
                    marginBottom: Boolean(activity.decreased_probability) ||  
                                  ( activity.decreased_probability !== null && !Boolean(activity.decreased_probability) ) ||
                                  (activity.decreased_probability === null && activity.probability !== "Closed")
                                   ? "-18px" : null}}
                >
                  <Typography sx={{ fontSize: 14, mb: -2, color: "blue" }} >
                      ${activity.total}
                  </Typography>

                  {
                    Boolean(activity.decreased_probability)  && (
                      <Tooltip title='Decreased Probability'>
                        <ArrowDownwardOutlined sx={{color: "red"}} />
                      </Tooltip>
                    )
                  }

                  {
                    (activity.decreased_probability !== null && !Boolean(activity.decreased_probability) ) && (
                      <Tooltip title='Increadsed Probability'>
                        <ArrowUpwardOutlined sx={{color: "green"}} />
                      </Tooltip>
                    )
                  }

                  {
                     (activity.decreased_probability === null && activity.probability !== "Closed") && (
                        <Chip label="New" color="primary"  size="small"/>
                     )
                  }
                
                </div>
              </CardContent>
            </Card>
            <br></br>
          </div>
        )}
      </Draggable>

      <ActivityModal
       open={openModal}
       setOpen={setOpenModal}
       editMode={true}
       activity={activity}
      />

      <ActivityTransferModal
        open={openTransferModal}
        setOpen={setOpenTransferModal}
        activity={activityObj}
        socket={socket} 
        mode="single"
      />

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {restoreMode ? "Restore" : "Delete"} Activity
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to {restoreMode ? "restore" : "delete"} this activity ?
          </DialogContentText>

          <DialogContentText id="alert-dialog-description" sx={{textAlign: "center", color: "red"}}>
            {
              showDeleteNotification ? "Please wait...." : null
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>No</Button>
          <Button 
            onClick={(e) => {
              if(restoreMode) {
                restoreActivity(activity.id)
              } else {
                deleteActivity(activity.id, e)
              }
            
            }} 
            autoFocus
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={severity} sx={{ width: '100%' }}>
          {text}
        </Alert>
      </Snackbar>
    </>
  )
}

export default ActivityItem