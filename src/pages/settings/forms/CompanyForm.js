import { AddOutlined } from '@mui/icons-material'
import { Button, TextField } from '@mui/material'
import React from 'react'

const CompanyForm = ({
  updateData,
  data,
  companiesPayload,
  setCompaniesPayload,
  checkEmptyString,
  addBulkCompanies,
  formik,
  handleClose,
  showButtonText,
  mode,
  initialState,
  editMode
}) => {

  const renderError = (field) => {
    if(mode === "single") {
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
    if(mode === "single") {
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
      <TextField
        required
        size='small'
        fullWidth
        id="name"
        name="name"
        label="Name"
        value={mode === "single" ? formik.values.name : data.name}
        onChange={(e) => {
          if(mode === "single") {
            formik.setFieldValue("name", e.target.value)
          } else {
            updateData({name: e.target.value})
          }
        
        }}
        error={renderError("name")}
        helperText={renderHelperText("name")}
      />
      <p></p>
      <TextField
        required
        size='small'
        fullWidth
        id="address"
        name="address"
        label="Address"
        value={mode === "single" ? formik.values.address : data.address}
        onChange={(e) => {
        
          if(mode === "single") {
            formik.setFieldValue("address", e.target.value)
          } else {
            updateData({address: e.target.value})
          }
        }}
        error={renderError("address")}
        helperText={renderHelperText("address")}
      />
      <p></p>
      <TextField
        required
        size='small'
        fullWidth
        id="phone"
        name="phone"
        label="Phone"
        value={mode === "single" ? formik.values.phone : data.phone}
        onChange={(e) => {
          if(mode === "single") {
            formik.setFieldValue("phone", e.target.value)
          } else {
            updateData({phone: e.target.value})
          }
        }}
        error={renderError("phone")}
        helperText={renderHelperText("phone")}
      />
      <p></p>
      <TextField
        required
        size='small'
        fullWidth
        id="email"
        name="email"
        label="Email"
        value={mode === "single" ? formik.values.email : data.email}
        onChange={(e) => {
          if(mode === "single") {
            formik.setFieldValue("email", e.target.value)
          } else {
            updateData({email: e.target.value})
          }
        }}
        error={renderError("email")}
        helperText={renderHelperText("email")}
      />
      <p></p>
      <TextField
        required
        size='small'
        fullWidth
        id="contactPerson"
        name="contactPerson"
        label="Contact Person"
        value={mode === "single" ? formik.values.contactPerson : data.contactPerson}
        onChange={(e) => {
          if(mode === "single") {
            formik.setFieldValue("contactPerson", e.target.value)
          } else {
            updateData({contactPerson: e.target.value})
          }
        }}
        error={renderError("contactPerson")}
        helperText={renderHelperText("contactPerson")}
      />
      <p></p>
      <div style={{display: "flex", justifyContent: "space-between"}}>
        {
          mode === "bulk" && (
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
          )
        }
    
        {
          mode === "single" ? (
            <Button size='small' color="primary" variant="contained"  type="submit" style={{borderRadius: "30px"}}>
              {editMode ? showButtonText("Save") : showButtonText("Add")}
            </Button>
          ) : (
            <Button 
              size='small' 
              color="primary" 
              variant="contained" 
              style={{borderRadius: "30px"}}
              onClick={() => addBulkCompanies()}
              disabled={mode === "bulk" && !companiesPayload?.length}
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
            if(mode === "single") {
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
    </>
  )
}

export default CompanyForm