import { AddOutlined, CancelOutlined, DeleteOutlined, EditOutlined, InfoOutlined } from '@mui/icons-material'
import { Button, IconButton, InputAdornment, MenuItem, Select, TextField, Tooltip, Typography } from '@mui/material'
import React, { useEffect, useReducer, useRef, useState } from 'react'
import {useNavigate } from 'react-router-dom'
import ActivityEventsTable from './ActivityEventsTable'
import Comments from '../comments/Comments'
import { useDispatch, useSelector } from 'react-redux'
import instance from '../../services/fetchApi'
import deltaToString from "delta-to-string-converter"
import { editActivity, setCommentSortOption, setSingleActivity } from '../../features/ActivitySlice'
import SortButton from '../orders/SortButton'

const DetailsPage = ({
  activity,
  events,
  editEvent,
  deleteEvent,
  user,
  setOpenAddEventModal,
  setOpenDialogDeleteActivity,
  setOpenEditModal,
  socket,
  params,
  userCount
}) => {
  const navigate = useNavigate()
  const { exchangeRates, setting, id } = useSelector(state => state.user)
  const { commentSortOption } = useSelector(state => state.activity)
  const [currencySymbol, setCurrencySymbol] =  useState("$")
  const [isEditing, setEditing] = useState(false);
  const [sending, setSending] = useState(false);
  const [timer, setTimer] = useState(null);
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [severity, setSeverity] = useState("");
  const [rowsToOpen, setRowsToOpen] = useState([]);
  const dispatch = useDispatch()
  const latestTypeRef = useRef(null);
  const latestValueRef = useRef(null);
  const latestChangesRef = useRef({});
  const arrayRef = useRef(null);

  const initialState = {
    label: "",
    description: "",
    assignedTo: "",
    earningEstimate: 0,
    type: "",
    probability: ""
  };

  const [data, updateData] = useReducer(
    (state, updates) => ({ ...state, ...updates }),
    initialState
  );

  const handleEditClick = () => {
    setEditing(true);
  };

  const isValidJson = (string) => {
    try {
      JSON.parse(string)
      return true
    } catch (error) {
      return false
    }
  }

  const addMessage  = async (arr) => {

    await instance.post(`add-message-for-offline-followers`, {arr})
    .then((res) => {
      
    })
    .catch(() => {
    
    })
  }

  const showAlert = (msg, sev) => {
    setOpenAlert(true)
    setAlertMessage(msg)
    setSeverity(sev)
  }

  const sendNotificationToFollowers  = (activity, msg, event) => {
    let onlineUsersIds = user?.onlineUsers?.map((a) => a.userId)
    let offlineIds = []

    for (let i = 0; i < user?.usersFollowers.length; i++) {
      if (onlineUsersIds.includes(user?.usersFollowers[i].follower_id)) {
        socket.emit(event, { 
          follower_id: user?.usersFollowers[i].follower_id, 
          message: msg, 
          sender_id: user?.id,
          activityId: activity.id 
        });
      } else {
        offlineIds = [...offlineIds, {id: user?.usersFollowers[i].follower_id, message: msg}]
      }
  
    }

    if (offlineIds?.length) {
      addMessage(offlineIds)
    }
   
  }

  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [timer]);

  useEffect(() => {
    arrayRef.current = rowsToOpen;
  }, [rowsToOpen]);


  const handleSave = async () => {
    const type = latestTypeRef.current;
    const value = latestValueRef.current;

    const changes = latestChangesRef.current;

    if (arrayRef.current.includes(type)) {
      setSending(true)

      // await instance.patch(`activities/${activity.id}`, {[type] : value})
      await instance.patch(`activities/${activity.id}`, changes)
      .then((res) => {

        sendNotificationToFollowers(res.data.activity, `${user?.name} edited ${activity.label}`, "activity_edited")

        socket.emit("editedAct", { 
          message: "Activity edited", 
          sender_id: user?.id,
          activityId: activity.id 
        })

        // showAlert("Activity updated successfully", "success")

        const updatedActivity = {
          ...res.data.activity,
          comments: res.data.activity.comments.map((a) => ({
            ...a,
            content: isValidJson(a.content) ? deltaToString(JSON.parse(a.content).ops) : a.content
          }))
        };
    
        dispatch(editActivity({ activity: updatedActivity }));
        dispatch(setSingleActivity({ activity: updatedActivity }));
   
        setSending(false)
        // setRowsToOpen((prevRows) => prevRows.filter((a) => a !== type));
      
        Object.keys(changes).forEach((key) => {
          // Perform an operation on each key
          setRowsToOpen((prevRows) => prevRows.filter((a) => a !== key));
        });

        let symbol = "$";

        if (setting?.currency_mode === "EUR") {
          symbol = "€";
        } else if (setting?.currency_mode === "GBP") {
          symbol = "£";
        }

        setCurrencySymbol(symbol)
      })
      .catch((e)=> {
        // showAlert("Ooops an error was encountered", "error")
        // dispatch(setShowSendingSpinner({showSendingSpinner: false}))
      })

      latestChangesRef.current = {};
    }
    
  };

  const handleCancel = (txt, type) => {
    updateData({
      [type]: txt
    })

    setRowsToOpen((prevRows) => prevRows.filter((a) => a !== type));
  };

  const handleChange = (event, type) => {
    updateData({
      [type]: event.target.value
    });

    latestTypeRef.current = type;
    latestValueRef.current = event.target.value;
    
    latestChangesRef.current[type] = event.target.value;

    if (timer) {
      clearTimeout(timer);
    }

    // Set a new timer to call the save function after 3 seconds
    setTimer(setTimeout(() => {
      handleSave();
    }, 3000));
  };

  useEffect(() => {
    let symbol = "$"; // Default currency symbol

    if (setting?.currency_mode === "EUR") {
      symbol = "€";
    } else if (setting?.currency_mode === "GBP") {
      symbol = "£";
    }

    setCurrencySymbol(symbol);
  }, [setting, exchangeRates]);

  useEffect(() => {
    // Clear the timer when the component unmounts
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [timer]);


  const renderDropDowns = (value, type, activityUserId) => {
    return (
      <>
        {(rowsToOpen.includes(type)) ? (
          <>
            {
               type === "type" ? (
                <Select
                  required
                  id='type'
                  name="type"
                  label="Type"
                  size='small'
                  style={{
                    width: "200px",
                    height: "35px"
                  }}
                  value={data[type]}
                  onChange={(e) => {
                    handleChange(e, type)
                  }}
                >
                  <MenuItem value="Call">Call</MenuItem>
                  <MenuItem value="Email">Email</MenuItem>
                  <MenuItem value="Meeting">Meeting</MenuItem>
                
                </Select>
               ) : (
                <Select
                  required
                  id='type'
                  name="type"
                  label="Type"
                  size='small'
                  style={{
                    width: "200px",
                    height: "35px"
                  }}
                  value={data[type]}
                  onChange={(e) => {
                    handleChange(e, type)
                  }}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                
                </Select>
               )
            }
          
            <IconButton 
              onMouseDown={(e) => {
                e.stopPropagation()
                e.preventDefault();
                handleCancel(value, type)
              }}
            >
              <CancelOutlined />
            </IconButton>
          </>
        ) : (
          <span>
            {value}

            {
              activityUserId === id ? (
                <IconButton 
                  onClick={() => {
                    updateData({
                      [type]: value,
                    })
    
                    setRowsToOpen(prev => [...prev, type])
                  }}
                >
                  <EditOutlined />
                </IconButton>
              ) : null
            }
         
          </span>
        )}
      </>
    );
  }
  
  const renderEditableField = (value, type, originalValue, onEditClick, onCancelClick) => (
    <>
      <TextField
        value={value}
        onChange={(e) => handleChange(e, type)}
        autoFocus
        InputProps={{
          style: {
            height: "35px"
          }
        }}
      />

      <Tooltip placement='top' title="Estimates is entered in USD">
        <InfoOutlined sx={{fontSize: "16px", marginLeft: "10px"}} />
      </Tooltip>

      <IconButton
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onCancelClick(originalValue, type);
        }}
      >
        <CancelOutlined />
      </IconButton>
    </>
  );
  
  const renderNonEditableField = (value, type, userId, onEditClick) => (
    <span>
      {value}

      {
        userId === id ? (
          <IconButton
            onClick={() => {
              onEditClick(value, type);
              setRowsToOpen((prev) => [...prev, type]);
            }}
          >
            <EditOutlined />
          </IconButton>
        ) : null
      }
    
    </span>
  );
  
  const renderTextField = (txt, type, activityUserId) => {
    return (
      <>
        {rowsToOpen.includes(type)
          ? renderEditableField(data[type], type, txt, handleSave, handleCancel)
          : renderNonEditableField(txt, type, activityUserId, (newValue, newType) => {
              updateData({ [newType]: newValue });
              setCurrencySymbol("$"); // Assuming this is common for both cases
            })}
      </>
    );
  };
  
  const renderEarningEstimates = (est, type, activityUserId) => {
    let originalEstimate = est;
  
    if (setting?.currency_mode !== "USD" && setting?.currency_mode !== null) {
      let res = est * exchangeRates[setting?.currency_mode];
      est = res.toFixed(2);
    }
  
    return (
      <>
        {rowsToOpen.includes(type)
          ? renderEditableField(data[type], type, originalEstimate, handleSave, handleCancel)
          : renderNonEditableField(est, type, activityUserId, (newValue, newType) => {
              setCurrencySymbol("$");
              updateData({ earningEstimate: originalEstimate });
            })}
      </>
    );
  };

  const setSortOption = (value) => {
    dispatch(setCommentSortOption({sortOption: value}))
  }
  

  return (
    <>
      <div style={{display: "flex", justifyContent: "space-between", marginBottom: "20px"}}>
        <div>

          <Typography variant="h7" display="block"  gutterBottom  style={{ marginBottom: activity?.user_id === id ? "-5px" : null}}>
            <b>Label</b> : { renderTextField(activity?.label, "label", activity?.user_id) }
          </Typography>

          <Typography variant="h7" display="block"  gutterBottom  style={{ marginBottom: activity?.user_id === id ? "-5px" : null}}>
            <b>Description</b> : 
            { renderTextField(activity?.description, "description", activity?.user_id) }
          </Typography>

          <Typography variant="h7" display="block"  gutterBottom  style={{ marginBottom: activity?.user_id === id ? "-5px" : null}}>
            <b>Assignee</b> : 
            { renderTextField(activity?.assignedTo, "assignedTo", activity?.user_id) }
          </Typography>

          <Typography variant="h7" display="block"  gutterBottom style={{ marginBottom: activity?.user_id === id ? "-5px" : null}}>
            <b>Type</b> : 
            {renderDropDowns(activity?.type, "type", activity?.user_id)}
          </Typography>

          <Typography variant="h7" display="block"  gutterBottom style={{ marginBottom: activity?.user_id === id ? "-5px" : null}}>

            <b>Estimate</b> : { currencySymbol }{ renderEarningEstimates(activity?.earningEstimate, "earningEstimate", activity?.user_id) }
          </Typography>

          <Typography variant="h7" display="block"  gutterBottom style={{ marginBottom: activity?.user_id === id ? "-5px" : null}}>
            <b>Probability</b> : 
            {renderDropDowns(activity?.probability, "probability", activity?.user_id)}
          </Typography>

          <Typography variant="h7" display="block"  gutterBottom style={{ marginBottom: activity?.user_id === id ? "-5px" : null}}>
            <b>Company</b> : 
            <Button style={{borderRadius: "30px"}} onClick={() => navigate(`/companies/${activity?.company?.id}`)}>
              {activity?.company?.name}
            </Button>
          </Typography>

          {/* <Button 
            disabled={activity?.user_id !== user?.id} 
            variant="contained" 
            size='small' 
            onClick={() => setOpenEditModal(true)} 
            style={{borderRadius: "30px"}}
          >
            <EditOutlined />
          </Button>&nbsp;&nbsp;&nbsp; */}

          <Button 
            disabled={activity?.user_id !== user?.id}  
            variant="contained" 
            color='error' 
            size='small' 
            onClick={()=> setOpenDialogDeleteActivity(true)} 
            style={{borderRadius: "30px"}}
          >
            <DeleteOutlined /> 
          </Button>&nbsp;&nbsp;&nbsp;


          {
            sending ? (
              <span style={{fontSize: "13px", color: "green"}}>Saving ....</span>
            ) : null
          }
        </div>

        <div style={{ width: "60%"}}>
          <span>{userCount} {userCount > 1 ? "people" : "person"} viewing</span>

          <div style={{display: "flex", justifyContent: "space-between"}}>
            <Typography variant='h6'  component="div" sx={{ flexGrow: 2 }}><b>Upcoming Events</b></Typography>
            <Button 
              variant="contained" 
              size='small' 
              onClick={() => setOpenAddEventModal(true)} 
              style={{borderRadius: "30px"}} 
              disabled={activity?.user_id !== user?.id}
            >
              <AddOutlined />
            </Button>
          </div>

          <ActivityEventsTable
            events={events}
            editEvent={editEvent}
            deleteEvent={deleteEvent}
            activity={activity}
            user={user}
          />
        </div>
      </div>

      <div>
        <div style={{display: "flex", justifyContent: "space-between"}}>
          <Typography variant='h6'>
            Comments &nbsp; &nbsp;
            {
              `(${activity?.comments?.length})`
            }
          </Typography>

          <SortButton 
            setSortOption={setSortOption} 
            sortOption={commentSortOption}  
            // closeSearch={closeSearch} 
            title="Sort Comments" 
          />
        </div>
      
        
        <Comments
          comments={activity?.comments}
          activityId={activity?.id}
          socket={socket}
          params={params}
        />
      </div>
    </>
  )
}

export default DetailsPage