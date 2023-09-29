import { Button, Paper, TextField, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import instance from '../services/fetchApi';
import { useDispatch, useSelector } from 'react-redux';
import { setUsersChats } from '../features/MessagesSlice';
import { AssignmentInd, Done, DoneAll } from '@mui/icons-material';
import { init } from 'emoji-mart'
import emojiData from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import moment from 'moment';

init({ emojiData })

const UserToUserChat = ({socket}) => {
  const location = useLocation()
  const [chat, setChat] = useState([]);
  const [usersTyping, setUsersTyping] = useState([]);
  const [message, setMessage] = useState('');
  const { id, name, role, allUsers } = useSelector(state => state.user)
  const { userschats } = useSelector(state => state.message)
  const chatDivRef = useRef(null);
  const [disabled, setDisabled] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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

  // useEffect(() => {
  //   setConversationId(location?.state?.conversationId)
  //   fetchChatMessages(location?.state?.conversationId)
 
  // }, [location?.state?.conversationId])

  // useEffect(() => {
  //   if (userschats.length) {
  //     let newArr = userschats.map((a) => {
  //       return {
  //         user: allUsers.find((b) => b.id === a.user_id)?.name,
  //         message: a.message,
  //         userId: a.user_id,
  //         createdAt: a.created_at
  //       }
  //     })
  //     setChat(newArr);
  //   } else {
  //     setChat(userschats);
  //   }
  
  // }, [userschats])
  
  // useEffect(() => {
  //   socket.on('new_users_chat_message', (data) => {
  //     // if (data.conversation_id === parseInt(location?.state?.conversationId)) {
  //     if (data.conversation_id === parseInt(conversationId)) {
  //       let newObj = {
  //         user: allUsers.find((a) => a.id === data.userId)?.name,
  //         message: data.message,
  //         userId: data.userId,
  //         createdAt: data.createdAt
  //       }
  //       setChat(prev => [...prev, newObj]);
  //     } else {
  //       console.log("null");
  //     }
  //   });
    

  // }, [socket, conversationId])

  useEffect(() => {
    // Set conversationId and fetch chat messages when location changes
    const conversationId = location?.state?.conversationId;
    setConversationId(conversationId);
    fetchChatMessages(conversationId);
  
    // Handle socket events for new messages
    const handleNewMessage = (data) => {
      if (data.conversation_id === parseInt(conversationId)) {
        const newObj = {
          user: allUsers.find((a) => a.id === data.userId)?.name,
          message: data.message,
          userId: data.userId,
          createdAt: data.createdAt,
        };
        setChat((prev) => [...prev, newObj]);
      } else {
        console.log("null");
      }
    };
  
    socket.on('new_users_chat_message', handleNewMessage);
  
    return () => {
      socket.off('new_users_chat_message', handleNewMessage);
    };
  }, [socket, location?.state?.conversationId, conversationId, allUsers]);
  
  useEffect(() => {
    // Set chat based on userschats
    if (userschats.length) {
      const newArr = userschats.map((a) => ({
        user: allUsers.find((b) => b.id === a.user_id)?.name,
        message: a.message,
        userId: a.user_id,
        createdAt: a.created_at,
      }));
      setChat(newArr);
    } else {
      setChat(userschats);
    }
  }, [userschats, allUsers]);
  
  useEffect(() => {
    // Set disabled state based on location.state.resumeChat
    setDisabled(location?.state?.resumeChat);
  }, [location?.state?.resumeChat]);
  
  const usersTypingSet = new Set(usersTyping);
  
  useEffect(() => {
    // Handle socket events for typing and stopped typing messages
    const handleTypingMessage = (data) => {
      if (
        data.userId !== id &&
        data.conversationString === location?.state?.conversationString &&
        data.mode === "user-user"
      ) {
        if (!usersTypingSet.has(data.name)) {
          usersTypingSet.add(allUsers.find((a) => a.id === data.userId)?.name);
          setUsersTyping(Array.from(usersTypingSet));
        }
      }
    };
  
    const handleStoppedTypingMessage = (data) => {
      if (
        data.userId !== id &&
        data.conversationString === location?.state?.conversationString &&
        data.mode === "user-user"
      ) {
        usersTypingSet.delete(allUsers.find((a) => a.id === data.userId)?.name);
        setUsersTyping(Array.from(usersTypingSet));
      }
    };
  
    socket.on('typing_message', handleTypingMessage);
    socket.on('stopped_typing_message', handleStoppedTypingMessage);
  
    return () => {
      socket.off('typing_message', handleTypingMessage);
      socket.off('stopped_typing_message', handleStoppedTypingMessage);
    };
  }, [socket, location?.state?.conversationString, id, usersTypingSet, allUsers]);
  
  
  

  const scrollToBottom = () => {
    // Scroll to the bottom of the chat div
    if (chatDivRef.current) {
      chatDivRef.current.scrollTop = chatDivRef.current.scrollHeight;
    }
  };

  const handleSend = async () => {
    setChat((prevChat) => [...prevChat, { user: name, message, sending: true }]);
    setMessage('');
  
    scrollToBottom();
  
    let body = {
      message,
      conversation_id: parseInt(location?.state?.conversationId),
      user_id: id,
      recipient_id: location?.state?.recipientId
    };
  
    try {
      const res = await instance.post(`/users-chats`, body);
  
      socket.emit("new_users_chat_message", {
        userId: res.data.chat.user_id,
        recipientId: res.data.chat.recipient_id,
        message: res.data.chat.message,
        conversation_id: res.data.chat.conversation_id,
        createdAt: res.data.chat.created_at
      });

      setChat((prevChat) => {
        const updatedChat = [...prevChat];
        updatedChat[prevChat.length - 1].sending = false;
        updatedChat[prevChat.length - 1].createdAt = res.data.chat.created_at;
        return updatedChat;
      });

    } catch (error) {
      console.error(error);
    }
  };
  

//   useEffect(() => {
//      if (location?.state?.resumeChat) {
//        setDisabled(true)
//      } else {
//       setDisabled(false)
//      }
//   }, [location?.state?.resumeChat])

// const usersTypingSet = new Set(usersTyping);

// useEffect(() => {
//   socket.on('typing_message', (data) => {
//     if (data.userId !== id && data.conversationString === location?.state?.conversationString && data.mode === "user-user") {
//       if (!usersTypingSet.has(data.name)) {
//         usersTypingSet.add(allUsers.find((a) => a.id === data.userId)?.name);
//         setUsersTyping(Array.from(usersTypingSet));
//       }
//     }

//   });

//   socket.on('stopped_typing_message', (data) => {
//     if (data.userId !== id && data.conversationString === location?.state?.conversationString && data.mode === "user-user") {
//       usersTypingSet.delete(allUsers.find((a) => a.id === data.userId)?.name);
//       setUsersTyping(Array.from(usersTypingSet));
//     }
//   });

//   return () => {
//     socket.off('typing_message');
//     socket.off('stopped_typing_message');
//   };
// }, [location?.state?.conversationString]);

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

  const insertEmoji = (emoji) => {
    setMessage(message + emoji.native);
  };

  const renderName = (username) => {
    if (username === name) {
      return "Me"
    } else {
      return username
    }
  };

  return (
    <>
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
            <Typography style={{margin: "auto"}} variant="h6">
              {location?.state?.conversationString}  
              
              {location?.state?.creator === id ? (
                <AssignmentInd />
              ) : null}
            </Typography> 
            {chat.map((message, index) => (
              <div  style={{alignSelf: message.user === name ? "flex-end" : "flex-start"}}>
                <Typography variant="h7">
                  { renderName(message.user) }
                </Typography> 
                <p style={{fontSize: "12px", marginTop: "-4px", marginBottom: "-4px"}}>{`${moment(message.createdAt).format("MMMM Do YYYY, h:mm a")}`}</p>

                <div style={{display: "flex", justifyContent: "space-between"}}>
                  <Paper
                    key={index}
                    style={message.user === name  ? myMessage : otherUsersMessage}
                    elevation={3}
                  >
                    <Typography variant="body1">
                    {message.message?.split(' ').map((word, index) => (
                      <React.Fragment key={index}>
                        {word.startsWith(':') && word.endsWith(':') ? (
                          <em-emoji shortcodes={word} size={16} ></em-emoji>
                        ) : (
                          word + ' '
                        )}
                      </React.Fragment>
                    ))}
                    </Typography>

                  </Paper>
                  
                  {
                    message.user === name ? (
                      <span style={{color:  message.sending ? null : "blue"}} >
                        {
                          message.sending ? (
                            <Done />
                          ) : (
                            <DoneAll />
                          )
                        }
                      
                      </span>
                    ) : null
                  }
                
                </div> 
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

            <div
              style={{
                position: 'relative',
                zIndex: 1000,
                cursor: 'pointer',
              }}
            >
              <Button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                😄
              </Button>
            </div>

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

      {
        showEmojiPicker && (
          <div
            style={{
              position: 'absolute',
              bottom: '120px', // 20px above the button
              // right: '20px',
              // width: '500px',
              maxHeight: '600px', // Set maximum height
              overflowY: 'auto', // Enable vertical scrollbar when the content exceeds maxHeight
              zIndex: 1000,
              backgroundColor: 'white',
              boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.5)',
            }}
          > 
            <Picker data={emojiData} onEmojiSelect={insertEmoji} />
          </div>
        )
      }
    </>
  )
}

export default UserToUserChat