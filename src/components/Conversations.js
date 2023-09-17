import React, { useEffect, useRef } from 'react'
import { useLocation, useParams } from 'react-router'
import instance from '../services/fetchApi';
import { useDispatch, useSelector } from 'react-redux';
import { setAdminChats } from '../features/MessagesSlice';
import ChatWindow from './ChatWindow';

const Conversations = ({ socket }) => {
  const params = useParams()
  const location = useLocation();
  const dispatch = useDispatch()
  const { chats, recipientId } = useSelector(state => state.message)
  const chatDivRef = useRef()

  const getAdminChats = async (id) => {
    await instance.get(`/adminchats/${id}`)
    .then((res) => {
      dispatch(setAdminChats({adminchats: res.data.chats}))
      console.log(res.data.chats);
    })
  }

  const scrollToBottom = () => {
    // Scroll to the bottom of the chat div
    chatDivRef.current.scrollTop = chatDivRef.current.scrollHeight;
  };

  useEffect(() => {
    getAdminChats(params.id)
  }, [params.id])


  return (
    <div
      ref={chatDivRef}
      style={{width: "40%"}}
    >
      <ChatWindow
        mode="admin" 
        scrollToBottom={scrollToBottom} 
        conversationId={params?.id}
        socket={socket}
        recipientId={recipientId}
        conversationString={location?.state?.conversationString}
      />
    </div>
  )
}

export default Conversations