import { ChatBubbleRounded } from '@mui/icons-material'
import { Alert, Badge, Menu, Tooltip } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { removeUsersChatRequest } from '../features/MessagesSlice'

const UsersChatsRequestNotification = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { usersRequests } = useSelector(state => state.message)
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const dispatch = useDispatch()

  const renderText = (name, cId, mode) => {
    if (mode === "continue") {
      return `${name} requested to continue a chat ${cId}`
    } else {
      return `${name} requested a chat ${cId}`
    }
  }

  return (
    <div>
      <Badge 
        color="primary" 
        badgeContent={usersRequests?.length}
      >
        <Tooltip title="User chats">
          <ChatBubbleRounded style={{cursor: "pointer"}}  onClick={handleClick} />
        </Tooltip>
      
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
          {
            !usersRequests?.length ? (
              <>
                  <Alert 
                
                    severity="info" 
                    sx={{ width: '100%' }}
                  >
                  You have no new chat request
                </Alert>
              </>
            ) : 
            usersRequests?.map((a) => (
              <>
                <Link 
                  to={`/users-conversations/${a.conversationId}`} 
                  state= {{
                    conversationString: a.conversationString, 
                    conversationId: a.conversationId,
                    recipientId: a.userId,
                    mode: a.mode
                  }}
                >
                <Alert 
                  onClose={(e) => {
                    e.preventDefault()

                  }} 
                  severity="info" 
                  sx={{ width: '100%' }}
                  onClick={()=> {
                    dispatch(removeUsersChatRequest({requestId: a.conversationId}))
                    // if (a.mode === "null") {
                    //   dispatch(setNewChat({newChat: true}))
                    // } else {
                    //   dispatch(setNewChat({newChat: false}))
                    // }
                  }}
                >
                  {/* {getImage(a)} */}

                  {
                    renderText(a.username, a.conversationId, a.mode)
                  }
                </Alert></Link><br></br>
              </>
            ))
          }
        </div>
        
      </Menu>
    </div>
  )
}

export default UsersChatsRequestNotification