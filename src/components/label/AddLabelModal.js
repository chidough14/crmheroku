import { Box, Button, Checkbox, CircularProgress, MenuItem, Modal, Select, TextField, Typography } from '@mui/material';
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { addLabel, setShowDropdown } from '../../features/userSlice';
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


const AddLabelModal = ({ openAddLabelModal, setOpenAddLabelModal }) => {
  const [value, setValue] = useState("")
  const [parent, setParent] = useState(null); 
  const [loading, setLoading] = useState(false); 
  const { labels, showDropdown } = useSelector(state => state.user)
  const dispatch = useDispatch()

  const handleClose = () => {
    setOpenAddLabelModal(false)
  }

  const handleCreate = async () => {
    setLoading(true)
    await instance.post(`labels`, {name: value, parent})
    .then((res) => {
      dispatch(addLabel({label: res.data.label}))
      setValue('');
      setLoading(false)
      setParent(null);
      handleClose();
    })
    .catch((err) => {
      console.log(err);
    })
  };


  return (
    <>
      <Modal
        open={openAddLabelModal}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography variant='h6' style={{marginBottom: "10px"}}>
            Add Label
          </Typography>

          <TextField
            required
            size='small'
            fullWidth
            id="label"
            name="label"
            label="Label"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
            }}
          />

          <Checkbox
            checked={showDropdown}
            onChange={(e,f) => {
              dispatch(setShowDropdown({showDropdown: f}))
            }}
            inputProps={{ 'aria-label': 'controlled' }}
            style={{marginRight: "-24px"}}
          />

          <span style={{marginLeft: "20px"}}>Select Parent</span>
        

          {
            showDropdown ? (
              <Select
                label="Select Parent"
                size='small'
                fullWidth
                value={parent}
                onChange={(e) => {
                  setParent(e.target.value)
                }}
                style={{marginTop: "10px"}}
              >
                {
                  labels.filter((a) => a.parent === null).map((b) => (
                    <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                  ))
                }
              </Select>
            ) : null
          }
       

          <div style={{display: "flex", justifyContent: "space-between", marginTop: "20px"}}>
            <Button 
              size='small' 
              color="primary" 
              variant="contained"
              style={{borderRadius: "30px"}}
              onClick={() => handleCreate()}
            >
              {
                loading ? (
                  <CircularProgress
                    style={{width: "20px", height: "20px", color: "white"}} 
                  />
                ) : "Create"
              }
            </Button>

            <Button 
              size='small' 
              color="error" 
              variant="contained" 
              onClick={() => {
                setOpenAddLabelModal(false)
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

export default AddLabelModal