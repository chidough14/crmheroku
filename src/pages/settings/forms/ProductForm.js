import { AddOutlined } from '@mui/icons-material'
import { Button, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import React from 'react'

const ProductForm = ({
  updateData,
  data,
  productsPayload,
  setProductsPayload,
  checkEmptyString,
  addBulkProducts,
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
        onChange={mode === "single" ? formik.handleChange : (e) => updateData({name: e.target.value})}
        error={renderError("name")}
        helperText={renderHelperText("name")}
      />
      <p></p>
      <TextField
        size='small'
        fullWidth
        id="description"
        name="description"
        label="description"
        value={mode === "single" ? formik.values.description : data.description}
        onChange={mode === "single" ? formik.handleChange : (e) => updateData({description: e.target.value})}
        error={renderError("description")}
        helperText={renderHelperText("description")}
      />
      <p></p>
      <TextField
        required
        size='small'
        fullWidth
        id="price"
        name="price"
        label="Price"
        value={mode === "single" ? formik.values.price : data.price}
        onChange={mode === "single" ? formik.handleChange : (e) => updateData({price: e.target.value})}
        error={renderError("price")}
        helperText={renderHelperText("price")}
      />
      <p></p>
      <InputLabel id="demo-select-small">Tax %</InputLabel>
      <Select
        id='tax_percentage'
        name="tax_percentage"
        label="Tax %"
        size='small'
        fullWidth
        value={mode === "single" ? formik.values.tax_percentage : data.tax_percentage}
        onChange={mode === "single" ? formik.handleChange : (e) => updateData({tax_percentage: e.target.value})}
        error={renderError("tax_percentage")}
        helperText={renderHelperText("tax_percentage")}
      >
        <MenuItem value={3}>3</MenuItem>
        <MenuItem value={12}>12</MenuItem>
        <MenuItem value={25}>25</MenuItem>
      </Select>
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
                setProductsPayload([...productsPayload, data])
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
              onClick={() => addBulkProducts()}
              disabled={mode === "bulk" && !productsPayload?.length}
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

export default ProductForm