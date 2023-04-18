import { Button } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setUsers } from '../../features/MessagesSlice';

const ChatBar = ({ socket }) => {
  //const [users, setUsers] = useState([]);
  const dispatch = useDispatch()
  const {users} = useSelector(state => state.message)



  useEffect(() => {

    socket.on('newUserResponse', (data) => {
      console.log(data);
      //setUsers(data)
      dispatch(setUsers({users: data}))
    });
  }, [socket, users]);

  return (
    <div className="chat__sidebar">


      <div>
       
        <h4 className="chat__header">ACTIVE USERS</h4>
        <div className="chat__users">
          {
            users.map((user) => (
              <p key={user.socketID}>{user.userName}</p>
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default ChatBar