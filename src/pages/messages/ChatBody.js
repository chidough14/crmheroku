import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeUser, setHide, setUsers } from '../../features/MessagesSlice';

const ChatBody = ({messages, socket}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch()
  const user = useSelector(state => state.user)
  const {users} = useSelector(state => state.message)

  const handleLeaveChat = () => {
    // localStorage.removeItem('userName');
    socket.disconnect()
    dispatch(removeUser({userName: user.name}))
    dispatch(setHide({value: true}))
    //navigate('/');
    window.location.reload();
    //socket.emit('disconnect', { userName: user.name, socketID: socket.id });
    
  };

  return (
    <>
      <header className="chat__mainHeader">
        <p>Hangout with Colleagues</p>
        <button className="leaveChat__btn" onClick={handleLeaveChat}>
          LEAVE CHAT
        </button>
      </header>

      {/*This shows messages sent from you*/}
      <div className="message__container">
        {
          messages.map((message, i) =>
            message.name === user.name ? (
              <div className="message__chats" key={message.id}>
                <p className="sender__name">You</p>
                <div className="message__sender">
                  <p>{message.text}</p>
                </div>
              </div>
            ) : (
              <div className="message__chats" key={message.id}>
                <p>{message.name}</p>
                <div className="message__recipient">
                  <p>{message.text}</p>
                </div>
              </div>
            )
          )
        }

        {/*This is triggered when a user is typing*/}
        <div className="message__status">
          <p>Someone is typing...</p>
        </div>
      </div>
    </>
  );
};

export default ChatBody;