import { ArrowBack, ContentPasteOff, DeleteOutline, DeleteOutlined, EditOutlined } from '@mui/icons-material';
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Pagination, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import moment from 'moment';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import instance from '../../services/fetchApi';
import { bulkRemoveDrafts, removeDraft, setCurrentMessageId, setDrafts, setPage, setShowSingleMessage, setSingleDraft } from '../../features/MessagesSlice';
import Paper from '@mui/material/Paper';
import deltaToString from "delta-to-string-converter"
import { arraysHaveSameContents } from '../../services/checkers';
import ComposeMessage from './ComposeMessage';

const Drafts = ({setValue, socket, sendingMessage}) => {

  const { drafts, page, singleDraft } = useSelector(state => state.message)
  const [loading, setLoading] = useState(false)
  const [messageId, setMessageId] = useState();
  const [rowObj, setRowObj] = useState();
  const [showTableActions, setShowTableActions] = useState(false)
  const [messageIds, setMessageIds] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDeleteNotification, setShowDeleteNotification] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const dispatch = useDispatch()

  const handleChangePage = (event, newPage) => {
    dispatch(setPage({page: newPage}))
  };

  const isValidJson = (string) => {
    try {
      JSON.parse(string)
      return true
    } catch (error) {
      return false
    }
  }

  const getDrafts = async () => {
    setLoading(true)

    await instance.get(`/drafts`)
    .then((res) => {
      let formttedDrafts = res.data.drafts.data.map((a)=> {
        return {
          ...a,
          message: isValidJson(a.message) ? deltaToString(JSON.parse(a.message).ops) : a.message
        }
      })
      res.data.drafts.data = formttedDrafts
      dispatch(setDrafts({drafts: res.data.drafts}))
      setLoading(false)
    })
    .catch(() => {

    })
  }

  useEffect(() => {
    getDrafts()
  }, [])

  const renderMessageColumn = (row) => {
    let msg = row?.message;
    let content = "";
  
    if (isValidJson(msg)) {
      if (JSON.parse(msg).ops) {
        content = deltaToString(JSON.parse(msg).ops);
      }
    } else {
      content = msg;
    }

    content =   content.length > 15 ?
                `${content.substring(0, 15)}.....` :
                content
    
    return (
      <TableCell style={{ width: 160 }}>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </TableCell>
    );
  };

  const bulkDeleteDrafts = async () => {
    setShowDeleteNotification(true)

    if (rowObj) {
      await instance.delete(`drafts/${rowObj.id}`, {messageIds})
      .then((res) => {
        dispatch(removeDraft({draftId: rowObj.id}))
        setShowDeleteDialog(false)
      })
    } else {
      await instance.post(`bulk-delete-drafts`, {messageIds})
      .then((res) => {
        dispatch(bulkRemoveDrafts({draftIds: messageIds.map((a) => a.id)}))
        setShowDeleteDialog(false)
      })
    }

    setRowObj(undefined)
    setShowDeleteNotification(false)

  }

  return (
    <>
      {
        editMode ? (
        <>
          <ArrowBack
            onClick={() => setEditMode(false)}
          />
          <ComposeMessage
            editMode={editMode} 
            singleDraft={rowObj} 
            socket={socket} 
            sendingMessage={sendingMessage} 
          />
        </>
        ) : (

    
        <>
         
          <div style={{display: "flex"}}>
            <Typography variant='h7'><b>Drafts</b></Typography>
            
            {
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
            }

           
          </div>

          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="custom pagination table">
              <TableHead>
                  <TableRow>
                    <TableCell>
                      <Checkbox
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
                      />
                    </TableCell>
                    <TableCell >Subject</TableCell>
                    <TableCell >Message</TableCell>
                    <TableCell >Date Sent</TableCell>
                    <TableCell >Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    !drafts?.data?.length ? (
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
                          drafts?.data?.map((row) => (
                            <TableRow
                              key={row.name} 
                              sx={{cursor: "pointer"}} 
                              onMouseEnter={() => {
                                setMessageId(row.id)
                                setShowTableActions(true)
                              }}
                              onMouseLeave={()=> {
                                setShowTableActions(false)
                              }}
                              onClick={()=> {
                                // setValue(2)
                                dispatch(setShowSingleMessage({showSingleMessage: true}))
                                dispatch(setCurrentMessageId({currentMessageId: row.id}))
                                dispatch(setSingleDraft({singleDraft: row}))

                              }}
                            >
                              <TableCell component="th" scope="row">
                                <Checkbox
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
                                />
                              </TableCell>

                              <TableCell component="th" scope="row">
                                {row.subject}
                              </TableCell>

                              {
                                renderMessageColumn(row)
                              }

                            
                              <TableCell style={{ width: 160 }} >
                                {moment(row.created_at).format("MMMM Do YYYY")}
                              </TableCell>

                              <TableCell>
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
          </Dialog>

          <div style={{marginTop: "20px"}}>
            <Pagination
              count={ Math.ceil(drafts?.total / drafts?.per_page)}
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
    </>
  )
}

export default Drafts