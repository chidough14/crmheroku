import { ContentPasteOff } from '@mui/icons-material'
import { Pagination, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import Paper from '@mui/material/Paper';
import moment from 'moment';
import React, { useEffect } from 'react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setPage, setUsersConversations } from '../../features/MessagesSlice';
import instance from '../../services/fetchApi';
import { useNavigate } from 'react-router';

const ChatMessages = () => {

  const [loading, setLoading] = useState(false)
  const { users_conversations, page } = useSelector(state => state.message)
  const { allUsers } = useSelector(state => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const getConversations = async () => {
    setLoading(true)
    await instance.get(`conversations/users`)
    .then((res) => {
       dispatch(setUsersConversations({users_conversations: res.data.conversations}))
       setLoading(false)

    })
  }

  useEffect(() => {
    getConversations()
  }, [])

  const handleChangePage = (event, newPage) => {
    dispatch(setPage({page: newPage}))
  };

  return (

    
        <>
         
          <div style={{display: "flex"}}>
            <Typography variant='h7'><b>Chat Messages</b></Typography>
            
            {/* {
              messageIds.length ? (
                <div style={{marginLeft: "30px"}}>
          
                  <Tooltip title="Delete">
                    <DeleteOutlined
                      style={{cursor: "pointer", marginLeft: "20px", marginBottom: "-5px"}}
                      onClick={()=> {
                        // bulkDeleteDrafts()
                        setShowDeleteDialog(true)
                      }}
                    />
                  </Tooltip>

                  <span style={{marginLeft: "10px"}}>
                    {messageIds.length} Items Selected
                  </span>
                </div>
              ) : null
            } */}

           
          </div>

          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="custom pagination table">
              <TableHead>
                  <TableRow>
                    <TableCell>
                      {/* <Checkbox
                        checked={arraysHaveSameContents(drafts?.data?.map((a) => a.id), messageIds.map((a) => a.id))}
                        indeterminate={messageIds.length > 0 && messageIds.length < drafts?.data?.length}
                        onChange={(e,f) => {
                          if (f) {
                            let ids = drafts?.data?.map((a) => {
                              return {
                                id: a.id,
                                read: a.isRead
                              }
                            })
        
                            setMessageIds(ids)
                          } else {
                            setMessageIds([])
                          }
                        }}
                        inputProps={{ 'aria-label': 'controlled' }}
                      /> */}
                    </TableCell>
                    {/* <TableCell >Message</TableCell> */}
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
                              // onMouseEnter={() => {
                              //   setMessageId(row.id)
                              //   setShowTableActions(true)
                              // }}
                              // onMouseLeave={()=> {
                              //   setShowTableActions(false)
                              // }}
                              onClick={()=> {
                                navigate(`/users-conversations/${row.id}`, { 
                                  state: {
                                    conversationString: row.conversation_string, 
                                    conversationId: row.id ,
                                    recipientId: row.recipient_id,
                                    userId: row.user_id,
                                    resumeChat: true 
                                  }
                               })

                              }}
                            >
                              <TableCell component="th" scope="row">
                                {/* <Checkbox
                                  checked={messageIds.map((a) => a.id).includes(row.id)}
                                  onChange={(e,f) => {
                                  
                                    if(f) {
                                      setMessageIds([...messageIds, {id: row.id, read: row.isRead}])
                                    } else {
                                      setMessageIds(messageIds.filter((b) => b.id !== row.id))
                                    }
                                  }}
                                  onClick={(e)=> {
                                      e.stopPropagation()
                                  }}
                                  inputProps={{ 'aria-label': 'controlled' }}
                                /> */}
                              </TableCell>

                              <TableCell component="th" scope="row">
                                {row.recipient_id ? allUsers.find((a) => a.id === row.recipient_id )?.name : "Admin"}
                              </TableCell>

                              <TableCell component="th" scope="row">
                                {row.conversation_string}
                              </TableCell>

                              {/* {
                                renderMessageColumn(row)
                              } */}

                            
                              <TableCell style={{ width: 160 }} >
                                {moment(row.created_at).format("MMMM Do YYYY")}
                              </TableCell>

                              {/* <TableCell>
                                <div style={{display: "flex", justifyContent: "space-between"}}>
                                {
                                  (showTableActions && messageId === row.id) && (
                                    <>
                                      <Tooltip title="Edit">
                                        <EditOutlined
                                          style={{cursor: "pointer"}}
                                          onClick={(e)=> {
                                            e.stopPropagation()
                                            setRowObj(row)
                                            setEditMode(true)
                                          }}
                                        />
                                      </Tooltip>

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
                              </TableCell> */}
                            </TableRow>
                          ))
                        }
                      </>
                    )
                  }
                
                </TableBody>
            </Table>
          </TableContainer>

          {/* <Dialog
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
                You are about to delete these messages. Confirm...
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
                  bulkDeleteDrafts()
                }} 
                autoFocus
              >
                Agree
              </Button>
            </DialogActions>
          </Dialog> */}

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