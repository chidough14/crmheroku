import { Box, Button, Modal, TextField, Typography } from '@mui/material'
import React from 'react'
import MuiAlert from '@mui/material/Alert';
import * as yup from 'yup';
import { useFormik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { setChildCommentContent } from '../../features/ActivitySlice';

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

  const handleChange = (e) => {
    dispatch(setChildCommentContent({content: e.target.value}))
  }

  const handleClose = (e) => {
    setOpen(false)
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
        <Box sx={style}>
          <form>
            <Typography variant='h6' style={{marginBottom: "10px"}}>
                {editMode ? "Edit" : "Add"} Comment
            </Typography>

            <TextField
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
            /> 


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
            </div>
          </form>
        </Box>
      </Modal>
    </>
  )
}

export default AddCommentModal