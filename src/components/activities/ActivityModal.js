import { Box, Button, InputLabel, Modal, Select, TextField, Typography, MenuItem, Snackbar, CircularProgress } from '@mui/material'
import MuiAlert from '@mui/material/Alert';
import { useFormik } from 'formik';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { addActivity, editActivity, setOpenPrompt, setShowCompanySearchNotification, setShowSendingSpinner, setSingleActivity } from '../../features/ActivitySlice';
import { addActivityToCompany, setCompany, setSearchResults } from '../../features/companySlice';
import { addEvent } from '../../features/EventSlice';
import instance from '../../services/fetchApi';
import SearchBar from '../SearchBar';

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
  label: yup
    .string('Enter a label')
    .required('Label is required'),
  assignedTo: yup
    .string('Enter a name')
    .required('Assigned to is required'),
  probability: yup
    .string('Choose a probability')
    .required('Probability is required'),
  earningEstimate: yup
    .number('Enter an estimate')
    .required('Estimate is required'),
  type: yup
    .string('Choose a type')
    .required('Type is required'),
});

const ActivityModal = ({open, setOpen, companyObject, openActivityModal, activity, editMode, mode}) => {
 
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [severity, setSeverity] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [companyId, setCompanyId] = useState();
  const [formerPobability, setFormerProbability] = useState(activity?.probability);
  const [showEmptyResultsNotification, setShowEmptyResultsNotification] = useState(false);

  const user = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const {searchResults} = useSelector(state=> state.company)
  const { showCompanySearchNotification, showSendingSpinner } = useSelector(state=> state.activity)
  const navigate = useNavigate()

  const handleClose = () => {
    setOpen(false)
    setShowEmptyResultsNotification(false)
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

  useEffect(() => {
    
    if (companyObject) {
      populateFields(companyObject)
    }
   
  }, [openActivityModal])

  useEffect(() => {
    if (editMode && activity) {
      formik.setValues(activity)
      setFormerProbability(activity?.probability)
    }
   
  }, [open, activity])

  useEffect(()=> {
    const getSearchResult = async () => {
      setShowEmptyResultsNotification(false)
      dispatch(setShowCompanySearchNotification({showCompanySearchNotification: true}))

      await instance({
        url: `companies/search?query=${searchQuery}`,
        method: "GET",
      }).then((res) => {
        dispatch(setShowCompanySearchNotification({showCompanySearchNotification: false}))
        dispatch(setSearchResults({companies: res.data.companies}))

        if (!res.data.companies.length) {
          setShowEmptyResultsNotification(true)
        } else {
          setShowEmptyResultsNotification(false)
        }
      })
      .catch(()=> {
        showAlert("Ooops an error was encountered", "error")
        dispatch(setShowCompanySearchNotification({showCompanySearchNotification: false}))
      })
    }

    if (searchQuery.length === 3){
      getSearchResult()
    }
  }, [searchQuery])

  const populateFields = (value) => {
    formik.setFieldValue('label', value.name)
    formik.setFieldValue('assignedTo', value.contactPerson)

    setCompanyId(value.id)
  }

  const formik = useFormik({
    initialValues: {
      label: '',
      assignedTo: '',
      description: '',
      probability: '',
      earningEstimate: 0,
      type: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values, {resetForm}) => {
      if (editMode) {
        dispatch(setShowSendingSpinner({showSendingSpinner: true}))

        values.earningEstimate = parseInt(values.earningEstimate)
        delete values.decreased_probability
        
        await instance.patch(`activities/${activity.id}`, values)
        .then((res) => {
          showAlert("Activity updated successfully", "success")
  
          dispatch(editActivity({activity: res.data.activity}))

          dispatch(setSingleActivity({activity: res.data.activity}))

          if (formerPobability === "High" && res.data.activity.probability === "Closed") {
           
            navigate(`/activities/${res.data.activity.id}`)
            dispatch(setOpenPrompt({value: true}))
          }
  
          handleClose()
          resetForm();
          dispatch(setShowSendingSpinner({showSendingSpinner: false}))
        })
        .catch(()=> {
          showAlert("Ooops an error was encountered", "error")
          dispatch(setShowSendingSpinner({showSendingSpinner: false}))
        })
      } else {
        dispatch(setShowSendingSpinner({showSendingSpinner: true}))
        
        values.company_id = companyId
        values.user_id = user.id
        values.earningEstimate = parseInt(values.earningEstimate)
        values.status = "private"
        
        await instance.post(`activities`, values)
        .then((res) => {
          showAlert("Activity created successfully", "success")

          res.data.activity.decreased_probability = null
          res.data.activity.total = 0
          dispatch(addActivity({activity: res.data.activity}))
          dispatch(addEvent({event: res.data.event}))
  
          if (companyObject) {
            dispatch(addActivityToCompany({activity: res.data.activity}))
          }
          handleClose()
          resetForm();
          dispatch(setShowSendingSpinner({showSendingSpinner: false}))

          if(mode === "dashboard") {
            navigate(`/activities/${res.data.activity.id}`, {state: {showSuccessAlert: true}})
          }
        })
        .catch(()=> {
          showAlert("Ooops an error was encountered", "error")
          dispatch(setShowSendingSpinner({showSendingSpinner: false}))
        })
      }
      
      
    },
  });

  const showText = (text) => {
    if (showSendingSpinner) {
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
        open={open || openActivityModal}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        >
        <Box sx={style}>
          <form onSubmit={formik.handleSubmit}>
            <Typography variant='h6' style={{marginBottom: "10px"}}>
              {editMode ? "Edit Activity" : "Add Activity"}
            </Typography>
            
            {
              (openActivityModal || editMode) ? (
                <></>

              ) : (
                <>
                <SearchBar 
                  activityModal={true} 
                  populateFields={populateFields}  
                  data={searchResults} 
                  setSearchQuery={setSearchQuery}
                />
                {
                  showCompanySearchNotification ? (
                    <p style={{marginTop: "-2px", fontSize: "13px", color: "green"}}>Searching....</p>
                  ) : null
                }

                {
                  showEmptyResultsNotification ? (
                    <p style={{marginTop: "-2px", fontSize: "13px", color: "red"}}><b>No Results</b></p>
                  ) : null
                }
               
                </>
              )
            }

            <p></p>

            <TextField
              required
              size='small'
              fullWidth
              id="label"
              name="label"
              label="Label"
              value={formik.values.label}
              onChange={formik.handleChange}
              error={formik.touched.label && Boolean(formik.errors.label)}
              helpertext={formik.touched.label && formik.errors.label}
            />
            <p></p>
            <TextField
              required
              size='small'
              fullWidth
              id="assignedTo"
              name="assignedTo"
              label="Assigned To"
              value={formik.values.assignedTo}
              onChange={formik.handleChange}
              error={formik.touched.assignedTo && Boolean(formik.errors.assignedTo)}
              helpertext={formik.touched.assignedTo && formik.errors.assignedTo}
            />
            <p></p>
            <TextField
              size='small'
              fullWidth
              id="description"
              name="description"
              label="Description"
              value={formik.values.description}
              onChange={formik.handleChange}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helpertext={formik.touched.description && formik.errors.description}
            />
            <p></p>
            <TextField
              required
              size='small'
              fullWidth
              id="earningEstimate"
              name="earningEstimate"
              label="Estimate"
              value={formik.values.earningEstimate}
              onChange={formik.handleChange}
              error={formik.touched.earningEstimate && Boolean(formik.errors.earningEstimate)}
              helpertext={formik.touched.earningEstimate && formik.errors.earningEstimate}
            />
            <p></p>
            <InputLabel id="demo-select-small">Probability</InputLabel>
            <Select
              required
              id='probability'
              name="probability"
              label="Probability"
              size='small'
              fullWidth
              value={formik.values.probability}
              onChange={formik.handleChange}
              error={formik.touched.probability && Boolean(formik.errors.probability)}
              helpertext={formik.touched.probability && formik.errors.probability}
              disabled={activity?.probability === "Closed"}
            >
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
              {
                editMode && (
                  <MenuItem value="Closed">Closed</MenuItem>
                )
              }
            </Select>
            <p></p>
            <InputLabel id="demo-select-small">Type</InputLabel>
            <Select
              required
              id='type'
              name="type"
              label="Type"
              size='small'
              fullWidth
              value={formik.values.type}
              onChange={formik.handleChange}
              error={formik.touched.type && Boolean(formik.errors.type)}
              helpertext={formik.touched.type && formik.errors.type}
            >
              <MenuItem value="Call">Call</MenuItem>
              <MenuItem value="Email">Email</MenuItem>
              <MenuItem value="Meeting">Meeting</MenuItem>
            </Select>
            <p></p>
            <div style={{display: "flex", justifyContent: "space-between"}}>
              <Button size='small' color="primary" variant="contained"  type="submit" style={{borderRadius: "30px"}}>
                {editMode ? showText("Save") : showText("Add") }
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

export default ActivityModal