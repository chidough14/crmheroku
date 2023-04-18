import { Box, Button, InputLabel, Modal, Select, TextField, Typography, MenuItem, Snackbar } from '@mui/material'
import MuiAlert from '@mui/material/Alert';
import { useFormik } from 'formik';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';
import { addProduct, updateProduct } from '../../../features/ProductSlice';
import instance from '../../../services/fetchApi';

// const Alert = React.forwardRef(function Alert(props, ref) {
//   return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
// });

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
  price: yup
    .number('Enter your price')
    .required('Price is required'),
});

const AddProductModal = ({open, setOpen, editMode, product, setOpenAlert, setAlertMessage, setSeverity}) => {
  const handleClose = () => setOpen(false);
  const user = useSelector((state) => state.user)
  const dispatch = useDispatch()

  useEffect(() => {
    if (editMode && product) {
      formik.setValues(product)
    }

  }, [editMode, product])

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      price: 0,
      tax_percentage: 3
    },
    validationSchema: validationSchema,
    onSubmit: async (values, {resetForm}) => {
      if (editMode) {
        let body = {
          name: values.name,
          description: values.description,
          tax_percentage: values.tax_percentage,
          price: parseFloat(values.price)
        }

        await instance.patch(`products/${product.id}`, body)
        .then((res) => {
          setOpenAlert(true)
          setSeverity("success")
          setAlertMessage("Product Updated")
          dispatch(updateProduct({product: res.data.product}))
          handleClose()
          resetForm()
        })
        .catch((err) => {
          setOpenAlert(true)
          setSeverity("error")
          setAlertMessage("Ooops an error was encountered")
          handleClose()
          resetForm()
        })

      } else {
        let body = {
          ...values,
          price: parseFloat(values.price)
        }
  
        await instance.post(`products`, body)
        .then((res) => {
          setOpenAlert(true)
          setSeverity("success")
          setAlertMessage("Product Added")
          dispatch(addProduct({product: res.data.product}))
          handleClose()
          resetForm()
        })
        .catch((err) => {
          setOpenAlert(true)
          setSeverity("error")
          setAlertMessage("Ooops an error was encountered")
          handleClose()
          resetForm()
        })
      }
    
      
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
                 {editMode ? "Edit" : "Add"} Product
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
              <TextField
                required
                size='small'
                fullWidth
                id="price"
                name="price"
                label="Price"
                value={formik.values.price}
                onChange={formik.handleChange}
                error={formik.touched.price && Boolean(formik.errors.price)}
                helperText={formik.touched.price && formik.errors.price}
              />
              <p></p>
              <InputLabel id="demo-select-small">Tax %</InputLabel>
              <Select
                id='tax_percentage'
                name="tax_percentage"
                label="Tax %"
                size='small'
                fullWidth
                value={formik.values.tax_percentage}
                onChange={formik.handleChange}
              >
                <MenuItem value={3}>3</MenuItem>
                <MenuItem value={12}>12</MenuItem>
                <MenuItem value={25}>25</MenuItem>
              </Select>
              <p></p>
              <div style={{display: "flex", justifyContent: "space-between"}}>
                <Button size='small' color="primary" variant="contained"  type="submit" style={{borderRadius: "30px"}}>
                 {editMode ? "Save": "Add"}
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

        {/* <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
          <Alert onClose={handleCloseAlert} severity="success" sx={{ width: '100%' }}>
            {alertMessage}
          </Alert>
        </Snackbar> */}
    </>
  )
}

export default AddProductModal