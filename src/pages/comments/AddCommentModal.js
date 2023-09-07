import { Modal, Paper, Typography } from '@mui/material'
import React from 'react'
import MuiAlert from '@mui/material/Alert';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { setChildCommentContent } from '../../features/ActivitySlice';

import { useState } from 'react';
import CommentFormQill from './CommentFormQill';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const AddCommentModal = ({
  open, 
  setOpen, 
  parentId, 
  saveComment, 
  editMode, 
  updateComment, 
  commentId,
  socket
}) => {
  const { childCommentContent } = useSelector(state => state.activity)
  const dispatch = useDispatch()
  const { allUsers, name } = useSelector(state => state.user)
  const [mentions, setMentions] = useState([]);

  const handleClose = (e) => {
    setOpen(false)
    socket.emit('user stopped typing reply',  {name, commentId}); 
    dispatch(setChildCommentContent({content: ""}))
  }

  return (
    <>
      <Modal
       open={open}
       onClose={handleClose}
       aria-labelledby="modal-modal-title"
       aria-describedby="modal-modal-description"
      >
        <Paper
          sx={{
            width: '80%', // Set the desired width here
            height: '57%', // Set the desired height here
            p: 3, // Adjust padding as needed
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <form>
            <Typography variant='h6' style={{marginBottom: "10px"}}>
                {editMode ? "Edit" : "Add"} Comment
            </Typography>

            <CommentFormQill
              saveComment={saveComment}
              allUsers={allUsers}
              parentId={parentId}
              editMode={editMode}
              childCommentContent={childCommentContent}
              updateComment={updateComment}
              reply={true}
              handleClose={handleClose}
              mode="modal"
              commentId={commentId}
              socket={socket}
            />
          </form>
        </Paper>
      </Modal>
    </>
  )
}

export default AddCommentModal