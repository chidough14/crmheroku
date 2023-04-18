import { Box, Button, InputLabel, Modal, Select, TextField, Typography, MenuItem, Snackbar, OutlinedInput, Switch, FormControlLabel, Chip } from '@mui/material'
import MuiAlert from '@mui/material/Alert';
import { useFormik } from 'formik';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';
import moment from 'moment';
import instance from '../../services/fetchApi';
import { addEvent } from '../../features/EventSlice';
import { CloseOutlined } from '@mui/icons-material';
import { addEventToActivity } from '../../features/ActivitySlice';
import { addMeeting } from '../../features/MeetingSlice';

import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';


const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
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

const generateMeetingId = () => {
  let meetingID = "";
  const chars = "12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP";
  const maxPos = chars.length;

  for (let i = 0; i < 8; i++) {
    meetingID += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return meetingID;
}

const EventModal = ({ open, setOpen, startTime, endTime, activities, user, activityId, socket}) => {
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [severity, setSeverity] = useState("");
  const [showActivitySelect, setShowActivitySelect] = useState(false);

  const [oneOnOne, setOneOnOne] = useState(false);
  const [conference, setConference] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [usersValue, setUsersValue] = useState([]);
  const [usersValueSingle, setUsersValueSingle] = useState("");
  const [size, setSize] = useState(1);
  const [anyoneCanJoin, setAnyoneCanJoin] = useState(false);

  const handleClose = () => {
    setOpen(false);
    setOneOnOne(false)
    setConference(false)
    setUsersValue([])
    setUsersValueSingle("")
    setSize(1)
  }
  const dispatch = useDispatch()

  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenAlert(false);
  };

  const showAlert = (msg, sev) => {
    setOpenAlert(true)
    setAlertMessage(msg)
    setSeverity(sev)
  }


  useEffect(() => {
   if (startTime) {
    formik.setFieldValue('start', startTime)
    formik.setFieldValue('end', endTime)
   }
  }, [open,startTime, endTime])

  useEffect(() => {
    if (activityId) {
      formik.setFieldValue('activity', activityId)
      // formik.setFieldValue('start', "")
      // formik.setFieldValue('end', "")
    }
   }, [open, activityId])

   const createMeeting = async (body) => {
    let response 
     await instance.post(`meetings`, body)
     .then((res) => {
       dispatch(addMeeting({meeting: res.data.meeting}))
       response = res.data.meeting

       if (body.invitedUsers.length) {
          for (let i=0; i<body.invitedUsers.length; i++) {
            let xx = allUsers.find((a) => a.email === body.invitedUsers[i])
            socket.emit('sendNotification', { recipientId: xx.id, message: "You have been invited to a meeting" });
          }
       } else {
         socket.emit('sendConferenceNotification', { message: "You have been invited to a meeting" });
       }

      
     })
     .catch(()=> {
      showAlert("Ooops an error was encountered", "error")
     })

     return response
   }

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      start: moment().format(),
      end: moment().add(30, 'minutes').format(),
      activity: undefined,
      meetingName: '',
      maxUsers: 1
    },
    validationSchema: validationSchema,
    onSubmit: async (values, {resetForm}) => {
      let body = {
        ...values,
        user_id: user.id,
        activity_id: values.activity ? values.activity : null,
        start: moment(values.start).format(),
        end: moment(values.end).format()
      }

      await instance.post(`events`, body)
      .then((res) => {
        if (activityId) {
          dispatch(addEventToActivity({event: res.data.event}))
        }

        if (oneOnOne) {

          let meetingBody = {
            user_id: user.id,
            meetingName: values.meetingName,
            meetingId: generateMeetingId(),
            meetingType: '1-on-1',
            invitedUsers: [usersValueSingle],
            meetingDate: moment(values.start).format("L"),
            maxUsers: 1,
            status: true,
            event_id: res.data.event.id
          }

          createMeeting(meetingBody)

          //  socket.emit('sendNotification', { recipientId: receiverId, message: values.message });

          showAlert("Event created successfully", "success")
          dispatch(addEvent({event: res.data.event}))
          handleClose()
          resetForm();
        } else if (conference) {
          let meetingBody = {
            user_id: user.id,
            meetingName: values.meetingName,
            meetingId: generateMeetingId(),
            meetingType: anyoneCanJoin ? 'Anyone-can-join' : 'Conference',
            invitedUsers: anyoneCanJoin ? [] : usersValue,
            meetingDate: moment(values.start).format("L"),
            maxUsers: anyoneCanJoin ? size : usersValue.length,
            status: true,
            event_id: res.data.event.id
          }

          createMeeting(meetingBody)

          showAlert("Event created successfully", "success")
          dispatch(addEvent({event: res.data.event}))
          handleClose()
          resetForm();

        } else {
          showAlert("Event created successfully", "success")
          dispatch(addEvent({event: res.data.event}))
          handleClose()
          resetForm();
        }
      
      })
      .catch(()=> {
        showAlert("Ooops an error was encountered", "error")
      });
    },
  });

  const handleDateChange = (e) => {
    formik.setFieldValue('start', e)
  }

  const handleEndDateChange = (e) => {
    formik.setFieldValue('end', e)
  }

  const fetchUsers = async (e) => {
    e.preventDefault()
    await instance.get(`users`)
    .then((res) => {
      setAllUsers(res.data.users)
    })
  }

  const handleChangeValueSingle =  (event) => {
   
    setUsersValueSingle(event.target.value)
  }

  const handleChangeValue =  (event) => {
    const {
      target: { value },
    } = event;
    // let value = JSON.parse(event.target.value).id
   
    setUsersValue(typeof value === 'string' ? value.split(',') : value)
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
          <form onSubmit={formik.handleSubmit}>
            <Typography variant='h6' style={{marginBottom: "10px"}}>
            Add Event
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


            {
              showActivitySelect ? (
                <Button variant="text" onClick={() => setShowActivitySelect(false)}>Hide</Button>
              ) : (
                <Button variant="text" size='small' disabled={activityId} onClick={() => setShowActivitySelect(true)}>Link to Activity</Button>
              )
            }

            {
              showActivitySelect && (
                <>
                  <InputLabel id="demo-select-small">Related Activity</InputLabel>
                  <Select
                    id='activity'
                    name="activity"
                    label="Related Activity"
                    size='small'
                    fullWidth
                    value={formik.values.activity}
                    onChange={formik.handleChange}
                  >
                    {
                      activities.map((a, i) => (
                        <MenuItem value={a.id} key={i}>{a.label}</MenuItem>
                      ))
                    }
                  </Select>
                  <p></p>
                </>
              )
            }

            <div style={{display: "flex", justifyContent: "space-between"}}>
              <Button 
                size='small' 
                onClick={(e) => {
                  setOneOnOne(true);
                  setConference(false)
                  fetchUsers(e)
                }}
                style={{border: oneOnOne ? "4px solid #EE82EE" : null }}
              >
                1 On-1Meeting
              </Button>

              <Button 
                size='small' 
                onClick={(e)=>{
                  setConference(true)
                  setOneOnOne(false);
                  fetchUsers(e)
                }}
                style={{border: conference ? "4px solid #EE82EE" : null }}
              >
                Conference
              </Button>
            </div>

            {
              oneOnOne &&
              <>
                <TextField
                  size='small'
                  fullWidth
                  id="meetingName"
                  name="meetingName"
                  label="meetingName"
                  value={formik.values.meetingName}
                  onChange={formik.handleChange}
                  error={formik.touched.meetingName && Boolean(formik.errors.meetingName)}
                  helperText={formik.touched.meetingName && formik.errors.meetingName}
                />
                <p></p>

                
                <InputLabel id="demo-select-small">Select User</InputLabel>
                <Select
                  name="user"
                  label="User"
                  size='small'
                  fullWidth
                  labelId="demo-multiple-name-label"
                  id="demo-multiple-name"
                  value={usersValueSingle}
                  onChange={handleChangeValueSingle}
                  input={<OutlinedInput label="Name" />}
                  //MenuProps={MenuProps}
                >
                  {
                    allUsers?.filter((a) => a.id !== user.id).map((a, i) => (
                      <MenuItem value={a.email} key={i}>{a.name}</MenuItem>
                    ))
                  }
                </Select>
                <p></p>
                

              </>
            }

            {
              conference && 
              <>
                <FormControlLabel
                  control={ 
                    <Switch
                      checked={anyoneCanJoin}
                      onChange={(event) => setAnyoneCanJoin(event.target.checked)}
                      inputProps={{ 'aria-label': 'controlled' }}
                    />
                  } 
                  label="Anyone can join" 
                />
                <p></p>

                <TextField
                  size='small'
                  fullWidth
                  id="meetingName"
                  name="meetingName"
                  label="Meeting Name"
                  value={formik.values.meetingName}
                  onChange={formik.handleChange}
                  error={formik.touched.meetingName && Boolean(formik.errors.meetingName)}
                  helperText={formik.touched.meetingName && formik.errors.meetingName}
                />
                <p></p>

                {
                  anyoneCanJoin ?
                  <>
                    <TextField 
                      type="number"
                      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}   
                      label="Size"
                      size='small'
                      fullWidth
                      value={size}
                      onChange={(e)=> setSize(parseInt(e.target.value))}
                    />
                    <p></p>
                  </> :
                  <>
                    <InputLabel id="demo-select-small">Select User</InputLabel>
                    <Select
                      name="user"
                      label="User"
                      size='small'
                      fullWidth
                      labelId="demo-multiple-name-label"
                      id="demo-multiple-name"
                      multiple
                      value={usersValue}
                      onChange={handleChangeValue}
                      input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} />
                          ))}
                        </Box>
                      )}
                      MenuProps={MenuProps}
                    >
                      {
                        allUsers?.filter((a) => a.id !== user.id).map((a, i) => (
                          <MenuItem value={a.email} key={i}>{a.name}</MenuItem>
                        ))
                      }
                    </Select>
                    <p></p>
                  </>
                }
                

              </>
            }


              <p></p>
            <div style={{display: "flex", justifyContent: "space-between"}}>
              <Button size='small' color="primary" variant="contained"  type="submit" style={{borderRadius: "30px"}}>
               Add
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

export default EventModal