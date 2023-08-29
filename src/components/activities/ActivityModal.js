import { Box, Button, InputLabel, Modal, Select, TextField, Typography, MenuItem, Snackbar, CircularProgress, Tooltip } from '@mui/material'
import MuiAlert from '@mui/material/Alert';
import { useFormik } from 'formik';
import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { addActivity, addPaths, editActivity, emptyPaths, removePaths, setFilePaths, setOpenPrompt, setPaths, setShowCompanySearchNotification, setShowSendingSpinner, setSingleActivity } from '../../features/ActivitySlice';
import { addActivityToCompany, setCompany, setSearchResults } from '../../features/companySlice';
import { addEvent } from '../../features/EventSlice';
import instance from '../../services/fetchApi';
import SearchBar from '../SearchBar';
import { DeleteOutlined, FilePresent, UploadFileOutlined } from '@mui/icons-material';
import { checkFileType } from '../../services/checkers';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

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

const ActivityModal = ({open, setOpen, companyObject, openActivityModal, activity, editMode, mode, socket}) => {
 
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [severity, setSeverity] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFile, setCurrentFile] = useState("")
  const [companyId, setCompanyId] = useState();
  const [paths, setPaths] = useState([]);
  const [formerPobability, setFormerProbability] = useState(activity?.probability);
  const [showEmptyResultsNotification, setShowEmptyResultsNotification] = useState(false);

  const user = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const {searchResults} = useSelector(state=> state.company)
  const { showCompanySearchNotification, showSendingSpinner, filePaths } = useSelector(state=> state.activity)
  const navigate = useNavigate()

  const handleClose = () => {
    setOpen(false)
    setShowEmptyResultsNotification(false)
    setPaths([])
    dispatch(emptyPaths())
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
    if (open && editMode && activity) {
      formik.setValues(activity)
      setFormerProbability(activity?.probability)
      if(activity.files && activity.files.length) {
        dispatch(setFilePaths({filePaths: activity.files}))
      }
     
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

  const addMessage  = async (arr) => {

    await instance.post(`add-message-for-offline-followers`, {arr})
    .then((res) => {
      
    })
    .catch(() => {
    
    })
  }

  const sendNotificationToFollowers  = (activity, msg, event) => {
    let onlineUsersIds = user?.onlineUsers?.map((a) => a.userId)
    let offlineIds = []

    for (let i = 0; i < user?.usersFollowers.length; i++) {
      if (onlineUsersIds.includes(user?.usersFollowers[i].follower_id)) {
        socket.emit(event, { 
          follower_id: user?.usersFollowers[i].follower_id, 
          message: msg, 
          sender_id: user?.id,
          activityId: activity.id 
        });
      } else {
        offlineIds = [...offlineIds, {id: user?.usersFollowers[i].follower_id, message: msg}]
      }
  
    }

    if (offlineIds?.length) {
      addMessage(offlineIds)
    }
   
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

        const updatedValues = {
          ...values,
          earningEstimate: parseInt(values.earningEstimate),
          files: filePaths,
        };
      
        delete updatedValues.decreased_probability;
        
        await instance.patch(`activities/${activity.id}`, updatedValues)
        .then((res) => {

          sendNotificationToFollowers(res.data.activity, `${user?.name} edited ${activity.label}`, "activity_edited")

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
        values.files = paths
        
        await instance.post(`activities`, values)
        .then((res) => {
          sendNotificationToFollowers(res.data.activity, `${user?.name} created a new activity ${res.data.activity.label}`, "activity_created")
     
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

          if(mode === "sidebar") {
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

  const handleFileUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*, application/pdf, application/vnd.ms-excel, text/csv'; // Updated accept attribute
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append('file', file); // Use a generic 'file' key in FormData
  
        try {
          const response = await instance.post('/upload-files', formData); // Change the endpoint as needed
          const uploadedFilePath = response.data.filePath;

          if (editMode) {
            dispatch(addPaths({filePath: uploadedFilePath}))
          } else {
            setPaths((prev) => [...prev, uploadedFilePath]);
          }
        
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      }
    };
    input.click();
  }, []);

  const renderFiles = (files, type) => {
    return files?.map((a) => {
      const isImage = checkFileType(a) === "image";
  
      return (
        <div
          key={a} // Add a unique key for each rendered element
          style={{
            marginRight: "20px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            marginTop: "40px",
          }}
          onMouseEnter={() => {
            setCurrentFile(a)
          }}
          onMouseLeave={() => {
            setCurrentFile("")
          }}
        >
          <div>
            {isImage ? (
              <img
                src={`${process.env.REACT_APP_BASE_URL}${a}`}
                alt="Image"
                style={{ height: "30px" }}
              />
            ) : (
              <FilePresent />
            )}

            {
              currentFile === a && (
                <span
                  style={{ marginLeft: "6px", color: "red", cursor: "pointer" }}
                  onClick={() => {
                    if (editMode) {
                      dispatch(removePaths({ filePath: a }));
                    } else {
                      setPaths(paths.filter((b) => b !== a));
                    }
                  }}
                >
                  <DeleteOutlined />
                </span>
              )
            }
         
          </div>
          <p style={{marginTop: "-10px", fontSize: "13px"}}>{a.replace("files/", "")}</p>
        </div>
      );
    });
  };


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

            <div style={{display: "flex", justifyContent: "space-between"}}>
              <Tooltip title="Upload file">
                <UploadFileOutlined
                  style={{marginTop: "10px" , color: "lightblue", cursor: "pointer", fontSize: "28px"}}
                  onClick={() => handleFileUpload()}
                />
              </Tooltip>

              <div style={{height: "15px", display: "flex", marginTop: "10px"}}>
                { !editMode ? renderFiles(paths, "normal") : renderFiles(filePaths, "normal")}
              </div>
            </div>
           

            <p></p>
            <div style={{display: "flex", justifyContent: "space-between", marginTop: "29px"}}>
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