import { Button, Paper, TextField, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import instance from '../services/fetchApi';
import { useDispatch, useSelector } from 'react-redux';
import { setUsersChats } from '../features/MessagesSlice';

const UserToUserChat = ({socket}) => {
  const location = useLocation()
  const [chat, setChat] = useState([]);
  const [usersTyping, setUsersTyping] = useState([]);
  const [message, setMessage] = useState('');
  const { id, name, role, allUsers } = useSelector(state => state.user)
  const { userschats } = useSelector(state => state.message)
  const chatDivRef = useRef(null);
  const [disabled, setDisabled] = useState(false)
  const [conversationId, setConversationId] = useState(location?.state?.conversationId);
  const dispatch = useDispatch()

  const otherUsersMessage =  {
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

  const fetchChatMessages = async (id) => [
    await instance.get(`users-chats/${id}`)
    .then((res) => {
      dispatch(setUsersChats({userschats: res.data.chats}))
    })
  ]

  useEffect(() => {
    setConversationId(location?.state?.conversationId)
    fetchChatMessages(location?.state?.conversationId)
 
  }, [location?.state?.conversationId])

  useEffect(() => {
    if (userschats.length) {
      let newArr = userschats.map((a) => {
        return {
          user: allUsers.find((b) => b.id === a.user_id)?.name,
          message: a.message,
          userId: a.userId
        }
      })
      setChat(newArr);
    } else {
      setChat(userschats);
    }
  
  }, [userschats])
  
  useEffect(() => {
    socket.on('new_users_chat_message', (data) => {
      // if (data.conversation_id === parseInt(location?.state?.conversationId)) {
      if (data.conversation_id === parseInt(conversationId)) {
        let newObj = {
          user: allUsers.find((a) => a.id === data.userId)?.name,
          message: data.message,
          userId: data.userId
        }
        setChat(prev => [...prev, newObj]);
      } else {
        console.log("null");
      }
    });
    

  }, [socket, conversationId])

  const scrollToBottom = () => {
    // Scroll to the bottom of the chat div
    if (chatDivRef.current) {
      chatDivRef.current.scrollTop = chatDivRef.current.scrollHeight;
    }
  };

  const handleSend = async () => {
    let body = {
      message,
      conversation_id: parseInt(location?.state?.conversationId),
      user_id: id,
      recipient_id: location?.state?.recipientId
    }
    await instance.post(`/users-chats`, body)
    .then((res) => {
      let userDetails = allUsers.find((a) => a.id === res.data.chat.user_id)

      socket.emit("new_users_chat_message", {
        userId: res.data.chat.user_id, 
        recipientId: res.data.chat.recipient_id, 
        message: res.data.chat.message, 
        conversation_id: res.data.chat.conversation_id
      })

      setChat([...chat, { user: userDetails.name, message: res.data.chat.message }]);
      setMessage('');
  
      scrollToBottom()
    })
  }

  useEffect(() => {
     if (location?.state?.resumeChat) {
       setDisabled(true)
     } else {
      setDisabled(false)
     }
  }, [location?.state?.resumeChat])

//   const renderName = (user) => {
//     let userRole = allUsers.find((a) => a.id === user.userId)?.role

//     if (userRole === "admin" || userRole === "super admin") {
//       return <Typography variant="h7">{`${user.user} - Admin`}</Typography> 
//     } else {
//      return <Typography variant="h7">{`${user.user}`}</Typography> 
//     }
//  }

const usersTypingSet = new Set(usersTyping);

useEffect(() => {
  socket.on('typing_message', (data) => {
    if (data.userId !== id && data.conversationString === location?.state?.conversationString && data.mode === "user-user") {
      if (!usersTypingSet.has(data.name)) {
        usersTypingSet.add(allUsers.find((a) => a.id === data.userId)?.name);
        setUsersTyping(Array.from(usersTypingSet));
      }
    }

  });

  socket.on('stopped_typing_message', (data) => {
    if (data.userId !== id && data.conversationString === location?.state?.conversationString && data.mode === "user-user") {
      usersTypingSet.delete(allUsers.find((a) => a.id === data.userId)?.name);
      setUsersTyping(Array.from(usersTypingSet));
    }
  });

  return () => {
    socket.off('typing_message');
    socket.off('stopped_typing_message');
  };
}, [location?.state?.conversationString]);

  const data =  {
    userId: id, 
    recipientId: location?.state?.recipientId, 
    conversation_id: conversationId, 
    conversationString: location?.state?.conversationString,
    mode: "user-user"
  }

  const handleTyping = () => {
    socket.emit("typing_message", data)
  };

  const handleStoppedTyping = () => {
    socket.emit("stopped_typing_message", data)

  };

  return (
    <div
      style={{
        width: '500px',
        maxHeight: '600px', // Set maximum height
        overflowY: 'auto', // Enable vertical scrollbar when the content exceeds maxHeight
        zIndex: 1000,
        backgroundColor: 'white',
        boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.5)',
      }}
      ref={chatDivRef}
    > 
      <Paper elevation={3} style={{ padding: '16px', minHeight: '400px' }}>
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
          <Typography style={{margin: "auto"}} variant="h6">{location?.state?.conversationString}</Typography> 
          {chat.map((message, index) => (
            <div  style={{alignSelf: message.user === name ? "flex-end" : "flex-start"}}>
              {/* {
                renderName(message)
              } */}
              <Typography variant="h7">{`${message.user}`}</Typography> 
              <Paper
                key={index}
                style={message.user === name  ? myMessage : otherUsersMessage}
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
            {usersTyping?.length ? usersTyping.map((user) => (
              <p key={user}>{user} is typing...</p>
            )) : null}
          </div>

          {
            disabled ? (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={()=> {
                  setDisabled(false)
                  socket.emit("users_chat_request_continue", {
                    userId: id, 
                    username: name, 
                    conversationId: location?.state?.conversationId, 
                    recipientId: location?.state?.recipientId,
                    conversationString: location?.state?.conversationString
                  })
                }} 
                style={{ marginLeft: '8px', borderRadius: "30px",  }} 
                // disabled={disableButton}
              >
                Resume chat
              </Button>
            ) : null
          }


          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSend} 
            style={{ marginLeft: '8px', borderRadius: "30px",  }} 
            disabled={disabled}
          >
            Send
          </Button>
        </div>
      </Paper>
    </div>
  )
}

export default UserToUserChat