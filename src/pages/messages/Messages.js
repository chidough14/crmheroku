import { Button } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setChatMessages, setHide } from '../../features/MessagesSlice';
import { getToken } from '../../services/LocalStorageService';
import ChatBar from './ChatBar';
import ChatBody from './ChatBody';
import ChatFooter from './ChatFooter';
import "./index.css"


const Messages = ({socket}) => {
  const [messages, setMessages] = useState([]);
  const user = useSelector(state => state.user)
  const [hideButton, setHideButton] = useState(false)
  const {hide} = useSelector(state => state.message)
  const {chatMessages} = useSelector((state) => state.message, shallowEqual)
  const dispatch = useDispatch()
  const token = getToken()
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [token])

  useEffect(() => {
    socket.on('messageResponse', (data) => setMessages([...messages, data]));
    // socket.on('messageResponse', (data) => dispatch(setChatMessages({data: data})));
  }, [socket, messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    //localStorage.setItem('userName', userName);
    //sends the username and socket ID to the Node.js server
    socket.emit('newUser', { userName: user.name, socketID: socket.id });
    dispatch(setHide({value: false}))
   
  };

  return (
    <div className="chat">
       {
          !hide ? (
            <>
              <ChatBar socket={socket} handleSubmit={handleSubmit} />
              <div className="chat__main">
                <ChatBody messages={messages}  socket={socket} />
                <ChatFooter  socket={socket} />
              </div>
            </>
          ) : (
            <Button variant='contained' type='primary' onClick={(e)=> handleSubmit(e)}>Join Chat</Button>
          )
        }
    
      
    </div>
  )
}

export default Messages