import { Group } from '@mui/icons-material'
import { Alert, Badge, Menu, Tooltip } from '@mui/material'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { removeFollowersData } from '../features/userSlice';

const FollowersNotification = ({data, deleteFollowerMessage, allUsers}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const dispatch = useDispatch()

  const getInitials = (string) => {
    let names = string?.split(' '),
        initials = names[0].substring(0, 1).toUpperCase();
    
    if (names.length > 1) {
        initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  }

  const getImage = (row) => {
    let id
    id = row.sender ? row.sender : row.follower_id

    let image_src = allUsers?.find((a)=> a.id === id)?.profile_pic

    if ( image_src === ""  || image_src === null) {
      return (
        <div 
          style={{
            display: "inline-block",
            backgroundColor: "gray" ,
            borderRadius: "50%",
          }}
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
            {getInitials(allUsers?.find((a)=> a.id === id)?.name)}
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
          />
        )
      }
    }
  }

  return (
    <div>
      <Badge 
        color="primary" 
        badgeContent={data?.length}
      >
        <Tooltip title="Followers notification">
          <Group style={{cursor: "pointer"}}  onClick={handleClick} />
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
            !data?.length ? (
              <>
                  <Alert 
                
                    severity="info" 
                    sx={{ width: '100%' }}
                  >
                  You have no new followers activity
                </Alert>
              </>
            ) : 
            data?.map((a) => (
              <>
                <Alert 
                  onClose={(e) => {
                    e.stopPropagation()

                    if (a.hasOwnProperty('isRead')) {
                      // delete from server
                      deleteFollowerMessage(a.id)
                    }

                    dispatch(removeFollowersData({id: a.id}))
                  }} 
                  severity="info" 
                  sx={{ width: '100%' }}
                >
                  {getImage(a)} {a.message} 
                </Alert><br></br>
              </>
            ))
          }
        </div>
        
      </Menu>
    </div>
  )
}

export default FollowersNotification