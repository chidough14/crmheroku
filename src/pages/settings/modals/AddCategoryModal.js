import { Box, Button, CircularProgress, FormControl, MenuItem, Modal, Select, Snackbar, TextField, Typography} from '@mui/material'
import MuiAlert from '@mui/material/Alert';
import { useFormik } from 'formik';
import React, { useEffect, useReducer, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';
import instance from '../../../services/fetchApi';
import { addAnnouncement, addAnnouncements, addCategories, addCategory, setCategories, setShowAddSpinner, updateAnnouncement } from '../../../features/AnnouncementsSlice';
import { checkEmptyString } from '../../../services/checkers';
import { AddOutlined } from '@mui/icons-material';

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

const AddCategoryModal = ({open, setOpen}) => {
 
  const dispatch = useDispatch()
  const { showAddSpinner } = useSelector(state => state.announcement)
  const [categoriesPayload, setCategoriesPayload] = useState([])
  const [bulkAdd, setBulkAdd] = useState(false)
  const [severity, setSeverity] = useState("");
  const [openSnackAlert, setOpenSnackAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const initialState = {
    name: ''
  };

  const [data, updateData] = useReducer(
    (state, updates) => ({ ...state, ...updates }),
    initialState
  );

  const handleClose = () => {
    setOpen(false);
    setBulkAdd(false)
    updateData(initialState)
  }

  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenSnackAlert(false);
  };

  const formik = useFormik({
    initialValues: initialState,
    validationSchema: validationSchema,
    onSubmit: async (values, {resetForm}) => {
      dispatch(setShowAddSpinner({showAddSpinner: true}))
      let body = {
        name: values.name
      }

      await instance.post(`categories`, body)
      .then((res) => {
        dispatch(setShowAddSpinner({showAddSpinner: false}))
        setOpenSnackAlert(true)
        setSeverity("success")
        setAlertMessage("Category Added")
        dispatch(addCategory({category: res.data.category}))
        handleClose()
        resetForm()
      })
      .catch((err) => {
        dispatch(setShowAddSpinner({showAddSpinner: false}))
        setOpenSnackAlert(true)
        setSeverity("error")
        setAlertMessage("Ooops an error was encountered")
        handleClose()
        resetForm()
      })

    },
  });

  const showAnnouncementsCount = (count) => {
    if (count) {
      if(bulkAdd) {
        return `${count} added` 
      } else {
        return null
      }
    } else {
      return null
    }
  }

  const showButtonText = (text) => {
    if (showAddSpinner) {
      return (
        <Box sx={{ display: 'flex' }}>
          <CircularProgress size={24} color="inherit" />
        </Box>
      )
    } else {
      return text
    }
  }

  const addBulkCatgories = async () => {
    dispatch(setShowAddSpinner({showAddSpinner: true}))

    
    await instance.post(`categories-bulk-add`, {categoriesPayload})
    .then((res) => {
      dispatch(setShowAddSpinner({showAddSpinner: false}))
      setOpenSnackAlert(true)
      setSeverity("success")
      setAlertMessage("Categories Added")
      dispatch(addCategories({categories: res.data.categories}))
      handleClose()
    })
    .catch((err) => {
      dispatch(setShowAddSpinner({showAddSpinner: false}))
      setOpenSnackAlert(true)
      setSeverity("error")
      setAlertMessage("Ooops an error was encountered")
      handleClose()
    })
  }

  const renderError = (field) => {
    if(bulkAdd) {
      if (formik.touched[field] && Boolean(formik.errors[field])) {
        return true
      } else {
        return false
      }
    } else {
      return null
    }
  }

  const renderHelperText = (field) => {
    if(bulkAdd) {
      if (formik.touched[field] && formik.errors[field]) {
        return true
      } else {
        return false
      }
    } else {
      return null
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
            <div style={{display: "flex", justifyContent: "space-between"}}>
              <Typography variant='h6' style={{marginBottom: "10px"}}>
                Add {bulkAdd ? "Categories" : "Category"}
              </Typography>

              <span>
                <Button
                  onClick={()=> {
                    if(bulkAdd) {
                      setBulkAdd(false)
                    }

                    if(!bulkAdd) {
                      setBulkAdd(true)
                      // setAnnouncementsPayload([])
                    }
                  }}
                >
                  {bulkAdd ? "Add Single" : "Add Bulk"}
                </Button>
              </span>

            </div>

            <TextField
              required
              size='small'
              fullWidth
              id="name"
              name="name"
              label="Name"
              value={!bulkAdd ? formik.values.name : data.name}
              onChange={!bulkAdd ? formik.handleChange : (e) => updateData({name: e.target.value})}
              error={renderError("name")}
              helperText={renderHelperText("name")}
            />


          <p></p>
          <div style={{display: "flex", justifyContent: "space-between"}}>
            {
              bulkAdd && (
                <Button 
                  size='small' 
                  color="primary" 
                  variant="contained" 
                  style={{borderRadius: "30px"}}
                  onClick={() => {
                    setCategoriesPayload([...categoriesPayload, data])
                    updateData(initialState)
                  }}
                  disabled={checkEmptyString(data)}
                >
                  <AddOutlined />
                </Button>
              )
            }

            {
              !bulkAdd ? (
                <Button size='small' color="primary" variant="contained"  type="submit" style={{borderRadius: "30px"}}>
                  {showButtonText("Save")}
                </Button>
              ) : (
                <Button 
                  size='small' 
                  color="primary" 
                  variant="contained" 
                  style={{borderRadius: "30px"}}
                  onClick={() => addBulkCatgories()}
                  disabled={bulkAdd && !categoriesPayload?.length}
                >
                  { showButtonText("Save") }
                </Button>
              )
            }

            <Button 
              size='small' 
              color="error" 
              variant="contained" 
              onClick={() => {
                handleClose()
                if(!bulkAdd) {
                  formik.resetForm()
                } else {
                  updateData(initialState)
                }
              }}
              style={{borderRadius: "30px"}}
            >
              Cancel
            </Button>
          </div>
          </form>
        </Box>
      </Modal>


      <Snackbar open={openSnackAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={severity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>

    </>
  )
}

export default AddCategoryModal