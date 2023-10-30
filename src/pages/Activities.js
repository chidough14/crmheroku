import { AddOutlined, ArrowDropDown, CopyAllOutlined, DeleteOutline, FolderDelete, InfoOutlined, MoveUpOutlined, Restore, RestorePage, SearchOutlined } from '@mui/icons-material'
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Menu, MenuItem, Snackbar, TextField, Toolbar, Tooltip, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import {DragDropContext} from 'react-beautiful-dnd'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import ActivityColumn from '../components/activities/ActivityColumn'
import ActivityModal from '../components/activities/ActivityModal'
import { 
  addActivity,
  addActivityIds, 
  editActivityProbability, 
  removeActivities, 
  removeActivityIds, 
  setActivities, 
  setFollowers, 
  setOpenPrompt, 
  setReloadActivities, 
  setShowCloningNotification, 
  setShowDeleteNotification, 
  setSortOptionValue, 
  setTrashActivities 
} from '../features/ActivitySlice'
import instance from '../services/fetchApi'
import { getToken } from '../services/LocalStorageService'
import SortButton from './orders/SortButton'
import MuiAlert from '@mui/material/Alert';
import ActivityTransferModal from '../components/activities/ActivityTransferModal'
import { deleteEvent } from '../features/EventSlice'
import { arraysHaveSameContents } from '../services/checkers';
import { setFollwers } from '../features/userSlice'


const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Activities = ({socket}) => {
  const [columns, setColumns] = useState([])
  const [activityId, setActivityId] = useState()
  const dispatch = useDispatch()
  const { 
    activities, 
    sortOption, 
    activityIds, 
    showCloningNotification, 
    showDeleteNotification, 
    trashActivities,
    followers,
    reloadActivities 
  } = useSelector((state) => state.activity) 
  const { id, name, usersFollowed, usersFollowers, onlineUsers, exchangeRates, setting } = useSelector(state => state.user)
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchData, setFetchData] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const handleOpen = () => setOpen(true);
  const navigate = useNavigate()
  const [openAlert, setOpenAlert] = useState(false);
  const [severity, setSeverity] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [showTrash, setShowTrash] = useState(false);
  const [restoreMode, setRestoreMode] = useState(false);
  const [openTransferModal, setOpenTransferModal] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState("$")

  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const showAlert = (msg, sev) => {
    setOpenAlert(true)
    setAlertMessage(msg)
    setSeverity(sev)
  }

  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenAlert(false);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setRestoreMode(false)

  }

  const token = getToken()

  const getFollowers = async () => {
    await instance.get(`followers`)
    .then((res) => {
      dispatch(setFollowers({followers: res.data.followers}))
      // from user slice
      dispatch(setFollwers({usersFollowers: res.data.followers}))
    })
    .catch(() => {
      
    })
  }

  const fetchActivities = async () => {
    await instance.get(`/activities`)
    .then((res) => {
      dispatch(setActivities({activities: res.data.activities}))
      dispatch(setReloadActivities({reloadActivities: false}))
    })
  }

  useEffect(() => {
    getFollowers()
  }, [followers?.length, usersFollowed?.length])

  useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [token])

  useEffect(() => {
    if (reloadActivities) {

      fetchActivities()
    }

  }, [reloadActivities])

  useEffect(() => {

    const obj = (act) => {
      if (setting?.currency_mode === "USD" || setting?.currency_mode === null)  {
        setCurrencySymbol("$")
        let cols  = {
          Low: {
            id: 'Low',
            list: act.filter((a) => a.probability === "Low"),
            total: act.filter((a) => a.probability === "Low").reduce((n, {total}) => n + total, 0) * 0.2,
          },
          Medium: {
            id: 'Medium',
            list: act.filter((a) => a.probability === "Medium"),
            total: act.filter((a) => a.probability === "Medium").reduce((n, {total}) => n + total, 0) * 0.4,
          },
          High: {
            id: 'High',
            list: act.filter((a) => a.probability === "High"),
            total: act.filter((a) => a.probability === "High").reduce((n, {total}) => n + total, 0) * 0.8,
          },
          Closed: {
            id: 'Closed',
            list: act.filter((a) => a.probability === "Closed"),
            total: act.filter((a) => a.probability === "Closed").reduce((n, {total}) => n + total, 0),
          },
        
        }

        return cols
      } else {
        if (setting?.currency_mode === "EUR") {
          setCurrencySymbol("€")
        }
  
        if (setting?.currency_mode === "GBP") {
          setCurrencySymbol("£")
        }

        let arr = act.map((a) => {
          return {
            ...a,
            total: parseFloat((a.total * exchangeRates[setting?.currency_mode]).toFixed(2))
          }
        })

        let cols  = {
          Low: {
            id: 'Low',
            list: arr.filter((a) => a.probability === "Low"),
            total: arr.filter((a) => a.probability === "Low").reduce((n, {total}) => n + total, 0) * 0.2,
          },
          Medium: {
            id: 'Medium',
            list: arr.filter((a) => a.probability === "Medium"),
            total: arr.filter((a) => a.probability === "Medium").reduce((n, {total}) => n + total, 0) * 0.4,
          },
          High: {
            id: 'High',
            list: arr.filter((a) => a.probability === "High"),
            total: arr.filter((a) => a.probability === "High").reduce((n, {total}) => n + total, 0) * 0.8,
          },
          Closed: {
            id: 'Closed',
            list: arr.filter((a) => a.probability === "Closed"),
            total: arr.filter((a) => a.probability === "Closed").reduce((n, {total}) => n + total, 0),
          },
        
        }

        return cols
      }
      
     
    }

    if (showTrash) {
      setColumns(obj(trashActivities))
    } else {
      setColumns(obj(activities))
    }
   

   
   
  }, [activities, trashActivities, showTrash])

  const onDragStart  = (e, f) => {
    setActivityId(parseInt(e.draggableId))
  }

  const updateActivity  = async (value) => {
    let body = {
      probability: value
    }

    await instance.patch(`activities/${activityId}`, body)
    .then((res) => {
      dispatch(editActivityProbability({activity: res.data.activity}))
    })
    .catch(() => {
      showAlert("Oops an error was encountered", "error")
    })
  }

  const addMessage  = async (arr) => {

    await instance.post(`add-message-for-offline-followers`, {arr})
    .then((res) => {
      
    })
    .catch(() => {
    
    })
  }

  const onDragEnd = ({ source, destination }) => {
    // Make sure we have a valid destination
    if (destination === undefined || destination === null) return null

    // If the source and destination columns are the same
    // AND if the index is the same, the item isn't moving
    if (
      source.droppableId === destination.droppableId &&
      destination.index === source.index
    )
      return null


    // Set start and end variables
    const start = columns[source.droppableId]
    const end = columns[destination.droppableId]

    // If start is the same as end, we're in the same column
    if (start === end) {
      // Move the item within the list
      // Start by making a new list without the dragged item
      const newList = start.list.filter(
        (_, idx) => idx !== source.index
      )

      // Then insert the item at the right location
      newList.splice(destination.index, 0, start.list[source.index])

      // Then create a new copy of the column object
      const newCol = {
        id: start.id,
        list: newList
      }

      // Update the state
      setColumns(state => ({ ...state, [newCol.id]: newCol }))
      return null
    } else {
      // If start is different from end, we need to update multiple columns
      // Filter the start list like before
      const newStartList = start.list.filter(
        (_, idx) => idx !== source.index
      )

      // Create a new start column
      const newStartCol = {
        id: start.id,
        list: newStartList
      }

      // Make a new end list array
      const newEndList = end.list

      // Insert the item into the end list
      newEndList.splice(destination.index, 0, start.list[source.index])

      // Create a new end column
      const newEndCol = {
        id: end.id,
        list: newEndList
      }

      // Update the state
      setColumns(state => ({
        ...state,
        [newStartCol.id]: newStartCol,
        [newEndCol.id]: newEndCol
      }))

      updateActivity(destination.droppableId)

      if (destination.droppableId === "Closed") {
        dispatch(setOpenPrompt({value: true}))
        navigate(`/activities/${activityId}`)
      }

      // send notification message to your followers
      let onlineUsersIds = onlineUsers?.map((a) => a.userId)
      let offlineIds = []

      for (let i = 0; i < usersFollowers.length; i++) {
        if (onlineUsersIds.includes(usersFollowers[i].follower_id)) {
          socket.emit('activity_moved', { 
            follower_id: usersFollowers[i].follower_id, 
            message: `${name} moved ${activities?.find((a) => a.id === activityId)?.label} from ${source.droppableId} to ${destination.droppableId}`, 
            sender_id: id,
            activityId: activityId  
          });
        } else {
          offlineIds = [...offlineIds, {id: usersFollowers[i].follower_id, message: `${name} moved ${activities?.find((a) => a.id === activityId)?.label} from ${source.droppableId} to ${destination.droppableId}`}]
        }
     
      }

      if (offlineIds?.length) {
        addMessage(offlineIds)
      }
   
      return null
    }
  }

  const getSortedActivities = async (option) => {
    setLoading(true)
    setShowTrash(false)
    let url
    url = option !== "all" ? `filter-activities/${option}` : `activities`

  
    await instance.get(url)
    .then((res) => {
      dispatch(setActivities({activities: res.data.activities}))
      setLoading(false)
    })
    .catch(() => {
      showAlert("Oops an error was encountered", "error")
    })
  }

  const fetchActivitiesWithTrashed = async () => {
    setLoading(true)
    setShowTrash(true)

    await instance.get(`activities-with-trashed`)
    .then((res) => {
      let data = res.data
      const convertedData = {
        ...data,
        activities: Object.values(data.activities)
      };
   
      dispatch(setTrashActivities({activities: convertedData.activities}))
      setLoading(false)
    })
    .catch(() => {
      showAlert("Oops an error was encountered", "error")
    })
  }

  const getSearchResult = async () => {
    setLoading(true)
    await instance({
      url: `search-activities?query=${searchQuery}`,
      method: "GET",
    }).then((res) => {

      dispatch(setSortOptionValue({option: ""}))
      dispatch(setActivities({activities: res.data.activities}))
      setLoading(false)
    })
    .catch(() => {
      showAlert("Oops an error was encountered", "error")
    })
  }

  useEffect(() => {

    if (sortOption) {
      getSortedActivities(sortOption)
    }
    
  }, [sortOption])

  useEffect(()=> {
    if (searchQuery.length === 3){
      getSearchResult()
    } else if (searchQuery.length === 0) {
      dispatch(setSortOptionValue({option: "all"}))
    }
  }, [searchQuery])

  const setSortOption =  (value) => {
    dispatch(setSortOptionValue({option: value}))
  }

  const closeSearch =  () => {
    setShowSearch(false)
  }

  const cloneActivity = async (value) => {
    let activity = activities.find((a)=> a.id === value)

    dispatch(setShowCloningNotification({showCloningNotification: true}))

    await instance.get(`activities/${activity.id}/clone`)
    .then((res)=> {
      res.data.clonedActivity.decreased_probability = null
      res.data.clonedActivity.total = activity.total
      dispatch(addActivity({activity: res.data.clonedActivity}))
      dispatch(setShowCloningNotification({showCloningNotification: false}))
   })
   .catch(() => {
      showAlert("Ooops an error was encountered", "error")
      dispatch(setShowCloningNotification({showCloningNotification: false}))
    })
  };

  const deleteActivities = async (activityIds) => {
    let url, msg, actvs, obj
    let arr = []
    let onlineUsersIds = onlineUsers?.map((a) => a.userId)
    let offlineIds = []
    url = showTrash ? `activities-bulk-force-delete` : `activities-bulk-delete`
    actvs = showTrash ? trashActivities : activities
  
    for(let i=0;i< activityIds.length;i++) {
      obj = actvs.find((a) => a.id === activityIds[i])
      arr = [...arr, obj]
    }

    dispatch(setShowDeleteNotification({showDeleteNotification: true}))

    await instance.post(url, {activityIds})
    .then(() => {
      msg = showTrash ?
      `${name} deleted  the following activities : ${arr.map((a) => a.label).join(", ").replace(/,(?=[^,]*$)/, " and")}` : 
      `${name} moved the following activities to trash : ${arr.map((a) => a.label).join(", ").replace(/,(?=[^,]*$)/, " and")}`

      for (let i = 0; i < usersFollowers.length; i++) {
        if (onlineUsersIds.includes(usersFollowers[i].follower_id)) {
          socket.emit('bulk_activity_deleted', { 
            follower_id: usersFollowers[i].follower_id, 
            message: msg, 
            sender_id: id,
            activityId: activityIds 
          });
        } else {
          offlineIds = [...offlineIds, {id: usersFollowers[i].follower_id,  message: msg}]
        }
     
      }

      if (offlineIds?.length) {
        addMessage(offlineIds)
      }

      showAlert("Activities deleted", "success")
      handleCloseDialog()
      dispatch(removeActivities({activityIds, showTrash}))
      // dispatch(deleteEvent({activityIds}))
      dispatch(removeActivityIds({activityIds}))
      dispatch(setShowDeleteNotification({showDeleteNotification: false}))
    })
    .catch((e) => {
      console.log(e);
      showAlert("Ooops an error was encountered", "error")
      dispatch(setShowDeleteNotification({showDeleteNotification: false}))
    })
  };

  const restoreActivities = async (activityIds) => {
    let arr = []
    for(let i=0;i< activityIds.length;i++) {
      let obj = trashActivities.find((a) => a.id === activityIds[i])
      arr = [...arr, obj]
    }

    dispatch(setShowDeleteNotification({showDeleteNotification: true}))

    await instance.post(`activities-bulk-restore`, {activityIds})
    .then(() => {

      let onlineUsersIds = onlineUsers?.map((a) => a.userId)
      let offlineIds = []

      for (let i = 0; i < usersFollowers.length; i++) {
        if (onlineUsersIds.includes(usersFollowers[i].follower_id)) {
          socket.emit('bulk_activity_restored', { 
            follower_id: usersFollowers[i].follower_id, 
            message: `${name} restored the following activities : ${arr.map((a) => a.label).join(", ").replace(/,(?=[^,]*$)/, " and")}`, 
            sender_id: id,
            activityId: activityIds 
          });
        } else {
          offlineIds = [...offlineIds, {id: usersFollowers[i].follower_id,  message: `${name} restored the following activities : ${arr.map((a) => a.label).join(", ").replace(/,(?=[^,]*$)/, " and")}`}]
        }
     
      }

      if (offlineIds?.length) {
        addMessage(offlineIds)
      }


      showAlert("Activities restored", "success")
      handleCloseDialog()
      dispatch(removeActivities({activityIds, showTrash}))
      dispatch(removeActivityIds({activityIds}))
     // dispatch(deleteEvent({activityIds}))
      dispatch(setShowDeleteNotification({showDeleteNotification: false}))
    })
    .catch((e) => {
      console.log(e);
      showAlert("Ooops an error was encountered", "error")
      dispatch(setShowDeleteNotification({showDeleteNotification: false}))
    })
  };

  const renderIndeterminate = (activityIds) => {
    if (showTrash) {
      if (activityIds.length > 0 && activityIds.length < trashActivities.length) {
        return true
      } else {
        return false
      }
    } else {
      if (activityIds.length > 0 && activityIds.length < activities.length) {
        return true
      } else {
        return false
      }
    }
  }

  return (
    <div>
      <Toolbar>
        <Typography variant='h6'  component="div" sx={{ flexGrow: 2 }} >My Activities {showTrash ? "- Trash" : null}</Typography>

        <Typography variant='h6'  component="div" sx={{ flexGrow: 2 }} >
          Total 
          <Tooltip placement='top' title="Total amount for the low, medium and high columns">
            <InfoOutlined sx={{fontSize: "14px", marginLeft: "4px", marginBottom: "7px"}} />
          </Tooltip>  
           : 
           <span  style={{color: "green"}}>{currencySymbol}{isNaN(columns?.Low?.total + columns?.High?.total + columns?.Medium?.total) ? 
           "" : 
           parseFloat((columns?.Low?.total + columns?.High?.total + columns?.Medium?.total).toFixed(2))}
           </span>
        </Typography>
        
        {
          activityIds.length ? (
            <div style={{display: "flex", marginRight: "30%"}}>
                <Tooltip title="Delete">
                  <DeleteOutline  
                    style={{marginLeft: "10px",  cursor: "pointer"}}
                    onClick={() => {
                      setOpenDialog(true)
                    }}
                  />
                </Tooltip>

                {
                  (activityIds.length === 1 && !showTrash) ? (
                    <Tooltip title="Clone">
                      <CopyAllOutlined 
                        style={{marginLeft: "10px", cursor: "pointer"}} 
                        onClick={() => {
                          cloneActivity(activityIds[0])
                        }}
                      /> 
                    </Tooltip>
                  ) : null
                }

              {
                showTrash ? null : (
                  <Tooltip title="Transfer">
                    <MoveUpOutlined 
                      style={{marginLeft: "10px", cursor: "pointer"}}
                      onClick={() => {
                        setOpenTransferModal(true)
                      }}
                    />
                  </Tooltip>
                )
              }

              {
                showTrash ? (
                  <Tooltip title="Restore">
                    <Restore 
                      style={{marginLeft: "10px", cursor: "pointer"}}
                      onClick={() => {
                        setRestoreMode(true)
                        setOpenDialog(true)
                      }}
                    />
                  </Tooltip>
                ) : null
              }

              <span style={{marginLeft: "10px"}}>
                {activityIds.length} Items Selected
              </span>

              {
                showCloningNotification ? (
                  <span style={{marginLeft: "10px", color: "green"}}>
                    Cloning Activity...
                  </span>
                ) : null
              }
            </div>
          ) : null
        }

        <div style={{display: "flex"}}>
          <Tooltip title="Select all">
            <Checkbox
              checked={arraysHaveSameContents(showTrash ? trashActivities?.map((a) => a.id) : activities?.map((a) => a.id) , activityIds)}
              // indeterminate={activityIds.length > 0 && activityIds.length < activities.length}
              indeterminate={renderIndeterminate(activityIds)}
              onChange={(e,f) => {
                let ids = showTrash ? trashActivities?.map((a) => a.id) : activities?.map((a) => a.id) 
                if (f) {

                  dispatch(addActivityIds({activityIds: ids}))
                } else {
                  dispatch(removeActivityIds({activityIds: ids}))
                }
              }}
              inputProps={{ 'aria-label': 'controlled' }}
              style={{marginRight: "-24px"}}
            />
          </Tooltip>

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
          
            
            <MenuItem 
              onClick={() => {
                if (showTrash) {
                  dispatch(addActivityIds({activityIds: trashActivities?.map((a) => a.id)}))
                } else {
                  dispatch(addActivityIds({activityIds: activities?.map((a) => a.id)}))
                }
              }}
            >
              All
            </MenuItem>

            <MenuItem 
              onClick={() => {
                if (showTrash) {
                  dispatch(removeActivityIds({activityIds: trashActivities?.map((a) => a.id)}))
                } else {
                  dispatch(removeActivityIds({activityIds: activities?.map((a) => a.id)}))
                }
              }}
            >
              None
            </MenuItem>

            <MenuItem 
              onClick={()=> {
                if (showTrash) {
                  dispatch(addActivityIds({activityIds: trashActivities?.filter((b) => b.probability === "High").map((a) => a.id)}))
                } else {
                  dispatch(addActivityIds({activityIds: activities?.filter((b) => b.probability === "High").map((a) => a.id)}))
                }
              }}
            >
              High
            </MenuItem>

            <MenuItem
              onClick={()=> {
                if (showTrash) {
                  dispatch(addActivityIds({activityIds: trashActivities?.filter((b) => b.probability === "Medium").map((a) => a.id)}))
                } else {
                  dispatch(addActivityIds({activityIds: activities?.filter((b) => b.probability === "Medium").map((a) => a.id)}))
                }
              }}
            >
              Medium
            </MenuItem>

            <MenuItem 
              onClick={()=> {
                if (showTrash) {
                  dispatch(addActivityIds({activityIds: trashActivities?.filter((b) => b.probability === "Low").map((a) => a.id)}))
                } else {
                  dispatch(addActivityIds({activityIds: activities?.filter((b) => b.probability === "Low").map((a) => a.id)}))
                }
              }}
            >
              Low
            </MenuItem>

            <MenuItem 
              onClick={()=> {
                if (showTrash) {
                  dispatch(addActivityIds({activityIds: trashActivities?.filter((b) => b.probability === "Closed").map((a) => a.id)}))
                } else {
                  dispatch(addActivityIds({activityIds: activities?.filter((b) => b.probability === "Closed").map((a) => a.id)}))
                }
              }}
            >
              Closed
            </MenuItem>
          </Menu>

        </div>
       

        {
          showTrash ? (
            <Tooltip title="Show activities">
              <RestorePage
                style={{fontSize: "28px", cursor: "pointer"}}
                onClick={() => {
                  dispatch(removeActivityIds({activityIds}))
                  getSortedActivities("all")
                }}
              />
            </Tooltip>
          ) : (
            <>
             {
              activities?.length ? (
                <FolderDelete
                  style={{fontSize: "28px", cursor: "pointer"}}
                  onClick={() => {
                    dispatch(removeActivityIds({activityIds}))
                    fetchActivitiesWithTrashed()
                  }}
                />
              ) : null
             }
            </>
          )
        }

        {
          showSearch && (
            <TextField
              className='text'
              size="small"
              label="Search Activities"
              InputProps={{
                type: 'search',
              }}
              onChange={(e)=> setSearchQuery(e.target.value)}
            />
          )
        }

        <Tooltip title="Search Activities">
          <Button
            onClick={() => {
              setShowSearch(prev => !prev)
              setSearchQuery("")
            }}
            size="small"
            style={{borderRadius: "30px"}}
            disabled={showTrash}
          >
            <SearchOutlined />
          </Button>
        </Tooltip>

        <SortButton 
          setSortOption={setSortOption} 
          sortOption={sortOption}  
          closeSearch={closeSearch} 
          title="Sort Activities" 
          showTrash={showTrash}
        />

        <Tooltip title="Add Activity">
          <Button 
            variant="contained" 
            size='small' 
            className="addButton" 
            onClick={handleOpen} 
            style={{borderRadius: "30px", 
            marginLeft: "30px"}}
            disabled={showTrash}
          >
            <AddOutlined />
          </Button>
        </Tooltip>
      </Toolbar>

      <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr',
            margin: 'auto',
            width: '100%',
            gap: '8px'
          }}
        >
          {Object.values(columns).map((col, i) => (
            <ActivityColumn 
              col={col} 
              key={i} 
              loading={loading} 
              socket={socket}  
              showTrash={showTrash} 
              currencySymbol={currencySymbol}
            />
          ))}
        </div>
      </DragDropContext>

      <ActivityModal
        open={open}
        setOpen={setOpen}
        mode="activities"
        socket={socket}
      />

      <ActivityTransferModal
        open={openTransferModal}
        setOpen={setOpenTransferModal}
        activityIds={activityIds}
        socket={socket}
        mode="bulk" 
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
                restoreActivities(activityIds)
              } else {
                deleteActivities(activityIds)
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
          {alertMessage}
        </Alert>
      </Snackbar>
    </div>
   
  )
}

export default Activities