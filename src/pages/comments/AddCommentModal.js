import { Box, Button, Modal, TextField, Typography } from '@mui/material'
import React from 'react'
import MuiAlert from '@mui/material/Alert';
import * as yup from 'yup';
import { useFormik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { setChildCommentContent } from '../../features/ActivitySlice';
import { MentionsInput, Mention } from 'react-mentions'
import defaultMentionStyles from './defaultMentionStyles'
import defaultStyle from './defaultStyle'
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

const validationSchema = yup.object({
  name: yup
    .string('Enter your name')
    .required('Name is required')
});

const AddCommentModal = ({open, setOpen, parentId, saveComment, editMode, updateComment}) => {
  const { childCommentContent } = useSelector(state => state.activity)
  const dispatch = useDispatch()
  const { allUsers } = useSelector(state => state.user)
  const [mentions, setMentions] = useState([]);

  const handleChange = (e) => {
    const value = e.target.value;
    dispatch(setChildCommentContent({content: value}))

    const regex = /@(\w+)/g;
    const matchedMentions = value.match(regex);
    if (matchedMentions) {
      const uniqueMentions = [...new Set(matchedMentions)];
      setMentions(uniqueMentions);
    }
  }

  const handleClose = (e) => {
    setOpen(false)
    dispatch(setChildCommentContent({content: ""}))
  }

  const fetchUsers = (query, callback) => {
    if (!query) return;
  
    setTimeout(() => {
      const filteredUsers = allUsers.map((a) => {
        return {
          id: a.name,
          display: a.name
        }
      }).
      filter((user) =>
        user.display.toLowerCase().includes(query)
      );

      callback(filteredUsers);
    }, 1000);
  };

  return (
    <>
      <Modal
       open={open}
       onClose={handleClose}
       aria-labelledby="modal-modal-title"
       aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
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
            />

            {/* <TextField
              style={{marginBottom: "12px"}}
              required
              size='small'
              fullWidth
              multiline
              rows={4}
              id="content"
              name="content"
              label="Content"
              value={childCommentContent}
              onChange={handleChange}
            />  */}

            {/* <MentionsInput 
              style={defaultStyle} 
              value={childCommentContent}
              onChange={handleChange}
              placeholder={"Mention people using '@'"}
              a11ySuggestionsListLabel={"Suggested mentions"}
            >
              <Mention
                trigger="@"
                style={defaultMentionStyles}
                data={fetchUsers}
              />
            </MentionsInput>


            <p></p>
            <div style={{display: "flex", justifyContent: "space-between"}}>
              <Button 
                size='small' 
                color="primary" 
                variant="contained" 
                onClick={() => {
                  if(editMode) {
                    updateComment(childCommentContent)
                  } else {
                    saveComment(childCommentContent, parentId)
                  }
                  
                }}
                style={{borderRadius: "30px"}}
              >
                Save
              </Button>

              <Button 
                size='small' 
                color="error" 
                variant="contained" 
                onClick={() => {
                  handleClose()
                }}
                style={{borderRadius: "30px"}}
              >
                Cancel
              </Button>
            </div> */}
          </form>
        </Box>
      </Modal>
    </>
  )
}

export default AddCommentModal