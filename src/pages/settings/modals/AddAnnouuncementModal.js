import { Box, Button, CircularProgress, FormControl, MenuItem, Modal, Select, TextField, Typography} from '@mui/material'
import MuiAlert from '@mui/material/Alert';
import { useFormik } from 'formik';
import React, { useEffect, useReducer, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';
import instance from '../../../services/fetchApi';
import { addAnnouncement, addAnnouncements, setCategories, setShowAddSpinner, updateAnnouncement } from '../../../features/AnnouncementsSlice';
import { checkEmptyString } from '../../../services/checkers';
import { AddOutlined } from '@mui/icons-material';
import AnnouncementsForm from '../forms/AnnouncementsForm';

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
  message: yup
    .string('Enter your message')
    .required('Message is required')
});

const AddAnnouuncementModal = ({open, setOpen, setOpenAlert, setAlertMessage, setSeverity, announcement, editMode, socket, categories}) => {
  const handleClose = () => {
    setOpen(false);
    setCategoryId('')
    setBulkAdd(false)
  }
  const dispatch = useDispatch()
  const { showAddSpinner } = useSelector(state => state.announcement)
  const [categoryId, setCategoryId] = useState()
  const [announcementsPayload, setAnnouncementsPayload] = useState([])
  const [bulkAdd, setBulkAdd] = useState(false)

  const initialState = {
    message: '',
    link: '',
    category_id: ''
  };

  const [data, updateData] = useReducer(
    (state, updates) => ({ ...state, ...updates }),
    initialState
  );

  useEffect(() => {
    if (editMode && announcement) {
      formik.setValues(announcement)
    }

  }, [editMode, announcement])

  // const getCategories = async () => {
  //   await instance.get(`categories`)
  //   .then((res) => {
  //     dispatch(setCategories({categories: res.data.categories}))
  //   })
  //   .catch(() => {

  //   })
  // }

  // useEffect(() => {
  //   getCategories()
  // }, [])

  const formik = useFormik({
    initialValues: initialState,
    validationSchema: validationSchema,
    onSubmit: async (values, {resetForm}) => {
      dispatch(setShowAddSpinner({showAddSpinner: true}))
      let body = {
        message: values.message,
        link: values.link,
        category_id: categoryId
      }

      if(editMode) {
        await instance.patch(`announcements/${announcement.id}`, body)
        .then((res) => {
          dispatch(setShowAddSpinner({showAddSpinner: false}))
          setOpenAlert(true)
          setSeverity("success")
          setAlertMessage("Announcement updated")
          dispatch(updateAnnouncement({announcement: res.data.announcement}))
          handleClose()
          resetForm()
          setCategoryId('')
        })
        .catch((err) => {
          dispatch(setShowAddSpinner({showAddSpinner: false}))
          setOpenAlert(true)
          setSeverity("error")
          setAlertMessage("Ooops an error was encountered")
          handleClose()
          resetForm()
        })
      } else {
        await instance.post(`announcements`, body)
        .then((res) => {
          socket.emit("new_announcement", {message: "test"})
          dispatch(setShowAddSpinner({showAddSpinner: false}))
          setOpenAlert(true)
          setSeverity("success")
          setAlertMessage("Announcement created")
          dispatch(addAnnouncement({announcement: res.data.announcement}))
          handleClose()
          resetForm()
          setCategoryId('')
        })
        .catch((err) => {
          dispatch(setShowAddSpinner({showAddSpinner: false}))
          setOpenAlert(true)
          setSeverity("error")
          setAlertMessage("Ooops an error was encountered")
          handleClose()
          resetForm()
        })
      }
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

  const handleChange = (e) => {
    setCategoryId(e.target.value)
  }

  
  const addBulkAnnouncements = async () => {
    await instance.post(`announcements-bulk-add`, {announcementsPayload})
    .then((res) => {
      socket.emit("new_announcement", {message: "test"})
      dispatch(setShowAddSpinner({showAddSpinner: false}))
      setOpenAlert(true)
      setSeverity("success")
      setAlertMessage("Announcements created")
      dispatch(addAnnouncements({announcements: res.data.announcements}))
      handleClose()
      setCategoryId('')
    })
    .catch((err) => {
      dispatch(setShowAddSpinner({showAddSpinner: false}))
      setOpenAlert(true)
      setSeverity("error")
      setAlertMessage("Ooops an error was encountered")
      handleClose()
    })
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
                {editMode ? "Edit": "Add"} Annoucement
              </Typography>

              <span>
                {
                  showAnnouncementsCount(announcementsPayload.length)
                }
              </span>

              {
                !editMode &&  
                <span>
                  <Button
                    onClick={()=> {
                      if(bulkAdd) {
                        setBulkAdd(false)
                      }

                      if(!bulkAdd) {
                        setBulkAdd(true)
                        setAnnouncementsPayload([])
                      }
                    }}
                  >
                    {bulkAdd ? "Add Single" : "Add Bulk"}
                  </Button>
                </span>
              }
            </div>

            {
              bulkAdd ? (
                <AnnouncementsForm
                  updateData={updateData}
                  data={data}
                  announcementsPayload={announcementsPayload}
                  setAnnouncementsPayload={setAnnouncementsPayload}
                  checkEmptyString={checkEmptyString}
                  addBulkAnnouncements={addBulkAnnouncements}
                  formik={formik}
                  showButtonText={showButtonText}
                  handleClose={handleClose}
                  mode="bulk"
                  categories={categories}
                  initialState={initialState}
                />
              ) : (
                <AnnouncementsForm
                  formik={formik}
                  handleClose={handleClose}
                  showButtonText={showButtonText}
                  mode="single"
                  initialState={initialState}
                  editMode={editMode}
                  handleChange={handleChange}
                  categories={categories}
                  categoryId={categoryId}
                />
              )
            }
          </form>
        </Box>
      </Modal>

    </>
  )
}

export default AddAnnouuncementModal