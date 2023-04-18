import React from 'react'
import { Draggable } from 'react-beautiful-dnd'
import { IconButton, Menu, Typography, MenuItem, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Snackbar, Tooltip, Chip } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import moment from 'moment';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import ChatIcon from '@mui/icons-material/Chat';
import {  ArrowDownwardOutlined, ArrowUpwardOutlined, CopyAllOutlined, DeleteOutlined, EditOutlined, MoreVert, MoveUpOutlined, ViewListOutlined } from '@mui/icons-material';
import { useState } from 'react';
import ActivityModal from './ActivityModal';
import instance from '../../services/fetchApi';
import { addActivity, removeActivity } from '../../features/ActivitySlice';
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

const ActivityItem = ({activity, index, socket}) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [openModal, setOpenModal] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [text, setText] = useState("");
  const [severity, setSeverity] = useState("");
  const [openTransferModal, setOpenTransferModal] = useState(false);
  const [activityObj, setActivityObj] = useState();
  const handleOpen = () => setOpenModal(true);
  const user = useSelector(state => state.user)

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
  };
  const handleClose = () => {
    setAnchorEl(null);
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
  };

  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenAlert(false)
  };

  const deleteActivity = async (id, e) => {

    await instance.delete(`activities/${id}`)
    .then(() => {
      showAlert("Activity deleted", "success")
      handleCloseDialog()
      dispatch(removeActivity({activityId: id}))
      dispatch(deleteEvent({activityId: id}))
    })
    .catch(() => {
      showAlert("Ooops an error was encountered", "error")
    })
  };

  const cloneActivity = async (value) => {
    await instance.get(`activities/${value.id}/clone`)
    .then((res)=> {
      res.data.clonedActivity.decreased_probability = null
      res.data.clonedActivity.total = value.total
      dispatch(addActivity({activity: res.data.clonedActivity}))
   })
   .catch(() => {
      showAlert("Ooops an error was encountered", "error")
    })
  };

  const transferActivity =  (value) => {
    setOpenTransferModal(true)
    setActivityObj(value)
  };

  return (
    <>
      <Draggable draggableId={activity.id.toString()} index={index} key={activity.id.toString()} isDragDisabled={activity.probability === "Closed"}>
        {provided => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >

            <Card sx={{  width: "96%", margin: "auto", marginTop: "-15px"}}>
              <CardContent>
                <div style={{display: "flex", justifyContent: "space-between", marginBottom: "-15px", marginTop: "-10px"}}>
                  <Typography sx={{ fontSize: 12 }} color="text.secondary" gutterBottom>
                    {moment(activity.created_at).format("MMMM Do YYYY")}
                  </Typography>

                  <IconButton 
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
                    <MenuItem onClick={showEditModal}> <EditOutlined /> Edit</MenuItem>
                    <MenuItem onClick={()=>cloneActivity(activity)} disabled={(activity.user_id !== user.id) && (activity.status === "private") }><CopyAllOutlined /> Clone</MenuItem>
                    <MenuItem onClick={()=>transferActivity(activity)} ><MoveUpOutlined /> Transfer</MenuItem>
                    <MenuItem onClick={handleClickOpen}><DeleteOutlined /> Delete</MenuItem>
                    <MenuItem onClick={() => navigate(`/activities/${activity.id}`)}><ViewListOutlined /> View</MenuItem>
                  </Menu>
                </div>
              
                <Typography sx={{ mb: -0.5 }} color="text.primary">
                  <b>{activity.label}</b>
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
      />

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Delete Activity
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this activity ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>No</Button>
          <Button onClick={(e) => deleteActivity(activity.id, e)} autoFocus>
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