import { Box, Button, Chip, Modal, Typography } from '@mui/material'
import React, { useState } from 'react'
import { removeCategory } from '../../../features/AnnouncementsSlice';
import instance from '../../../services/fetchApi';
import { useDispatch } from 'react-redux';

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

const DeleteCategoryModal = ({categories, open, setOpen}) => {
  const [text, setText] = useState("")
  const dispatch = useDispatch()

  const handleDelete = async (id) => {
    setText("Deleting")
    await instance.delete(`categories/${id}`)
    .then((res) => {
      dispatch(removeCategory({id}))
      setText("Deleted")

      setTimeout(() => {
        setText("")
      }, 2000);
    })
    .catch(() => {

    })
  };

  const handleClose = () => {
    setOpen(false);
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
          <div style={{display: "flex", justifyContent: "space-between"}}>
            <Typography variant='h6' style={{marginBottom: "10px"}}>
              Delete a category
            </Typography>
            <span style={{color: "green"}}>
              {
                text
              }
            </span>
          </div>
         
          <div style={{marginBottom: "16px"}}>
            {
              categories?.map((a) => (
                <Chip 
                  label={a.name} 
                  key={a.id} 
                  onDelete={() => handleDelete(a.id)} 
                  style={{marginRight: "12px", marginBottom: "10px"}}
                />
              ))
            }
          </div>

          <Button 
            size='small' 
            color="error" 
            variant="contained" 
            onClick={() => {
             handleClose()
            }}
            style={{borderRadius: "30px", float: "right"}}
          >
            Cancel
          </Button>
        </Box>
      </Modal>
    </>
  )
}

export default DeleteCategoryModal