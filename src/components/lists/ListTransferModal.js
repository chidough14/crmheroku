import { Box, Button, InputLabel, Modal, Select, TextField, Typography, MenuItem, Snackbar, CircularProgress } from '@mui/material'
import MuiAlert from '@mui/material/Alert';
import { useFormik } from 'formik';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';
import { addList, setShowSpinner, updateList } from '../../features/listSlice';
import instance from '../../services/fetchApi';

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
  email: yup
    .string('Enter your email')
    .required('Email is required'),
});

const ListTransferModal = ({ open, setOpen, list, socket, showSpinner}) => {
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [severity, setSeverity] = useState("");
  const [showEmailError, setShowEmailError] = useState(false);
  const { allUsers } = useSelector((state) => state.user)
  const dispatch = useDispatch()

  const handleClose = () => {
    setOpen(false);
    setShowEmailError(false)
  }

  const showAlert = (msg, sev) => {
    setOpenAlert(true)
    setAlertMessage(msg)
    setSeverity(sev)
  }
  
  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenAlert(false);
  };

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values, {resetForm}) => {
      dispatch(setShowSpinner({showSpinner: true}))

      await instance.post(`mylists/${list?.id}/transfer`, values)
      .then((res)=> {
        dispatch(setShowSpinner({showSpinner: false}))
       
        if (res.data.status === "success") {
          showAlert("List Transfered", "success")

          let xx = allUsers.find((a) => a.email === values.email)
          socket.emit('sendNotification', { recipientId: xx.id, message: "List transfer" });


          handleClose()
          resetForm()
        }

        if (res.data.status === "error") {
          setShowEmailError(true)
        }
      })
      .catch(() => {
        dispatch(setShowSpinner({showSpinner: false}))
        showAlert("Ooops an error was encountered", "error")
      })
    },
  });

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        >
        <Box sx={style}>
          <form onSubmit={formik.handleSubmit}>
            <Typography variant='h6' style={{marginBottom: "10px"}}>
              Transfer List
            </Typography>
            {
              showEmailError &&
              (
                <p style={{color: "red"}}>Email does not exist</p>
              )
            }
            <TextField
              required
              size='small'
              fullWidth
              id="email"
              name="email"
              label="Enter Email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
            <p></p>
            <div style={{display: "flex", justifyContent: "space-between"}}>
              <Button size='small' color="primary" variant="contained"  type="submit" style={{borderRadius: "30px"}}>
               {
                showSpinner ? (
                  <Box sx={{ display: 'flex' }}>
                    <CircularProgress size={24} color="inherit" />
                  </Box>
                ) : "Transfer"
               }
              </Button>

              <Button 
                size='small' 
                color="error" 
                variant="contained" 
                onClick={() => {
                  handleClose()
                  formik.resetForm()
                }}
                style={{borderRadius: "30px"}}
              >
                Cancel
              </Button>
            </div>
          
          </form>
        </Box>
      </Modal>

      <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={severity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
  )
}

export default ListTransferModal