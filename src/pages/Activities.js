import { AddOutlined, InfoOutlined, SearchOutlined } from '@mui/icons-material'
import { Button, CircularProgress, Snackbar, TextField, Toolbar, Tooltip, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import {DragDropContext} from 'react-beautiful-dnd'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import ActivityColumn from '../components/activities/ActivityColumn'
import ActivityModal from '../components/activities/ActivityModal'
import { editActivity, editActivityProbability, setActivities, setOpenPrompt, setSortOptionValue } from '../features/ActivitySlice'
import instance from '../services/fetchApi'
import { getToken } from '../services/LocalStorageService'
import SortButton from './orders/SortButton'
import MuiAlert from '@mui/material/Alert';


const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Activities = ({socket}) => {
  const [columns, setColumns] = useState([])
  const [activityId, setActivityId] = useState()
  const dispatch = useDispatch()
  const { activities, sortOption } = useSelector((state) => state.activity) 
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

  const token = getToken()

  useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [token])

  // useEffect(() => {
  //   const fetchActivities = async () => {
  //     await instance.get(`/activities`)
  //     .then((res) => {
  //       dispatch(setActivities({activities: res.data.activities}))
  //     })
  //   }

  //   fetchActivities()
  // }, [])

  useEffect(() => {
    let cols  = {
      Low: {
        id: 'Low',
        list: activities.filter((a) => a.probability === "Low"),
        total: activities.filter((a) => a.probability === "Low").reduce((n, {total}) => n + total, 0) * 0.2,
      },
      Medium: {
        id: 'Medium',
        list: activities.filter((a) => a.probability === "Medium"),
        total: activities.filter((a) => a.probability === "Medium").reduce((n, {total}) => n + total, 0) * 0.4,
      },
      High: {
        id: 'High',
        list: activities.filter((a) => a.probability === "High"),
        total: activities.filter((a) => a.probability === "High").reduce((n, {total}) => n + total, 0) * 0.8,
      },
      Closed: {
        id: 'Closed',
        list: activities.filter((a) => a.probability === "Closed"),
        total: activities.filter((a) => a.probability === "Closed").reduce((n, {total}) => n + total, 0),
      },
    
    }


    setColumns(cols)
   
  }, [activities])

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

      return null
    }
  }

  const getSortedActivities = async (option) => {
    setLoading(true)
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
    //setFetchData(true)
    dispatch(setSortOptionValue({option: value}))
  }

  const closeSearch =  () => {
    //setSearchQuery("")
    setShowSearch(false)
  }

  return (
    <div>
      <Toolbar>
        <Typography variant='h6'  component="div" sx={{ flexGrow: 2 }} >My Activities</Typography>

        <Typography variant='h6'  component="div" sx={{ flexGrow: 2 }} >
          Total 
          <Tooltip placement='top' title="Total amount for the low, medium and high columns">
            <InfoOutlined sx={{fontSize: "14px", marginLeft: "4px", marginBottom: "7px"}} />
          </Tooltip>  
           : <span  style={{color: "green"}}>${isNaN(columns?.Low?.total + columns?.High?.total + columns?.Medium?.total) ? "" : columns?.Low?.total + columns?.High?.total + columns?.Medium?.total}</span>
        </Typography>


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
          <SearchOutlined
            style={{cursor: "pointer"}}
            onClick={() => {
              setShowSearch(prev => !prev)
              setSearchQuery("")
            }}
          />
        </Tooltip>

        <SortButton setSortOption={setSortOption} sortOption={sortOption}  closeSearch={closeSearch} title="Sort Activities" />

        <Tooltip title="Add Activity">
          <Button variant="contained" size='small' className="addButton" onClick={handleOpen} style={{borderRadius: "30px", marginLeft: "30px"}}>
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
            <ActivityColumn col={col} key={i} loading={loading} socket={socket}   />
          ))}
        </div>
      </DragDropContext>

      <ActivityModal
        open={open}
        setOpen={setOpen}
        mode="activities"
      />


      <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={severity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </div>
   
  )
}

export default Activities