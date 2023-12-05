import { Box, Button, InputLabel, Modal, Select, TextField, Typography, MenuItem, Snackbar, CircularProgress } from '@mui/material'
import MuiAlert from '@mui/material/Alert';
import { useFormik } from 'formik';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';
import { addList, setReloadDashboardLists, setShowSpinner, updateList } from '../../features/listSlice';
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
  name: yup
    .string('Enter your name')
    .required('Name is required'),
  description: yup
    .string('Enter your description')
    .required('Description is required'),
});

const ListModal = ({list, open, setOpen, showSpinner}) => {
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [severity, setSeverity] = useState("");

  const handleClose = () => setOpen(false);
  const user = useSelector((state) => state.user)
  const dispatch = useDispatch()

  const showAlert = (msg, sev) => {
    setOpenAlert(true)
    setAlertMessage(msg)
    setSeverity(sev)
  }

  // const initialState = {
  //   name: "",
  //   description: "",
  //   type: undefined,
  // };

  // const [data, updateData] = useReducer(
  //   (state, updates) => ({ ...state, ...updates }),
  //   initialState
  // );
  
  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenAlert(false);
  };
  useEffect(() => {
    if (list) {
      formik.setValues(list)
    }
  }, [open])

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      type: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values, {resetForm}) => {
      if(list){
        dispatch(setShowSpinner({showSpinner: true}))

        let body
        if (values.type === "") {
          body = {
            name: values.name,
            description: values.description
          }
        } else {
          body = {
            name: values.name,
            description: values.description,
            type: values.type
          }
        }
        
        await instance.patch(`mylists/${list.id}`, body)
        .then((res) => {
          dispatch(setShowSpinner({showSpinner: false}))
          showAlert("List updated successfully", "success")

          dispatch(updateList({list: res.data.list}))
          dispatch(setReloadDashboardLists({reloadDashboardLists: true}))
          handleClose()
          resetForm();
        })
        .catch(() => {
          dispatch(setShowSpinner({showSpinner: false}))
          showAlert("Ooops an error was encountered", "error")
        })
      } else {
        dispatch(setShowSpinner({showSpinner: true}))

        let body
        if (values.type === "") {
          body = {
            name: values.name,
            description: values.description,
            user_id: user.id
          }
        } else {
          body = {
            name: values.name,
            description: values.description,
            type: values.type,
            user_id: user.id
          }
        }

        await instance.post(`mylists`, body)
        .then((res) => {
          dispatch(setShowSpinner({showSpinner: false}))
          showAlert("List created successfully", "success")

          dispatch(addList({list: res.data.list}))
          dispatch(setReloadDashboardLists({reloadDashboardLists: true}))
          handleClose()
          resetForm();
        })
        .catch(() => {
          dispatch(setShowSpinner({showSpinner: false}))
          showAlert("Ooops an error was encountered", "error")
        })
      }

      
    },
  });


  const showSendingSpinner = (text) => {
    if (showSpinner) {
      return (
        <Box sx={{ display: 'flex' }}>
          <CircularProgress size={24} color="inherit" />
        </Box>
      )
    } else {
      return text
    }
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
          <form onSubmit={formik.handleSubmit}>
            <Typography variant='h6' style={{marginBottom: "10px"}}>
              {
                list ? "Edit List" : "Add List"
              }
            </Typography>
            <TextField
              required
              size='small'
              fullWidth
              id="name"
              name="name"
              label="Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
            <p></p>
            <TextField
              required
              size='small'
              fullWidth
              id="description"
              name="description"
              label="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
            />
            <p></p>
            <InputLabel id="demo-select-small">Type</InputLabel>
            <Select
              id='type'
              name="type"
              label="Type"
              size='small'
              fullWidth
              value={formik.values.type}
              onChange={formik.handleChange}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="private">Private</MenuItem>
              <MenuItem value="public">Public</MenuItem>
            </Select>
            <p></p>
            <div style={{display: "flex", justifyContent: "space-between"}}>
              <Button size='small' color="primary" variant="contained"  type="submit" style={{borderRadius: "30px"}}>
                {
                  list ? showSendingSpinner("Save") : showSendingSpinner("Add")
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

export default ListModal