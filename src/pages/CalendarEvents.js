import React, { useState, useCallback, useMemo, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Calendar,  DateLocalizer, momentLocalizer } from 'react-big-calendar'
import moment from 'moment';
import mnt from 'moment-timezone';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import "react-big-calendar/lib/css/react-big-calendar.css";
import {  Backdrop, Button, CircularProgress, Snackbar } from '@mui/material';
import instance from '../services/fetchApi.js';
import { useDispatch, useSelector } from 'react-redux';
import {  setEvents, setOpenMask, updateEvent } from '../features/EventSlice.js';
import EventModal from '../components/events/EventModal.js';
import ViewEventModal from '../components/events/ViewEventModal.js';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../services/LocalStorageService.js';
import "./event.css"
import MuiAlert from '@mui/material/Alert';


const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});


const DnDCalendar = withDragAndDrop(Calendar)
mnt.tz.setDefault('Africa/Lagos');
const localizer = momentLocalizer(mnt);

const CalendarEvents = ({socket}) => {
  const {events, openMask, reloadEvents} = useSelector(state => state.event)
  const [myEvents, setMyEvents] = useState([])
  const [open, setOpen] = useState(false);
  const [openViewEventModal, setOpenViewEventModal] = useState(false);
  const [eventObj, setEventObj] = useState(undefined);
  const [startTime, setStartTime] = useState()
  const [endTime, setEndTime] = useState()
  const [openAlert, setOpenAlert] = useState(false);
  const [severity, setSeverity] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const dispatch = useDispatch()
  const { activities } = useSelector((state) => state.activity) 
  const user = useSelector((state) => state.user)
  
  const token = getToken()
  const navigate = useNavigate()

  const showAlert = (msg, sev) => {
    setOpenAlert(true)
    setAlertMessage(msg)
    setSeverity(sev)
  }

  useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [token])

  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenAlert(false);
  };

  const handleSelectSlot = useCallback(
    ({ start, end }) => {

      setOpen(true)
      setStartTime(start)
      setEndTime(end)
    },
    [setStartTime, setEndTime, setOpen]
  )

  const getEventsResult = async () => {
    dispatch(setOpenMask({openMask: true}))

    await instance.get(`events`)
    .then((res)=> {
      dispatch(setOpenMask({openMask: false}))
      dispatch(setEvents({events: res.data.events}))
    })
    .catch((err)=> {
      showAlert("An error was encountered", "error")
      dispatch(setOpenMask({openMask: false}))
    })
  }

  // useEffect(()=> {
  //   getEventsResult()
  // }, [])

  useEffect(()=> {
    getEventsResult()
  }, [reloadEvents])

  
  useEffect(()=> {
    let eventItems = events.map((a) => {
      return {
        ...a,
        start : moment(a.start).toDate(),
        end : moment(a.end).toDate()
      }
    })

    setMyEvents(eventItems)
  }, [events])

  const handleSelectEvent = useCallback(
    (event) => {
     setOpenViewEventModal(true)
     setEventObj(event)
    }, [setOpenViewEventModal, setEventObj]
  )

  const { defaultDate, scrollToTime } = useMemo(
    () => ({
      defaultDate: new Date(),
      scrollToTime: new Date(1970, 1, 1, 6),
    }),
    []
  )

  const updateCalendarEvent = async (e) => {
    const body = {
      start: moment(e.start).format(),
      end: moment(e.end).format()
    }

    dispatch(updateEvent({event: {
      ...e.event,
      start: moment(e.start).format(),
      end: moment(e.end).format()
    }}))

    await instance.patch(`events/${e.event.id}`, body)
    .then((res) => {

      if (res.data.event.meeting) {
        let msg = `Your meeting ${res.data.event.meeting.meetingName} has been changed. The new time is ${moment(res.data.event.start).format('MMMM Do YYYY, h:mm a')}-D`

        if (res.data.event.meeting.invitedUsers.length) {
          let invitedUsersArray = res.data.event.meeting.invitedUsers
          for (let i=0; i<invitedUsersArray.length; i++) {
            let xx = user?.allUsers.find((a) => a.email === invitedUsersArray[i])
            socket.emit('sendNotification', { recipientId: xx.id, message: msg });
          }
        }

        if (res.data.event.meeting.meetingType === "Anyone-can-join") {
          socket.emit('sendConferenceNotification', { message: msg, userId: res.data.event.user_id });
        }
       
      }

      showAlert("Event updated successfully", "success")
    })
    .catch((err)=> {
      showAlert("An error was encountered", "error")
    })
  }

  const userOwnsEvent = (event) => {
    if (event.user_id === user.id) {
      return true
    } else {
      return false
    }
  };

  return (
    <div style={{width: "100%"}}>
      <DnDCalendar
        defaultDate={defaultDate}
        defaultView={user?.setting?.calendar_mode}
        events={myEvents}
        localizer={localizer}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        scrollToTime={scrollToTime}
        eventPropGetter={
          (event, start, end, isSelected) => {
            let newStyle = {
              backgroundColor: "#DDA0DD",
              color: 'black',
              borderRadius: "0px",
              border: "none"
            };
      
            if (event.user_id !== user.id){
              newStyle.backgroundColor = "lightgreen"
            }
      
            return {
              className: "",
              style: newStyle
            };
          }
        }
        draggableAccessor={(event) => userOwnsEvent(event)}
        resizableAccessor={(event) => userOwnsEvent(event)}
        onDragStart={(e)=> {
          console.log("drag", e)
        }}
        onEventDrop={(e)=> updateCalendarEvent(e)}
        onEventResize={(e)=> updateCalendarEvent(e)}
      />

      <EventModal
        open={open}
        setOpen={setOpen}
        startTime={startTime}
        endTime={endTime}
        activities={activities.filter((a) => a.user_id === user.id)}
        user={user}
        socket={socket} 
      />

      <ViewEventModal
        open={openViewEventModal}
        setOpen={setOpenViewEventModal}
        event={eventObj}
        relatedActivity={activities.find((a) => a.id === eventObj?.activity_id)}
        socket={socket} 
      />

      <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={severity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={openMask}
      >
        <CircularProgress color="inherit" />
        <p style={{ color: "purple", marginLeft: "14px"}}>Loading Events</p>
      </Backdrop>
    </div>
       
  )
}

export default CalendarEvents

CalendarEvents.propTypes = {
  localizer: PropTypes.instanceOf(DateLocalizer),
}