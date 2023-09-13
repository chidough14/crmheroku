import React, { useEffect, useRef, useState } from 'react';
import { ChatRounded, CloseRounded } from '@mui/icons-material';
import ChatWindow from './ChatWindow';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import instance from '../services/fetchApi';
import { useDispatch, useSelector } from 'react-redux';
import ChatHistory from './ChatHistory';
import { setAdminChats, setConversations, setNewChat } from '../features/MessagesSlice';

function ChatButton({socket}) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [showPreviousChats, setShowPreviousChats] = useState(false);
  const [disableButton, setDisableButton] = useState(false);
  const [conversationId, setConversationId] = useState();
  const [recipientId, setRecipientId] = useState();
  const [loading, setLoading] = useState(false);
  const { id, name } = useSelector(state => state.user)
  const dispatch = useDispatch()
  const chatDivRef = useRef(null);

  const scrollToBottom = () => {
    // Scroll to the bottom of the chat div
    if (chatDivRef.current) {
      chatDivRef.current.scrollTop = chatDivRef.current.scrollHeight;
    }
  };

  // Use useEffect to automatically scroll to the bottom when isChatOpen is true
  // useEffect(() => {
  
  //   if (isChatOpen) {
  //     scrollToBottom();
  //   }
  // }, [isChatOpen]);

  const generateRandomId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 6;
    let randomId = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomId += characters.charAt(randomIndex);
    }
  
    return randomId;
  }

  const addConversation = async () => {
    dispatch(setNewChat({newChat: true}))
    let randomId = generateRandomId()
    // setConversationId(randomId)

    let body = {
      conversation_string: randomId
    }

    await instance.post(`conversations`, body)
    .then((res) => {
       console.log(res);
       setConversationId(res.data.conversation.id)
       setRecipientId(res.data.conversation.user_id)
       socket.emit("chat_request", {userId: res.data.conversation.user_id, username: name, conversationId: res.data.conversation.id})
      // socket.emit("chat_request", {sender: id,  conversationId: res.data.conversation.id})

    })
  }

  const getConversations = async () => {
    setLoading(true)
    await instance.get(`conversations`)
    .then((res) => {
       console.log(res);
       dispatch(setConversations({conversations: res.data.conversations}))
       setLoading(false)

    })
  }

  const getChats = async (conversation_id) => {
    setLoading(true)
    setShowPreviousChats(false)
    setConversationId(conversation_id)
    setDisableButton(true)

    await instance.get(`adminchats/${conversation_id}`)
    .then((res) => {
       dispatch(setAdminChats({adminchats: res.data.chats}))
       setLoading(false)
      //  socket.emit("chat_request_continue", {userId: id, username: name, conversationId: conversation_id})
    })
  }

  useEffect(() => {
  
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [isChatOpen]);

  return (
    <>
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          cursor: 'pointer',
        }}
        onClick={() => {
          setIsChatOpen(true);
        }}
      >
        <ChatRounded fontSize="large" color="primary" />
      </div>

      {isPopupOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px', // 20px above the button
            right: '20px',
            width: '500px',
            maxHeight: '600px', // Set maximum height
            overflowY: 'auto', // Enable vertical scrollbar when the content exceeds maxHeight
            zIndex: 1000,
            backgroundColor: 'white',
            boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.5)',
          }}
          ref={chatDivRef}
        > 
          {
            showPreviousChats ? (
              <ChatHistory
                getChats={getChats}
                loading={loading}
                setIsPopupOpen={setIsPopupOpen} 
              />
            ) : (
              <ChatWindow 
                scrollToBottom={scrollToBottom} 
                setIsPopupOpen={setIsPopupOpen} 
                conversationId={conversationId}
                mode="user" 
                socket={socket}
                disableButton={disableButton}
                setDisableButton={setDisableButton}
                recipientId={recipientId}
                loading={loading}
              />
            )
          }
        
        </div>
      )}

      <Dialog 
        open={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        PaperProps={{ style: { position: 'absolute', bottom: '60px', right: '20px' } }}
      >
        <DialogTitle>Chat Dialog</DialogTitle>
        <DialogContent>
          <Button 
            variant='contained' 
            color="info" 
            onClick={() => {
              addConversation()
              setIsPopupOpen(true)
              setIsChatOpen(false)
            }}
          >
            New chat
          </Button>

          <Button 
            variant='contained'  
            color="warning"
            onClick={() => {
              getConversations()
              setIsPopupOpen(true)
              setShowPreviousChats(true)
              setIsChatOpen(false)
            }}
          >
            Previous chats
          </Button>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setIsChatOpen(false)
              dispatch(setNewChat({newChat: false}))
            }} 
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ChatButton;
