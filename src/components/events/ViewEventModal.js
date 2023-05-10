import { Box, Button, InputLabel, Modal, Select, TextField, Typography, MenuItem, Snackbar, Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, CircularProgress } from '@mui/material'
import MuiAlert from '@mui/material/Alert';
import { useFormik } from 'formik';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';
import moment from 'moment';
import instance from '../../services/fetchApi';
import { deleteEvent, setShowDeletingNotification, setShowSendingSpinner, updateEvent } from '../../features/EventSlice';
import { CloseOutlined, DeleteOutlined, EditOutlined } from '@mui/icons-material';
import { updateActivityEvent } from '../../features/ActivitySlice';
import { Link } from 'react-router-dom';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 440,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const validationSchema = yup.object({
  title: yup
    .string('Enter your title')
    .required('Title is required'),
  description: yup
    .string('Enter your description')
    .required('Description is required'),
  start: yup
    .string('Enter your start time')
    .required('Start time is required'),
  end: yup
    .string('Enter your end time')
    .required('End time is required'),
});

const ViewEventModal = ({ open, setOpen, event, relatedActivity, showForm, dashboard }) => {
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [severity, setSeverity] = useState("");
  const [showActivitySelect, setShowActivitySelect] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const user = useSelector(state=> state.user)
  const { showSendingSpinner, showDeletingNotification } = useSelector(state => state.event)
  const dispatch = useDispatch()

  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenAlert(false);
  };
  useEffect(() => {
    if (showForm && event) {
      editEvent(event)
    }
 
  }, [open, event])

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const showAlert = (msg, sev) => {
    setOpenAlert(true)
    setAlertMessage(msg)
    setSeverity(sev)
  }

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      start: "",
      end: ""
    },
    validationSchema: validationSchema,
    onSubmit: async (values, {resetForm}) => {
      dispatch(setShowSendingSpinner({showSendingSpinner: true}))

      let body = {
        ...values,
        start: moment(values.start).format(),
        end: moment(values.end).format()
      }

      await instance.patch(`events/${event.id}`, body)
      .then((res) => {
        if (showForm) {
          dispatch(updateActivityEvent({event: res.data.event}))
        }

        showAlert("Event updated successfully", "success")
        dispatch(updateEvent({event: res.data.event}))
        handleClose()
        resetForm();
        dispatch(setShowSendingSpinner({showSendingSpinner: false}))
      })
      .catch(() => {
        showAlert("Ooops an error was encountered", "error")
        dispatch(setShowSendingSpinner({showSendingSpinner: false}))
      })
    },
  });

  const handleClose = () => {
    setOpen(false)
    setShowEditForm(false)
  }

  const handleDateChange = (e) => {
    formik.setFieldValue('start', e)
  }

  const handleEndDateChange = (e) => {
    formik.setFieldValue('end', e)
  }

  const editEvent = (event) => {
    setShowEditForm(true)

    formik.setFieldValue('title', event.title)
    formik.setFieldValue('description', event.description)
    formik.setFieldValue('start', event.start)
    formik.setFieldValue('end', event.end)
  }

  const removeEvent = async (event) => {
    dispatch(setShowDeletingNotification({showDeletingNotification: true}))

    await instance.delete(`events/${event.id}`)
    .then((res)=> {
      showAlert("Event deleted successfully", "success")
      dispatch(deleteEvent({eventId: event.id}))
      setOpenDialog(false)
      handleClose()
      dispatch(setShowDeletingNotification({showDeletingNotification: false}))
    })
    .catch(() => {
      showAlert("Ooops an error was encountered", "error")
      dispatch(setShowDeletingNotification({showDeletingNotification: false}))
    })
  };

  const showButtonContent = (text) => {
    if (showSendingSpinner) {
      return (
        <Box sx={{ display: 'flex' }}>
          <CircularProgress size={24} color="inherit" />
        </Box>
      )
    } else {
      return text
    }
  }

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        >
        <Box sx={style}>

          {
            showEditForm ? (
              <form onSubmit={formik.handleSubmit}>
                <Typography variant='h6' style={{marginBottom: "10px"}}>
                Edit Event
                </Typography>
                <TextField
                  required
                  size='small'
                  fullWidth
                  id="title"
                  name="title"
                  label="Title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                />
                <p></p>
                <TextField
                  required
                  size='small'
                  fullWidth
                  id="description"
                  name="description"
                  label="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />


                <LocalizationProvider dateAdapter={AdapterMoment}>
                  <DateTimePicker
                    renderInput={(props) => (
                      <TextField
                        error={Boolean(formik.touched.start && formik.errors.start)}
                        helperText={formik.touched.start && formik.errors.start}
                        label="Start"
                        size='small'
                        margin="normal"
                        name="start"
                        variant="standard"
                        fullWidth
                        {...props}
                        />
                    )}
                    label="Start"
                    value={formik.values.start}
                    onChange={handleDateChange}
                  />

                  <DateTimePicker
                    renderInput={(props) => (
                      <TextField
                        error={Boolean(formik.touched.end && formik.errors.end)}
                        helperText={formik.touched.end && formik.errors.end}
                        label="End"
                        margin="normal"
                        size='small'
                        name="end"
                        variant="standard"
                        fullWidth
                        {...props}
                        />
                    )}
                    label="End"
                    value={formik.values.end}
                    onChange={handleEndDateChange}
                  />
                </LocalizationProvider>
                
                <div style={{display: "flex", justifyContent: "space-between"}}>
                  <Button size='small' color="primary" variant="contained"  type="submit" style={{borderRadius: "30px"}}>
                    { showButtonContent("Save") }
                  </Button>
    
                  <Button 
                    size='small' 
                    color="error" 
                    variant="contained" 
                    onClick={() => {
                      handleClose()
                      formik.resetForm()
                    }}
                    style={{borderRadius: "30px"}}
                  >
                    Cancel
                  </Button>
                </div>
              
              </form>
            ) : (
              <>
              {
                (!dashboard && (event?.user_id === user?.id)) && (
                  <div style={{display: "flex", float: "right"}}>
                    <Tooltip title="Edit" placement="top">
                      <EditOutlined
                        onClick={() => editEvent(event)}
                        style={{cursor: "pointer"}}
                      />
                    </Tooltip>
    
                    <Tooltip title="Delete" placement="top">
                      <DeleteOutlined
                        onClick={() => setOpenDialog(true)}
                        style={{cursor: "pointer"}}
                      />
                    </Tooltip>
                  </div>
                )
              }
             
              <Typography variant="h7" display="block"  gutterBottom>
                <b>Title</b> : {event?.title}
              </Typography>

              <Typography variant="h7" display="block"  gutterBottom>
                <b>Description</b> : {event?.description}
              </Typography>

              <Typography variant="h7" display="block"  gutterBottom>
                <b>Start</b> : {moment(event?.start).format("dddd, MMMM Do YYYY, h:mm:ss a")}  
              </Typography>

              <Typography variant="h7" display="block"  gutterBottom>
                <b>End</b> : {moment(event?.end).format("dddd, MMMM Do YYYY, h:mm:ss a")}  
              </Typography>

              {
                //  (event?.meeting && moment().isBetween(event?.start, event?.end, 'milliseconds', null)) &&
                event?.meeting &&
                <Typography variant="h7" display="block"  gutterBottom>
                  <Link 
                    onClick={()=> {
                      let userDetails = {
                        id: user.id,
                        email: user.email
                      }

                      localStorage.setItem("userDetails", JSON.stringify(userDetails))
                    }}
                    to={`/join/${event?.meeting.meetingId}/`}
                    target="_blank"
                  >
                   <b>Meeting Link</b>
                  </Link>
                </Typography>
              }
           

              {
                relatedActivity && (
                  <Typography variant="h7" display="block"  gutterBottom>
                    <b>Related Activity</b> : {relatedActivity?.label}  
                  </Typography>
                )
              }

              <div style={{display: "flex", float: "right"}}>

                <Button 
                  size='small' 
                  color="error" 
                  variant="contained" 
                  onClick={() => {
                    handleClose()
                  }}
                  style={{borderRadius: "30px"}}
                >
                  Close
                </Button>
              </div>
              </>
            )

          }
         
         <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              Delete Event
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Are you sure you want to delete this list ?
              </DialogContentText>

              <DialogContentText id="alert-dialog-description" sx={{textAlign: "center", color: "red"}}>
                {
                  showDeletingNotification ? "Deleting..." : null
                }
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>No</Button>
              <Button onClick={() => removeEvent(event)} autoFocus>
                Yes
              </Button>
            </DialogActions>
          </Dialog>
         

         
        </Box>
      </Modal>

      <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={severity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
  )
}

export default ViewEventModal