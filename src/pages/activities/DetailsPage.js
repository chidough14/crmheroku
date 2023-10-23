import { AddOutlined, DeleteOutlined, EditOutlined } from '@mui/icons-material'
import { Button, Typography } from '@mui/material'
import React from 'react'
import {useNavigate } from 'react-router-dom'
import ActivityEventsTable from './ActivityEventsTable'
import Comments from '../comments/Comments'

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
  params
}) => {
  const navigate = useNavigate()

  return (
    <>
      <div style={{display: "flex", justifyContent: "space-between", marginBottom: "20px"}}>
        <div>
          <Typography variant="h7" display="block"  gutterBottom>
            <b>Label</b> : {activity?.label}
          </Typography>

          <Typography variant="h7" display="block"  gutterBottom>
            <b>Description</b> : {activity?.description}
          </Typography>

          <Typography variant="h7" display="block"  gutterBottom>
            <b>Assignee</b> : {activity?.assignedTo}
          </Typography>

          <Typography variant="h7" display="block"  gutterBottom>
            <b>Type</b> : {activity?.type}
          </Typography>

          <Typography variant="h7" display="block"  gutterBottom>
            <b>Estimate</b> : {activity?.earningEstimate}
          </Typography>

          <Typography variant="h7" display="block"  gutterBottom>
            <b>Probability</b> : {activity?.probability}
          </Typography>

          <Typography variant="h7" display="block"  gutterBottom>
            <b>Company</b> : 
            <Button style={{borderRadius: "30px"}} onClick={() => navigate(`/companies/${activity?.company?.id}`)}>
              {activity?.company?.name}
            </Button>
          </Typography>

          <Button 
            disabled={activity?.user_id !== user?.id} 
            variant="contained" 
            size='small' 
            onClick={() => setOpenEditModal(true)} 
            style={{borderRadius: "30px"}}
          >
            <EditOutlined />
          </Button>&nbsp;&nbsp;&nbsp;

          <Button 
            disabled={activity?.user_id !== user?.id}  
            variant="contained" 
            color='error' 
            size='small' 
            onClick={()=> setOpenDialogDeleteActivity(true)} 
            style={{borderRadius: "30px"}}
          >
            <DeleteOutlined /> 
          </Button>
        </div>

        <div style={{margin: "auto", width: "60%"}}>
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
        <Typography variant='h6'>
          Comments &nbsp; &nbsp;
          {
            `(${activity?.comments?.length})`
          }
        </Typography>
        
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