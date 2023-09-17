import React from 'react'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, CircularProgress } from '@mui/material';
import { setNewChat } from '../features/MessagesSlice';

const ChatHistory = ({getChats, loading, setIsPopupOpen, setShowPreviousChats}) => {
  const { conversations } = useSelector(state => state.message)
  const dispatch = useDispatch()

  return (
    <>
    {
      loading ? (
        <Box sx={{ display: 'flex', marginLeft: "50%" }}>
          <CircularProgress />
        </Box>
      )  : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>String</TableCell>
                <TableCell>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
              conversations.length ?
              conversations?.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  onClick={() => getChats(row)}
                  style={{cursor: "pointer"}}
                >
                  <TableCell component="th" scope="row">
                    {row.user_id}
                  </TableCell>
                  <TableCell>{row.conversation_string}</TableCell>
                  <TableCell>{row.created_at}</TableCell>
                </TableRow>
              )) : null }
            </TableBody>
          </Table>
        </TableContainer>
      )
    }
   
   <Button 
    variant='contained' 
    color='error'
    onClick={() => {
      setIsPopupOpen(false)
      setShowPreviousChats(false)
      dispatch(setNewChat({newChat: false}))
    }}
  >
  Cancel
  </Button>
    </>
  )
}

export default ChatHistory