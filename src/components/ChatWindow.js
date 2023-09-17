import React, { useEffect, useState } from 'react';
import { Container, Paper, TextField, Button, Typography, List, ListItem, ListItemText, Divider, Box, CircularProgress } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import instance from '../services/fetchApi';
import { useParams } from 'react-router';
import { setNewChat } from '../features/MessagesSlice';

const ChatWindow = ({
  scrollToBottom, 
  setIsPopupOpen, 
  conversationId, 
  mode, 
  socket, 
  recipientId, 
  disableButton, 
  setDisableButton, 
  loading, 
  conversationString,
  setShowPreviousChats
}) => {

  const [message, setMessage] = useState('');
  const { id, name,  role, allUsers } = useSelector(state => state.user) 
  const [chat, setChat] = useState([
    { user: 'Admin', message: 'Hello! How can I assist you?' }
  ]);
  const [usersTyping, setUsersTyping] = useState([]);
  const { adminchats, newChat } = useSelector(state => state.message) 
  const params = useParams()
  const dispatch = useDispatch()

  const adminMessage =  {
    backgroundColor: 'lightblue',
    // alignSelf: 'flex-start', // Align other user's messages to the left
    marginBottom: "8px",
    padding: "10px"
  }

  const myMessage = {
    backgroundColor: 'lightgreen',
    // alignSelf: 'flex-end', // Align your messages to the right
    marginBottom: "8px",
    padding: "10px"
  }

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
    } else {
      setChat([{ user: 'Admin', message: 'Hello! How can I assist you?' }])
    }
  
  }, [adminchats, newChat])

  const handleSend = async () => {
    let body = {
      message,
      conversation_id: parseInt(conversationId),
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
              message: data.message,
              userId: data.userId
            }
            setChat(prev => [...prev, newObj]);
          }
        } else {
          console.log("null");
        }
      });
    }

  }, [socket, conversationId])

  const renderName = (user) => {
     let userRole = allUsers.find((a) => a.id === user.userId)?.role

     if (userRole === "admin" || userRole === "super admin") {
       return <Typography variant="h7">{`${user.user} - Admin`}</Typography> 
     } else {
      return <Typography variant="h7">{`${user.user}`}</Typography> 
     }
  }

  const resumeChat = () => {
    socket.emit("chat_request_continue", {userId: id, username: name, conversationId, conversationString})
    setDisableButton(false)
  }

  const usersTypingSet = new Set(usersTyping);

  useEffect(() => {
    // Listen for 'user typing' events from the server
    socket.on('typing_message', (data) => {
      if (data.userId !== id && data.conversationString === conversationString) {
        if (!usersTypingSet.has(data.name)) {
          usersTypingSet.add(allUsers.find((a) => a.id === data.userId)?.name);
          // Convert the Set back to an array and update the state
          setUsersTyping(Array.from(usersTypingSet));
        }
      }

    });
  
    // Listen for 'user stopped typing' events from the server
    socket.on('stopped_typing_message', (data) => {
      if (data.userId !== id && data.conversationString === conversationString) {
        usersTypingSet.delete(allUsers.find((a) => a.id === data.userId)?.name);
        // Convert the Set back to an array and update the state
        setUsersTyping(Array.from(usersTypingSet));
      }
    });
  
    // Clean up event listeners when the component unmounts
    return () => {
      socket.off('typing_message');
      socket.off('stopped_typing_message');
    };
  }, [conversationString]);
  
  const handleTyping = () => {
    socket.emit("typing_message", {userId: id, recipientId: recipientId, conversation_id: conversationId, conversationString})
  };
  
  const handleStoppedTyping = () => {
    socket.emit("stopped_typing_message", {userId: id, recipientId: recipientId, conversation_id: conversationId, conversationString})
  
  };

  return (
      <Paper elevation={3} style={{ padding: '16px', minHeight: '400px' }}>
        {
          loading ? (
            <Box sx={{ display: 'flex', marginLeft: "50%" }}>
              <CircularProgress />
            </Box>
          ) : (

            <>

              <div 
                style={{
                  width: '100%',
                  maxWidth: 400,
                  margin: '0 auto',
                  padding: "10px",
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end', // Align messages to the right
                }}
              >
                <Typography style={{margin: "auto"}} variant="h6">{conversationString}</Typography> 
                {chat.map((message, index) => (
                  <div  style={{alignSelf: message.user === name || (message.user === "Admin" && role === "super admin") ? "flex-end" : "flex-start"}}>
                    {
                      renderName(message)
                    }
                    <Paper
                      key={index}
                      style={message.user === name || (message.user === "Admin" && role === "super admin")  ? myMessage : adminMessage}
                      elevation={3}
                    >
              
                      <Typography variant="body1">{message.message}</Typography>

                    </Paper>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', marginTop: '16px', marginBottom: "10px" }}>
                <TextField
                  label="Type a message"
                  variant="outlined"
                  fullWidth
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyUp={handleTyping}
                  onBlur={handleStoppedTyping}
                />

                <div>
                  {usersTyping?.length && usersTyping.map((user) => (
                    <p key={user}>{user} is typing...</p>
                  ))}
                </div>


                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleSend} 
                  style={{ marginLeft: '8px', borderRadius: "30px",  }} 
                  disabled={disableButton}
                >
                  Send
                </Button>

                {
                  disableButton && (
                    <Button 
                      variant="contained" 
                      size='small' 
                      color="info" 
                      onClick={resumeChat} 
                      style={{ marginLeft: '8px', borderRadius: "30px",  }} 
                    >
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
              setShowPreviousChats(false)
              dispatch(setNewChat({newChat: false}))
            }}
            style={{ borderRadius: "30px",  }} 
          >
          Cancel
          </Button>
        }
      
      </Paper>
  );
};

export default ChatWindow;
