import { ContentPasteOff, DeleteOutline } from '@mui/icons-material'
import { 
  Button, 
  Checkbox, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
  Pagination, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Tooltip, 
  Typography 
} from '@mui/material'
import Paper from '@mui/material/Paper';
import moment from 'moment';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { bulkDeleteUsersConversation, deleteUsersConversation, setPage } from '../../features/MessagesSlice';
import instance from '../../services/fetchApi';
import { useNavigate } from 'react-router';
import { arraysHaveSameContents } from '../../services/checkers';

const ChatMessages = ({getConversations, loading}) => {
  const { users_conversations, page } = useSelector(state => state.message)
  const { allUsers } = useSelector(state => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [showTableActions, setShowTableActions] = useState(false)
  const [messageIds, setMessageIds] = useState([]);
  const [messageId, setMessageId] = useState();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDeleteNotification, setShowDeleteNotification] = useState(false)
  const [rowObj, setRowObj] = useState();

  useEffect(() => {
    getConversations()
  }, [])

  const handleChangePage = (event, newPage) => {
    dispatch(setPage({page: newPage}))
  };

  const deleteConversation = async () => {
    setShowDeleteNotification(true)

    if (rowObj) {
      await instance.delete(`conversations/${rowObj.id}`)
      .then((res) => {
        dispatch(deleteUsersConversation({conversationId: rowObj.id}))
        setShowDeleteDialog(false)
      })
    } else {
      await instance.post(`bulk-delete-conversations`, {messageIds})
      .then((res) => {
        dispatch(bulkDeleteUsersConversation({conversationIds: messageIds.map((a) => a.id)}))
        setShowDeleteDialog(false)
      })
    }

    setRowObj(undefined)
    setMessageIds([])
    setShowDeleteNotification(false)

  }

  return (

    
        <>
         
          <div style={{display: "flex"}}>
            <Typography variant='h7'><b>Chat Messages</b></Typography>
            
            {
              messageIds.length ? (
                <div style={{marginLeft: "30px"}}>
          
                  <Tooltip title="Delete">
                    <DeleteOutline
                      style={{cursor: "pointer", marginLeft: "20px", marginBottom: "-5px"}}
                      onClick={()=> {
                        setShowDeleteDialog(true)
                      }}
                    />
                  </Tooltip>

                  <span style={{marginLeft: "10px"}}>
                    {messageIds.length} Items Selected
                  </span>
                </div>
              ) : null
            }

           
          </div>

          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="custom pagination table">
              <TableHead>
                  <TableRow>
                    <TableCell>
                      <Checkbox
                        checked={arraysHaveSameContents(users_conversations?.data?.map((a) => a.id), messageIds.map((a) => a.id))}
                        indeterminate={messageIds.length > 0 && messageIds.length < users_conversations?.data?.length}
                        onChange={(e,f) => {
                          if (f) {
                            let ids = users_conversations?.data?.map((a) => {
                              return {
                                id: a.id
                              }
                            })
        
                            setMessageIds(ids)
                          } else {
                            setMessageIds([])
                          }
                        }}
                        inputProps={{ 'aria-label': 'controlled' }}
                      />
                    </TableCell>
                    <TableCell >Recipient</TableCell>
                    <TableCell >String</TableCell>
                    <TableCell >Date Sent</TableCell>
                    <TableCell >Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    !users_conversations?.data?.length ? (
                      <div style={{marginTop: "50px", marginLeft: "150%"}}>
                        <ContentPasteOff sx={{fontSize: "64px"}}/>
                        <Typography variant='h7' sx={{display: "flex", width: "150px"}}>No Messages</Typography>
                      </div>
                    ) : (
                      <>
                      {
                          loading ? (
                            <div style={{ marginLeft: "200%", marginTop: "70px" }}>
                              <Typography variant='h7'>
                                  <b>Loading...</b>
                                </Typography>
                            </div>
                          ) :
                          users_conversations?.data?.map((row, i) => (
                            <TableRow
                              key={i} 
                              sx={{cursor: "pointer"}} 
                              onMouseEnter={() => {
                                setMessageId(row.id)
                                setShowTableActions(true)
                              }}
                              onMouseLeave={()=> {
                                setShowTableActions(false)
                              }}
                              onClick={()=> {
                                navigate(`/users-conversations/${row.id}`, { 
                                  state: {
                                    conversationString: row.conversation_string, 
                                    conversationId: row.id ,
                                    recipientId: row.recipient_id,
                                    userId: row.user_id,
                                    creator: row.user_id,
                                    resumeChat: true 
                                  }
                               })

                              }}
                            >
                              <TableCell component="th" scope="row">
                                <Checkbox
                                  checked={messageIds.map((a) => a.id).includes(row.id)}
                                  onChange={(e,f) => {
                                  
                                    if(f) {
                                      setMessageIds([...messageIds, {id: row.id}])
                                    } else {
                                      setMessageIds(messageIds.filter((b) => b.id !== row.id))
                                    }
                                  }}
                                  onClick={(e)=> {
                                      e.stopPropagation()
                                  }}
                                  inputProps={{ 'aria-label': 'controlled' }}
                                />
                              </TableCell>

                              <TableCell component="th" scope="row">
                                {row.recipient_id ? allUsers.find((a) => a.id === row.recipient_id )?.name : "Admin"}
                              </TableCell>

                              <TableCell component="th" scope="row">
                                {row.conversation_string}
                              </TableCell>

                            
                              <TableCell style={{ width: 160 }} >
                                {moment(row.created_at).format("MMMM Do YYYY")}
                              </TableCell>

                              <TableCell>
                                <div style={{display: "flex", justifyContent: "space-between"}}>
                                {
                                  (showTableActions && messageId === row.id) && (
                                    <>

                                      <Tooltip title="Delete">
                                        <DeleteOutline
                                          style={{cursor: "pointer"}}
                                          onClick={(e)=> {
                                            setShowDeleteDialog(true)
                                            setRowObj(row)
                                            e.stopPropagation()
                                            
                                          }}
                                        />
                                      </Tooltip>
                                    </>
                                  )
                                }
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        }
                      </>
                    )
                  }
                
                </TableBody>
            </Table>
          </TableContainer>

          <Dialog
            open={showDeleteDialog}
            onClose={() => {
              setShowDeleteDialog(false)
              setRowObj(undefined)
            }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              Delete Messages
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                You are about to delete these chat message(s). Confirm...
              </DialogContentText>

              <DialogContentText id="alert-dialog-description" sx={{textAlign: "center", color: "red"}}>
              {
                showDeleteNotification && "Deleting..."
              }
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => {
                  setShowDeleteDialog(false)
                  setRowObj(undefined)
                }}
              >
                Disagree
              </Button>

              <Button 
                onClick={() => {
                  deleteConversation()
                }} 
                autoFocus
              >
                Agree
              </Button>
            </DialogActions>
          </Dialog>

          <div style={{marginTop: "20px"}}>
            <Pagination
              count={ Math.ceil(users_conversations?.total / users_conversations?.per_page)}
              page={page}
              onChange={(page, idx) => {
                handleChangePage(page, idx)
              }}
              color="secondary"
              showFirstButton
              showLastButton
            />
          </div>
        </>
  )
}

export default ChatMessages