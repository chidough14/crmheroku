import { Avatar, Badge, Divider, Menu, MenuItem, Tooltip } from '@mui/material'
import { Notifications, NotificationsActive } from '@mui/icons-material';
import React, { useState } from 'react'
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import "./bell.css"




const BellNotification = ({inbox, allUsers, invitedMeetings}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const navigate = useNavigate()

  const getInitials = (string) => {
    let names = string?.split(' '),
        initials = names[0].substring(0, 1).toUpperCase();
    
    if (names.length > 1) {
        initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
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
          }}
          // onClick={() => navigate(`/profile/${allUsers?.find((a)=> a.id === row.sender_id)?.id}`)}
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
          <span>Auto Generated</span>
         )
      } else {
        return (
          <img 
            width="30px" 
            height="30px" 
            src={image_src}  
            alt='profile_pic' 
            style={{borderRadius: "50%"}} 
            // onClick={() => navigate(`/profile/${allUsers?.find((a)=> a.id === row.sender_id)?.id}`)}
          />
        )
      }
    }
  }


  return (
    <div>
      <Badge 
        color="primary" 
        badgeContent={inbox?.filter((a) => !a.isRead)?.length + invitedMeetings?.filter((b)=> !moment(b.event.end).isBefore(moment()))?.length}
      >
        <Notifications style={{cursor: "pointer"}}  onClick={handleClick} />
      </Badge>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <div className='hide-scroll' style={{maxHeight: "400px", overflow: "scroll"}}>
          <Divider>Inbox</Divider>
          {
            inbox?.filter((b) => !b.isRead).length ? 
            inbox?.filter((b) => !b.isRead).map((a) => {
              let username
              if (!a.sender_id) {
                username = "Auto Generated"
              } else {
                username = allUsers?.find((b)=> b.id === a.sender_id)?.name
              }
              return <MenuItem onClick={()=>navigate(`/messages/${a.id}`, {state: {isInbox: true, isRead: a.isRead, auto: !a.sender_id ? true : false}})}>
                      <p>
                        <b>{a.subject} </b>sent by &nbsp;
                        <Tooltip title={username}>
                          <b>
                            {
                              getImage(a)
                            }
                          </b>
                        </Tooltip>
                      
                      </p>&nbsp;&nbsp;
                      <p><b>Date:</b> {moment(a.created_at).format("MMM Do YYYY, h:mm a")}</p>
                    </MenuItem>
            }) :   <p style={{margin: "auto", padding: "10px"}}>You have no new messages</p>
          
          }
          <Divider>Meetings</Divider>
          {
            invitedMeetings?.filter((b)=> !moment(b.event.end).isBefore(moment())).length ?
            invitedMeetings?.filter((b)=> !moment(b.event.end).isBefore(moment())).map((a) => (
              <MenuItem onClick={()=>navigate(`/mymeetings`)}>
                <p><b>Name :</b> <b>{a.meetingName}</b></p><br></br>
                <p><b>Date:</b> {moment(a.event.start).format("MMMM Do YYYY, h:mm a")}</p>
              </MenuItem>
            )) : <p style={{margin: "auto", padding: "10px"}}>You have no meetings</p>
          }
        </div>
        
      </Menu>
    </div>
  )
}

export default BellNotification