import React, { useEffect, useState } from 'react';
import { Container, Paper, TextField, Button, Typography, List, ListItem, ListItemText, Divider, Box, CircularProgress } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import instance from '../services/fetchApi';
import { useParams } from 'react-router';
import { setNewChat } from '../features/MessagesSlice';

const ChatWindow = ({scrollToBottom, setIsPopupOpen, conversationId, mode, socket, recipientId, disableButton, setDisableButton, loading}) => {

  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([
    { user: 'Admin', message: 'Hello! How can I assist you?' },
    // { user: 'user', text: 'Hi there! I have a question.' },
    // { user: 'admin', text: 'Sure, what is your question?' },
  ]);
  const { id, name,  role, allUsers } = useSelector(state => state.user) 
  const { adminchats, newChat } = useSelector(state => state.message) 
  const params = useParams()
  const dispatch = useDispatch()

  useEffect(() => {
    if (!newChat) {
      if (adminchats.length) {
        let newArr = adminchats.map((a) => {
          return {
            user: allUsers.find((b) => b.id === a.user_id)?.name,
            message: a.message
          }
        })
        setChat(newArr);
      }
    }
  
  }, [adminchats, newChat])

  const handleSend = async () => {
    let body = {
      message,
      conversation_id: parseInt(conversationId),
      // user_id: role === "super admin" || role === "admin" ? null : id,
      user_id: id
    }
    await instance.post(`/adminchats`, body)
    .then((res) => {
      let userDetails = allUsers.find((a) => a.id === res.data.chat.user_id)

      socket.emit("new_chat_message", {userId: res.data.chat.user_id, recipientId: recipientId, message: res.data.chat.message, conversation_id: res.data.chat.conversation_id})


      let username = userDetails ? userDetails.name : "Admin"

      setChat([...chat, { user: username, message: res.data.chat.message }]);
      setMessage('');
  
      scrollToBottom()
    })

  };

  useEffect(() => {
    if (conversationId) {
      socket.on('new_chat_message', (data) => {
        if (data.conversation_id === parseInt(conversationId)) {
          if (data.userId === id) {

          } else {
            let newObj = {
              user: allUsers.find((a) => a.id === data.userId)?.name,
              message: data.message
            }
            setChat(prev => [...prev, newObj]);
          }
        } else {
          console.log("null");
        }
      });
    }

  }, [socket, conversationId])

  const resumeChat = () => {
    socket.emit("chat_request_continue", {userId: id, username: name, conversationId})
    setDisableButton(false)
  }

  return (
      <Paper elevation={3} style={{ padding: '16px', minHeight: '400px' }}>
        {
          loading ? (
            <Box sx={{ display: 'flex', marginLeft: "50%" }}>
              <CircularProgress />
            </Box>
          ) : (

            <>
              <List>
                {chat.map((message, index) => (
                  <React.Fragment key={index}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={message.user}
                        secondary={message.message}
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
              <div style={{ display: 'flex', marginTop: '16px', marginBottom: "10px" }}>
                <TextField
                  label="Type a message"
                  variant="outlined"
                  fullWidth
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button variant="contained" color="primary" onClick={handleSend} style={{ marginLeft: '8px' }} disabled={disableButton}>
                  Send
                </Button>

                {
                  disableButton && (
                    <Button variant="contained" size='small' color="info" onClick={resumeChat} style={{ marginLeft: '8px' }} >
                      Resume Chat
                    </Button>
                  )
                }
              </div>
            </>

          )
        }

        {
          mode === "user" && 
          <Button 
            variant='contained' 
            color='error'
            onClick={() => {
              setIsPopupOpen(false)
              dispatch(setNewChat({newChat: false}))
            }}
          >
          Cancel
          </Button>
        }
      
      </Paper>
  );
};

export default ChatWindow;
