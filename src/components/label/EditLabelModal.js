import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from "react-redux";
import { editLabel, setOpenEditLabelModal } from '../../features/userSlice';
import { Box, Button, CircularProgress, Modal, TextField, Typography } from '@mui/material';
import instance from '../../services/fetchApi';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 700,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const EditLabelModal = () => {
  const [value, setValue] = useState("")
  const [loading, setLoading] = useState(false); 
  const { openEditLabelModal, currentLabelId, labels } = useSelector(state => state.user)
  const dispatch = useDispatch()

  const handleClose = () => {
    dispatch(setOpenEditLabelModal({openEditLabelModal: false}))
  }

  useEffect(() => {
    setValue(labels?.find((a) => a.id === currentLabelId)?.name)
  }, [currentLabelId, labels])


  const updateLabel = async () => {
    setLoading(true)
    await instance.patch(`labels/${currentLabelId}`, {name: value})
    .then((res) => {
      dispatch(editLabel({label: res.data.label}))
      dispatch(setOpenEditLabelModal({openEditLabelModal: false}))
      setLoading(false)
    })
    .catch((err) => {
      console.log(err);
    })
  }

  return (
    <>
      <Modal
        open={openEditLabelModal}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography variant='h6' style={{marginBottom: "10px"}}>
            Edit Label
          </Typography>

          <TextField
            required
            size='small'
            fullWidth
            id="label"
            name="label"
            label="Label"
            value={value}
            // value={labels?.find((a) => a.id === currentLabelId)?.name}
            onChange={(e) => {
              setValue(e.target.value)
            }}
          />

          <div style={{display: "flex", justifyContent: "space-between", marginTop: "20px"}}>
            <Button 
              size='small' 
              color="primary" 
              variant="contained"
              style={{borderRadius: "30px"}}
              onClick={() => {
                updateLabel()
              }}
            >
              {
                loading ? (
                  <CircularProgress
                    style={{width: "20px", height: "20px", color: "white"}} 
                  />
                ) : "Save"
              }
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
        </Box>
      </Modal>
    </>
  )
}

export default EditLabelModal