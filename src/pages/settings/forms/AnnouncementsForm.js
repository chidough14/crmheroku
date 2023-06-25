import React from 'react'
import { AddOutlined } from '@mui/icons-material'
import { Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material'

const AnnouncementsForm = ({
  updateData,
  data,
  announcementsPayload,
  setAnnouncementsPayload,
  checkEmptyString,
  addBulkAnnouncements,
  formik,
  handleClose,
  showButtonText,
  mode,
  initialState,
  editMode,
  handleChange,
  categoryId,
  categories
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
        id="message"
        name="message"
        label="Message"
        value={mode === "single" ? formik.values.message : data.message}
        onChange={mode === "single" ? formik.handleChange : (e) => updateData({message: e.target.value})}
        error={renderError("message")}
        helperText={renderHelperText("message")}
      />
      <p></p>
      <TextField
        size='small'
        fullWidth
        id="link"
        name="link"
        label="Link"
        value={mode === "single" ? formik.values.link : data.link}
        onChange={mode === "single" ? formik.handleChange : (e) => updateData({link: e.target.value})}
        error={renderError("link")}
        helperText={renderHelperText("link")}
      />
      <p></p>

      <Typography variant='h7'>Categories</Typography>
      <FormControl fullWidth>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={mode === "single" ? categoryId: data.category_id}
          onChange={mode === "single" ? handleChange : (e) => updateData({category_id: e.target.value})}
          size="small"
          sx={{borderRadius: "30px"}}
        >
          {
            categories?.map((a) => (
              <MenuItem value={a.id}>
                {a.name}
              </MenuItem>
            ))
          }
        </Select>
      </FormControl>
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
                setAnnouncementsPayload([...announcementsPayload, data])
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
              onClick={() => addBulkAnnouncements()}
              disabled={mode === "bulk" && !announcementsPayload?.length}
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

export default AnnouncementsForm