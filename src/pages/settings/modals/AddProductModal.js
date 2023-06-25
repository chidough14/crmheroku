import { Box, Button, InputLabel, Modal, Select, TextField, Typography, MenuItem, Snackbar, CircularProgress } from '@mui/material'
import MuiAlert from '@mui/material/Alert';
import { useFormik } from 'formik';
import React, { useEffect, useReducer, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';
import { addProduct, addProducts, setProductAdding, updateProduct } from '../../../features/ProductSlice';
import instance from '../../../services/fetchApi';
import { AddOutlined } from '@mui/icons-material';
import { checkEmptyString } from '../../../services/checkers';
import ProductForm from '../forms/ProductForm';

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
 
  const user = useSelector((state) => state.user)
  const { productAdding } = useSelector((state) => state.product)
  const [bulkAdd, setBulkAdd] = useState(false)
  const [productsPayload, setProductsPayload] = useState([])
  const dispatch = useDispatch()

  const handleClose = () => {
    setOpen(false)
    setBulkAdd(false)
  }

  const initialState = {
    name: '',
    description: '',
    price: 0,
    tax_percentage: 3
  };

  const [data, updateData] = useReducer(
    (state, updates) => ({ ...state, ...updates }),
    initialState
  );

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
      dispatch(setProductAdding({productAdding: true}))
      if (editMode) {
        let body = {
          name: values.name,
          description: values.description,
          tax_percentage: values.tax_percentage,
          price: parseFloat(values.price)
        }

        await instance.patch(`products/${product.id}`, body)
        .then((res) => {
          dispatch(setProductAdding({productAdding: false}))
          setOpenAlert(true)
          setSeverity("success")
          setAlertMessage("Product Added")
          dispatch(updateProduct({product: res.data.product}))
          handleClose()
          resetForm()
        })
        .catch((err) => {
          dispatch(setProductAdding({productAdding: false}))
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
          dispatch(setProductAdding({productAdding: false}))
          setOpenAlert(true)
          setSeverity("success")
          setAlertMessage("Product Added")
          dispatch(addProduct({product: res.data.product}))
          handleClose()
          resetForm()
        })
        .catch((err) => {
          dispatch(setProductAdding({productAdding: false}))
          setOpenAlert(true)
          setSeverity("error")
          setAlertMessage("Ooops an error was encountered")
          handleClose()
          resetForm()
        })
      }
    
      
    },
  });

  const showButtonText = (text) => {
    if (productAdding) {
      return (
        <Box sx={{ display: 'flex' }}>
          <CircularProgress size={24} color="inherit" />
        </Box>
      )
    } else {
      return text
    }
  }

  const showProductCount = (count) => {
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

  const addBulkProducts = async () => {
    dispatch(setProductAdding({productAdding: true}))

    await instance.post(`products-add-bulk`, {productsPayload})
    .then((res) => {
      dispatch(setProductAdding({productAdding: false}))
      setOpenAlert(true)
      setSeverity("success")
      setAlertMessage("Products Added")
      setProductsPayload([])
      updateData(initialState)
      dispatch(addProducts({products: res.data.products}))
      handleClose()
    })
    .catch((err) => {
      dispatch(setProductAdding({productAdding: false}))
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
                  {editMode ? "Edit" : "Add"}  {bulkAdd ? "Products" : "Product"}
                </Typography>

                <span>
                  {
                    showProductCount(productsPayload.length)
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
                          setProductsPayload([])
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
                  <ProductForm 
                    updateData={updateData}
                    data={data}
                    productsPayload={productsPayload}
                    setProductsPayload={setProductsPayload}
                    checkEmptyString={checkEmptyString}
                    addBulkProducts={addBulkProducts}
                    formik={formik}
                    showButtonText={showButtonText}
                    handleClose={handleClose}
                    mode="bulk"
                    initialState={initialState}
                  />
                ) : (
                  <ProductForm
                    formik={formik}
                    handleClose={handleClose}
                    showButtonText={showButtonText}
                    mode="single"
                    initialState={initialState}
                    editMode={editMode}
                  />
                )
              }
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