import React, { useCallback, useEffect, useState } from 'react';
import { Paper, TextField, Button, Typography,  Box, CircularProgress } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import instance from '../services/fetchApi';
import { useParams } from 'react-router';
import { setNewChat } from '../features/MessagesSlice';
import { Done, DoneAll, DownloadOutlined, FilePresent, UploadFileOutlined } from '@mui/icons-material';
import { init } from 'emoji-mart'
import emojiData from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import moment from 'moment';
import { checkFileType } from '../services/checkers';

init({ emojiData })

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
  const [chat, setChat] = useState([]);
  const [usersTyping, setUsersTyping] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentFile, setCurrentFile] = useState("")
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

  // useEffect(() => {
  //   if (!newChat) {
  //     if (adminchats.length) {
  //       let newArr = adminchats.map((a) => {
  //         return {
  //           user: allUsers.find((b) => b.id === a.user_id)?.name,
  //           message: a.message,
  //           userId: a.user_id,
  //           createdAt: a.created_at
  //         }
  //       })
  //       setChat(newArr);
  //     }
  //   } else {
  //     setChat([])
  //   }
  
  // }, [adminchats, newChat])

  useEffect(() => {
    if (!newChat) {
      if (adminchats.length) {
        let newArr = adminchats.map((a) => {
          return {
            user: allUsers.find((b) => b.id === a.user_id)?.name,
            message: a.message,
            userId: a.user_id,
            files: a.files,
            createdAt: a.created_at
          };
        });
        setChat(newArr);
      } else {
        setChat([]);
      }
    } else {
      setChat([]);
    }
  
    if (conversationId) {
      socket.on('new_chat_message', (data) => {
        if (data.conversation_id === parseInt(conversationId)) {
          if (data.userId === id) {
            // Handle the case when the message is sent by the current user
          } else {
            let newObj = {
              user: allUsers.find((a) => a.id === data.userId)?.name,
              message: data.message,
              userId: data.userId,
              files: data.files || null,
              createdAt: data.createdAt
            };
            setChat((prev) => [...prev, newObj]);
          }
        } else {
          console.log('null');
        }
      });
    }
  
    socket.on('typing_message', (data) => {
      if (data.userId !== id && data.conversationString === conversationString) {
        if (!usersTypingSet.has(data.name)) {
          usersTypingSet.add(allUsers.find((a) => a.id === data.userId)?.name);
          setUsersTyping(Array.from(usersTypingSet));
        }
      }
    });
  
    socket.on('stopped_typing_message', (data) => {
      if (data.userId !== id && data.conversationString === conversationString) {
        usersTypingSet.delete(allUsers.find((a) => a.id === data.userId)?.name);
        setUsersTyping(Array.from(usersTypingSet));
      }
    });
  
    // Clean up event listeners when the component unmounts
    return () => {
      socket.off('new_chat_message');
      socket.off('typing_message');
      socket.off('stopped_typing_message');
    };
  }, [adminchats, newChat, socket, conversationId, id, allUsers, conversationString, usersTypingSet]);
  

  const handleSend = async () => {
    setChat((prevChat) => [...prevChat, { user: name, message, sending: true, user_id: id }]);
    setMessage('');
  
    scrollToBottom();

    let body = {
      message,
      conversation_id: parseInt(conversationId),
      user_id: id
    }
    await instance.post(`/adminchats`, body)
    .then((res) => {

      socket.emit("new_chat_message", {
        userId: res.data.chat.user_id, 
        recipientId: recipientId, 
        message: res.data.chat.message, 
        conversation_id: res.data.chat.conversation_id,
        createdAt: res.data.chat.created_at
      })

      setChat((prevChat) => {
        const updatedChat = [...prevChat];
        updatedChat[prevChat.length - 1].sending = false;
        updatedChat[prevChat.length - 1].createdAt = res.data.chat.created_at;
        return updatedChat;
      });
    })

  };

  // useEffect(() => {
  //   if (conversationId) {
  //     socket.on('new_chat_message', (data) => {
  //       if (data.conversation_id === parseInt(conversationId)) {
  //         if (data.userId === id) {

  //         } else {
  //           let newObj = {
  //             user: allUsers.find((a) => a.id === data.userId)?.name,
  //             message: data.message,
  //             userId: data.userId,
  //             createdAt: data.createdAt
  //           }
  //           setChat(prev => [...prev, newObj]);
  //         }
  //       } else {
  //         console.log("null");
  //       }
  //     });
  //   }

  // }, [socket, conversationId])

  const renderName = (user) => {
     let userRole = allUsers.find((a) => a.id === user.userId)?.role

     if (user.user === name) {
       return <Typography variant="h7">Me</Typography> 
     } else {
      if (userRole === "admin" || userRole === "super admin") {
        return <Typography variant="h7">{`${user.user} - Admin`}</Typography> 
      } else {
        return <Typography variant="h7">{`${user.user}`}</Typography> 
      }
     }
  }

  const resumeChat = () => {
    socket.emit("chat_request_continue", {userId: id, username: name, conversationId, conversationString})
    setDisableButton(false)
  }

  const usersTypingSet = new Set(usersTyping);

  // useEffect(() => {
  //   socket.on('typing_message', (data) => {
  //     if (data.userId !== id && data.conversationString === conversationString) {
  //       if (!usersTypingSet.has(data.name)) {
  //         usersTypingSet.add(allUsers.find((a) => a.id === data.userId)?.name);
  //         // Convert the Set back to an array and update the state
  //         setUsersTyping(Array.from(usersTypingSet));
  //       }
  //     }

  //   });
  
  //   socket.on('stopped_typing_message', (data) => {
  //     if (data.userId !== id && data.conversationString === conversationString) {
  //       usersTypingSet.delete(allUsers.find((a) => a.id === data.userId)?.name);
  //       // Convert the Set back to an array and update the state
  //       setUsersTyping(Array.from(usersTypingSet));
  //     }
  //   });
  
  //   // Clean up event listeners when the component unmounts
  //   return () => {
  //     socket.off('typing_message');
  //     socket.off('stopped_typing_message');
  //   };
  // }, [conversationString]);
  
  const handleTyping = () => {
    socket.emit("typing_message", {userId: id, recipientId: recipientId, conversation_id: conversationId, conversationString})
  };
  
  const handleStoppedTyping = () => {
    socket.emit("stopped_typing_message", {userId: id, recipientId: recipientId, conversation_id: conversationId, conversationString})
  
  };

  const insertEmoji = (emoji) => {
    setMessage(message + emoji.native);
  };

  const handleFileUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*, application/pdf, application/vnd.ms-excel, text/csv'; // Updated accept attribute

    input.onchange = async (e) => {
      const file = e.target.files[0];

      setMessage('');
    
      scrollToBottom();

      if (file) {
        const formData = new FormData();
        formData.append('file', file); 
        formData.append('message', "IM");
        formData.append('conversation_id', parseInt(conversationId));
        formData.append('user_id', id);
  
        try {
          const res = await instance.post(`/upload-adminchatfiles-and-save`, formData);

          socket.emit("new_chat_message", {
            userId: parseInt(res.data.chat.user_id),
            recipientId: recipientId,
            message: res.data.chat.message,
            conversation_id: parseInt(res.data.chat.conversation_id),
            createdAt: res.data.chat.created_at,
            files: res.data.filePath
          });

          setChat((prevChat) => [...prevChat, 
            { 
              user: name, 
              message: res.data.chat.message, 
              files: res.data.filePath, 
              sending: false, 
              createdAt: res.data.chat.created_at 
            }
          ]);
        
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      }
    };
    input.click();
  }, []);

  const downloadFile = async (filename) => {
    try {
      const response = await instance.get(`download-file/${filename}`, {
        responseType: 'blob', // Important for binary data
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename); // Change the filename as needed
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const renderFiles = (files) => {
   
    const isImage = checkFileType(files) === "image";

    return (
      <>
        <div
          style={{
            marginRight: "20px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            marginTop: "40px",
            flex: "1 1 calc(25% - 20px)"
          }}
          onMouseEnter={() => {
            setCurrentFile(files)
          }}
          onMouseLeave={() => {
            setCurrentFile("")
          }}
        >
          <div>
            {isImage ? (
              <img
                src={`${process.env.REACT_APP_BASE_URL}${files}`}
                alt="Image"
                style={{ height: "100px" }}
              />
            ) : (
              <FilePresent />
            )}

            {
              (currentFile === files) && (
                <>
                  <span
                    style={{ marginLeft: "6px", cursor: "pointer" }}
                    onClick={() => {
                      downloadFile(files.replace("files/", ""))
                    }}
                  >
                    <DownloadOutlined />
                  </span>
                </>
              )
            }
          
          </div>
          <p>{files.replace("files/", "")}</p>
        </div>
      </>
    );
  
  };


  return (
    <>
      <Paper elevation={3} style={{ padding: '16px', minHeight: '600px' }}>
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
                  <div  style={{alignSelf: message.user === name || (message.user === "Admin" && (role === "super admin" || role === "admin")) ? "flex-end" : "flex-start"}}>
                    {
                      renderName(message)
                    }

                    <p style={{fontSize: "12px", marginTop: "-4px", marginBottom: "-4px"}}>{`${moment(message.createdAt).format("MMMM Do YYYY, h:mm a")}`}</p>
                   
                    <div style={{display: "flex", justifyContent: "space-between"}}>
                      <Paper
                        key={index}
                        style={message.user === name || (message.user === "Admin" && (role === "super admin" || role === "admin"))  ? myMessage : adminMessage}
                        elevation={3}
                      >
                
                        {
                          message.files ? renderFiles(message.files) :  <Typography variant="body1">{message.message}</Typography>
                        }
                       

                      </Paper>

                      {
                        message.user === name || (message.user === "Admin" && (role === "super admin" || role === "admin")) ? (
                          <span  style={{color:  message.sending ? null : "blue"}} >
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
                  <UploadFileOutlined 
                    onClick={() => handleFileUpload()}
                    style={{cursor: "pointer"}}
                  />
                </div>

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

      {
        showEmojiPicker && (
          <div
            style={{
              position: 'absolute',
              top: "300px",
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
  );
};

export default ChatWindow;
