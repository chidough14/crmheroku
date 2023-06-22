import { Box, Button, CircularProgress, Modal, TextField, Typography} from '@mui/material'
import MuiAlert from '@mui/material/Alert';
import { useFormik } from 'formik';
import React, { useEffect, useReducer, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';
import { addCompanies, addCompany, setShowAddSpinner, updateCompany } from '../../../features/companySlice';
import instance from '../../../services/fetchApi';
import { AddOutlined } from '@mui/icons-material';
import { checkEmptyString } from '../../../services/checkers';

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
  address: yup
    .string('Enter your address')
    .required('Address is required'),
  phone: yup
    .string('Enter your phone number')
    .required('Phone number is required'),
  email: yup
    .string('Enter your email')
    .required('Email is required'),
  contactPerson: yup
    .string('Enter your contact')
    .required('Contact is required'),
});

const AddCompanyModal = ({open, setOpen, setOpenAlert, setAlertMessage, editMode, company, setSeverity}) => {
  
  const dispatch = useDispatch()
  const { showAddSpinner } = useSelector(state => state.company)
  const [bulkAdd, setBulkAdd] = useState(false)
  const [companiesPayload, setCompaniesPayload] = useState([])

  const handleClose = () => {
    setOpen(false)
    setBulkAdd(false)
  };

  const initialState = {
    name: '',
    address: '',
    phone: '',
    email: '',
    contactPerson: ''
  };

  const [data, updateData] = useReducer(
    (state, updates) => ({ ...state, ...updates }),
    initialState
  );

  useEffect(() => {
    if (editMode && company) {
      formik.setValues(company)
    }

  }, [editMode, company])
  
  const formik = useFormik({
    initialValues: {
      name: '',
      address: '',
      phone: '',
      email: '',
      contactPerson: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values, {resetForm}) => {
      dispatch(setShowAddSpinner({showAddSpinner: true}))

      if (editMode) {
        let body = {
          name: values.name,
          address: values.address,
          phone: values.phone,
          email: values.email,
          contactPerson: values.contactPerson
        }

        await instance.patch(`companies/${company.id}`, body)
        .then((res) => {
          dispatch(setShowAddSpinner({showAddSpinner: false}))
          setOpenAlert(true)
          setSeverity("success")
          setAlertMessage("Company Updated")
          dispatch(updateCompany({company: res.data.company}))
          handleClose()
          resetForm()
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
        await instance.post(`companies`, values)
        .then((res) => {
          dispatch(setShowAddSpinner({showAddSpinner: false}))
          setOpenAlert(true)
          setSeverity("success")
          setAlertMessage("Company Added")
          dispatch(addCompany({company: res.data.company}))
          handleClose()
          resetForm()
        })
        .catch((err) => {
          setOpenAlert(true)
          setSeverity("error")
          setAlertMessage("Ooops an error was encountered")
          handleClose()
          resetForm()
          dispatch(setShowAddSpinner({showAddSpinner: false}))
        })
      }
     
      
    },
  });

  const showCompanyCount = (count) => {
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

  const addBulkCompanies = async () => {
    dispatch(setShowAddSpinner({showAddSpinner: true}))

    await instance.post(`companies-add-bulk`, {companiesPayload})
    .then((res) => {
      dispatch(setShowAddSpinner({showAddSpinner: false}))
      setOpenAlert(true)
      setSeverity("success")
      setAlertMessage("Companies Added")
      setCompaniesPayload([])
      updateData(initialState)
      dispatch(addCompanies({companies: res.data.companies}))
      handleClose()
    })
    .catch((err) => {
      setOpenAlert(true)
      setSeverity("error")
      setAlertMessage("Ooops an error was encountered")
      handleClose()
      dispatch(setShowAddSpinner({showAddSpinner: false}))
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
                {editMode ? "Edit": "Add"} {bulkAdd ? "Companies" : "Company"}
              </Typography>
              <span>
                {
                  showCompanyCount(companiesPayload.length)
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
                        setCompaniesPayload([])
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
                  <>
                    <TextField
                      required
                      size='small'
                      fullWidth
                      id="name"
                      name="name"
                      label="Name"
                      value={data.name}
                      onChange={(e) => {
                        updateData({name: e.target.value})
                      }}
                      // error={formik.touched.name && Boolean(formik.errors.name)}
                      // helperText={formik.touched.name && formik.errors.name}
                    />
                    <p></p>
                    <TextField
                      required
                      size='small'
                      fullWidth
                      id="address"
                      name="address"
                      label="Address"
                      value={data.address}
                      onChange={(e) => {
                        updateData({address: e.target.value})
                      }}
                    />
                    <p></p>
                    <TextField
                      required
                      size='small'
                      fullWidth
                      id="phone"
                      name="phone"
                      label="Phone"
                      value={data.phone}
                      onChange={(e) => {
                        updateData({phone: e.target.value})
                      }}
                    />
                    <p></p>
                    <TextField
                      required
                      size='small'
                      fullWidth
                      id="email"
                      name="email"
                      label="Email"
                      value={data.email}
                      onChange={(e) => {
                        updateData({email: e.target.value})
                      }}
                    />
                    <p></p>
                    <TextField
                      required
                      size='small'
                      fullWidth
                      id="contactPerson"
                      name="contactPerson"
                      label="Contact Person"
                      value={data.contactPerson}
                      onChange={(e) => {
                        updateData({contactPerson: e.target.value})
                      }}
                    />
                    <p></p>
                    <div style={{display: "flex", justifyContent: "space-between"}}>
                      <Button 
                        size='small' 
                        color="primary" 
                        variant="contained" 
                        style={{borderRadius: "30px"}}
                        onClick={() => {
                          setCompaniesPayload([...companiesPayload, data])
                          updateData(initialState)
                        }}
                        disabled={checkEmptyString(data)}
                      >
                        <AddOutlined />
                      </Button>

                      <Button 
                        size='small' 
                        color="primary" 
                        variant="contained" 
                        style={{borderRadius: "30px"}}
                        onClick={() => addBulkCompanies()}
                        // disabled={checkEmptyString(data)}
                      >
                        Save
                      </Button>

                      <Button 
                        size='small' 
                        color="error" 
                        variant="contained" 
                        onClick={() => {
                          handleClose()
                          updateData(initialState)
                          formik.resetForm()
                        }}
                        style={{borderRadius: "30px"}}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
              ) : (
                <>
                
              
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
                    id="address"
                    name="address"
                    label="Address"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    error={formik.touched.address && Boolean(formik.errors.address)}
                    helperText={formik.touched.address && formik.errors.address}
                  />
                  <p></p>
                  <TextField
                    required
                    size='small'
                    fullWidth
                    id="phone"
                    name="phone"
                    label="Phone"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    error={formik.touched.phone && Boolean(formik.errors.phone)}
                    helperText={formik.touched.phone && formik.errors.phone}
                  />
                  <p></p>
                  <TextField
                    required
                    size='small'
                    fullWidth
                    id="email"
                    name="email"
                    label="Email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                  />
                  <p></p>
                  <TextField
                    required
                    size='small'
                    fullWidth
                    id="contactPerson"
                    name="contactPerson"
                    label="Contact Person"
                    value={formik.values.contactPerson}
                    onChange={formik.handleChange}
                    error={formik.touched.contactPerson && Boolean(formik.errors.contactPerson)}
                    helperText={formik.touched.contactPerson && formik.errors.contactPerson}
                  />
                  <p></p>
                  <div style={{display: "flex", justifyContent: "space-between"}}>
                    <Button size='small' color="primary" variant="contained"  type="submit" style={{borderRadius: "30px"}}>
                    {editMode ? showButtonText("Save") : showButtonText("Add")}
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
                </>
              )
            }
            
          
          </form>
        </Box>
      </Modal>

    </>
  )
}

export default AddCompanyModal