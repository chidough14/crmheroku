import { ContentPasteOff, DeleteOutline, EditOutlined } from '@mui/icons-material';
import { Checkbox, Pagination, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import moment from 'moment';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import instance from '../../services/fetchApi';
import { setCurrentMessageId, setDrafts, setPage, setShowSingleMessage, setSingleDraft } from '../../features/MessagesSlice';
import Paper from '@mui/material/Paper';
import deltaToString from "delta-to-string-converter"
import { arraysHaveSameContents } from '../../services/checkers';

const Drafts = ({setValue}) => {

  const { drafts, page } = useSelector(state => state.message)
  const [loading, setLoading] = useState(false)
  const [messageId, setMessageId] = useState();
  const [showTableActions, setShowTableActions] = useState(false)
  const [messageIds, setMessageIds] = useState([]);
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

  return (
    <>
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
                          sx={{  cursor: "pointer"}} 
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
                                        
                                      }}
                                    />
                                  </Tooltip>

                                  <Tooltip title="Delete">
                                    <DeleteOutline
                                      style={{cursor: "pointer"}}
                                      onClick={(e)=> {
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

export default Drafts