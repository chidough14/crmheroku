import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { ContentPasteOff, DeleteOutlined, EditOutlined, ViewListOutlined } from '@mui/icons-material';
import {  Box, Button, Checkbox, Chip, Popover, Snackbar, Tab, Tabs, Tooltip, Typography } from '@mui/material';
import moment from 'moment';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import DeleteDialog from '../userMessages/DeleteDialog';
import instance from '../../services/fetchApi';
import { removeMeeting, removeMeetings } from '../../features/MeetingSlice';
import MuiAlert from '@mui/material/Alert';
import { arraysHaveSameContents } from '../../services/checkers';


const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});




const MeetingsTable = ({meetings, showModal, user, own}) => {
  const [openDialog, setOpenDialog] = React.useState(false);
  const [recordId, setRecordId] = React.useState();
  const dispatch = useDispatch()
  const [openAlert, setOpenAlert] = React.useState(false)
  const [severity, setSeverity] = React.useState("");
  const [alertMessage, setAlertMessage] = React.useState("");
  const [meetingId, setMeetingId] = React.useState();
  const [meetingIds, setMeetingIds] = React.useState([]);
  const [bulkMode, setBulkMode] = React.useState(false)
  const navigate = useNavigate()

  //popover//////
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
/////////

  const handleCloseAlert = () => {
    setOpenAlert(false)
  }

  const renderBadge = (meeting) => {
    if (meeting.status) {
      if (moment().isBetween(meeting.event.start, meeting.event.end, 'milliseconds', null)) {
        return <Link 
                 to={`/join/${meeting.meetingId}`} 
                 target="_blank" 
                 style={{color: 'black'}}
                 onClick={()=> {
                  let userDetails = {
                    id: user.id,
                    email: user.email
                  }
                  
                  localStorage.setItem("userDetails", JSON.stringify(userDetails))
                }}
                >
                  <Chip  size="small" label="Join" color="success" style={{cursor: "pointer"}} />
                </Link>
      } else if (moment(meeting.event.end).isBefore(moment())) {
        return <Chip  size="small" label="Ended" color="secondary" />
      } else {
        return <Chip  size="small" label="Upcoming" color="primary" />
      }
    } else return <Chip  size="small" label="Cancelled" color="error" />
  }

  const deleteMeeting = (value) => {
    setOpenDialog(true)
    setRecordId(value?.id)
  };

  const handleDelete = async () => {
    if(bulkMode) {
      await instance.post(`meetings-bulk-delete`, {meetingIds})
      .then(() => {
        setOpenAlert(true)
        setSeverity("success")
        setAlertMessage("Meetings Deleted")
        dispatch(removeMeetings({meetingIds}))
        setMeetingIds([])
        setOpenDialog(false)
      })
      .catch(()=> {
        setOpenAlert(true)
        setSeverity("error")
        setAlertMessage("Ooops an error was encountered")
      })
    } else {
      await instance.delete(`meetings/${recordId}`)
      .then(() => {
        setOpenAlert(true)
        setSeverity("success")
        setAlertMessage("Meeting Deleted")
        dispatch(removeMeeting({meetingId: recordId}))
        setOpenDialog(false)
      })
      .catch(()=> {
        setOpenAlert(true)
        setSeverity("error")
        setAlertMessage("Ooops an error was encountered")
      })
    }

  };

  const getInitials = (string) => {
    let names = string?.split(' '),
        initials = names[0].substring(0, 1).toUpperCase();
    
    if (names.length > 1) {
        initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  }

  const getImage = (row, type) => {

    let image_src
    if (type === "sender") {
      image_src = user?.allUsers?.find((a)=> a.id === row.user_id)?.profile_pic
    } else if (type === "invited") {
      image_src = user?.allUsers?.find((a)=> a.email === row)?.profile_pic
    }

    if ( image_src === ""  || image_src === null) {
      return (
        <div 
          style={{
            display: "inline-block",
            backgroundColor: "gray" ,
            borderRadius: "50%",
            cursor: "pointer",
          }}
          onClick={() => {
            if (type === "sender") {
              navigate(`/profile/${user?.allUsers?.find((a)=> a.id === row.user_id)?.id}`)
            }else if (type === "invited") {
              navigate(`/profile/${user?.allUsers?.find((a)=> a.email === row)?.id}`)
            }
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
            {type === "sender" ? getInitials(user?.allUsers?.find((a)=> a.id === row.user_id)?.name) : getInitials(user?.allUsers?.find((a)=> a.email === row)?.name)}
          </p>
        </div>
      )
    } else {
      return (
        <img 
          width="30px" 
          height="30px" 
          src={image_src}  
          alt='profile_pic' 
          style={{borderRadius: "50%", cursor: "pointer"}} 
          onClick={() => {
            if (type === "sender") {
              navigate(`/profile/${user?.allUsers?.find((a)=> a.id === row.user_id)?.id}`)
            } else if (type === "invited") {
              navigate(`/profile/${user?.allUsers?.find((a)=> a.email === row)?.id}`)
            }
          }}
        />
      )
    }
  }

  const mapInvitedUsers = (arr) => {
    return arr.map((a) => (
      <>
        <Tooltip title={user?.allUsers?.find((b)=> b.email === a)?.name}>
        {getImage(a, "invited")}
        </Tooltip>&nbsp;&nbsp;&nbsp;
      </>
    ))
  }
  

  return (
    <>
      <div style={{display: "flex", justifyContent: "space-between"}}>
        <Typography variant='h6'></Typography>

        {
          meetingIds.length ? (
            <div>
              <Tooltip title="Delete">
                <DeleteOutlined 
                  style={{marginBottom: "-5px", cursor: "pointer", marginRight: "5px"}} 
                  onClick={() => {
                    setOpenDialog(true)
                    setBulkMode(true)
                  }}
                />
              </Tooltip>

              <span>
                { meetingIds.length } Items Selected
              </span>
            </div>
          ) : null
        }

       <Typography variant='h6'></Typography>
      </div>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 500 }} aria-label="custom pagination table">
          <TableHead>
            <TableRow>
              <TableCell>
                {
                  own && (
                    <Tooltip title="Select all">
                      <Checkbox
                        checked={arraysHaveSameContents(meetings?.map((a) => a.id), meetingIds)}
                        indeterminate={meetingIds.length > 0 && meetingIds.length < meetings?.length}
                        onChange={(e,f) => {
                          if (f) {
                            let ids = meetings?.map((a) => a.id)
        
                            setMeetingIds(ids)
                          } else {
                            setMeetingIds([])
                          }
                        }}
                        inputProps={{ 'aria-label': 'controlled' }}
                        style={{marginRight: "-24px"}}
                      />
                    </Tooltip>
                  )
                }
               

              </TableCell>
              <TableCell >Meeting Name</TableCell>

             { !own && <TableCell >Host</TableCell>}

              <TableCell >Type</TableCell>
              <TableCell >Date</TableCell>
              <TableCell >Status</TableCell>
              <TableCell >Invited users</TableCell>
              <TableCell width={300}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
            !meetings?.length ? (
              <TableRow   sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <div style={{marginTop: "50px", marginLeft: "170%"}}>
                  <ContentPasteOff sx={{fontSize: "64px"}}/>
                  <Typography variant='h7' sx={{display: "flex", width: "150px"}}>No Meetings</Typography>
                </div>
                 

              </TableRow>
            
            ) :
            meetings?.map((row) => (
            
              <TableRow
                key={row.meetingId}
                onMouseEnter={() => {
                  setMeetingId(row.id)
                }}
                onMouseLeave={()=> {
                  setMeetingId(null)
                }}
              >
                <TableCell>
                  {
                    own && (
                      <Checkbox
                        checked={meetingIds.map((a) => a).includes(row.id)}
                        onChange={(e,f) => {
                          if(f) {
                            setMeetingIds([...meetingIds, row.id])
                          } else {
                            setMeetingIds(meetingIds.filter((b) => b !== row.id))
                          }
                        }}
                        inputProps={{ 'aria-label': 'controlled' }}
                        style={{marginRight: "-24px"}}
                      />
                    )
                  }
                 
                </TableCell>
                <TableCell>
                  {row.meetingName}
                </TableCell>

                {
                  !own && (
                    <TableCell >
                      <Tooltip title={user?.allUsers?.find((a)=> a.id === row.user_id)?.name}>
                          {getImage(row, "sender")}
                      </Tooltip>
                    </TableCell>
                  )
                }
               

                <TableCell >{row.meetingType}</TableCell>
                <TableCell >{moment(row.event.start).format("MMMM Do YYYY, h:mm a")}</TableCell>

                <TableCell >
                  {renderBadge(row)}

                </TableCell>

                <TableCell >
                  {
                  row.invitedUsers.length > 2 ? (
                    <>
                      { 
                        mapInvitedUsers(row.invitedUsers.slice(0, 2))
                      }
                      <span>
                        <Tooltip title="See all">
                          <Button aria-describedby={id} size='small' onClick={handleClick}>
                            <ViewListOutlined />
                          </Button>
                        </Tooltip>


                        <Popover
                          id={id}
                          open={open}
                          anchorEl={anchorEl}
                          onClose={handleClose}
                          anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                          }}
                        >
                          {
                           mapInvitedUsers(row.invitedUsers)
                          }
                        </Popover>
                       
                      </span>
                    </>
                  ) :
                  mapInvitedUsers(row.invitedUsers)
                }
                </TableCell>

                <TableCell  width={300}>
                  {
                    meetingId === row.id ? (
                      <>
                        <Tooltip title="Edit" placement="top">
                          <Button
                            disabled={!row.status || moment(row.event.end).isBefore(moment()) || row.user_id !== user.id}
                            onClick={() => showModal(row)}
                          >
                            <EditOutlined />
                          </Button>
                          
                        </Tooltip>
                        <Tooltip title="Delete" placement="top" disabled={row.user_id !== user.id}>
                          <Button>
                            <DeleteOutlined
                              style={{cursor: "pointer"}}
                              onClick={() => deleteMeeting(row)}
                            />
                          </Button>
                        
                        </Tooltip>

                        <Tooltip title="Copy link" placement="top">
                          <Button
                            onClick={() => {
                              navigator.clipboard.writeText(`${process.env.REACT_APP_HOST}/join/${row.meetingId}`)
                              alert(`Link copied : ${process.env.REACT_APP_HOST}/join/${row.meetingId}`)
                            }}
                          >
                            <ContentCopyIcon
                            />
                          </Button>
                        </Tooltip>
                      </>
                    ) : null
                  }
                 
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>


      <DeleteDialog
        open={openDialog}
        setOpen={setOpenDialog}
        handleDelete={handleDelete}
        meeting={true}
      />

    <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
      <Alert onClose={handleCloseAlert} severity={severity} sx={{ width: '100%' }}>
        {alertMessage}
      </Alert>
    </Snackbar>
    </>
 
  );
}


export default MeetingsTable