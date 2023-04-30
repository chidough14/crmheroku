
import { Box, Button, InputLabel, Modal, Select, TextField, Typography, MenuItem, Snackbar, CircularProgress } from '@mui/material'
import MuiAlert from '@mui/material/Alert';
import { useFormik } from 'formik';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';
import { addInvoiceToActivity, setShowCreatingInvoiceSpinner } from '../../features/ActivitySlice';
import { setInvoice, updateInvoice } from '../../features/InvoiceSlice';
import instance from '../../services/fetchApi';


const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const style = {
  // position: 'absolute',
  // top: '50%',
  // left: '50%',
  // transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  //border: '2px solid #000',
  //boxShadow: 24,
  p: 4,
};

const validationSchema = yup.object({
  payment_method: yup
    .string('Enter a payment method')
    .required('Payment method is required'),
  billing_address: yup
    .string('Enter your billibg address')
    .required('Billing address  is required'),
  reference: yup
    .string('Enter refernce')
    .required('Reference is required'),
});

const randomString = (length, chars) => {
  let mask = '';
  if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
  if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (chars.indexOf('#') > -1) mask += '0123456789';
  if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
  let result = '';
  for (let i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
  return result;
}

const InvoiceForm = ({activityId, invoice, editMode, showCreatingInvoiceSpinner}) => {
  const user = useSelector((state) => state.user)
  const [openAlert, setOpenAlert] = useState(false)
  const [message, setMessage] = useState("")
  const [severity, setSeverity] = useState("")
  const dispatch = useDispatch()


  const handleCloseAlert = () => {
    setOpenAlert(false)
  }

  useEffect(() => {
    if (editMode) {
      formik.setValues(invoice)
    }
  }, [editMode])

  const showAlert = (msg, sev) => {
    setMessage(msg)
    setSeverity(sev)
    setOpenAlert(true)
  }

  const formik = useFormik({
    initialValues: {
      payment_method: '',
      billing_address: '',
      reference: '',
      status: '',
      type: '',
      payment_term: 30,
      email: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values, {resetForm}) => {
      if (editMode) {
        dispatch(setShowCreatingInvoiceSpinner({showCreatingInvoiceSpinner: true}))

        let body = {
          ...values,
          status: values.status === "" ? null : values.status,
          type: values.type === "" ? null : values.type,
        }

        await instance.patch(`invoices/${invoice.id}`, body)
        .then((res) => {
          showAlert("Invoice updated", "success")
          dispatch(setInvoice({invoice: res.data.invoice}))
          dispatch(updateInvoice({invoice: res.data.invoice}))
          dispatch(setShowCreatingInvoiceSpinner({showCreatingInvoiceSpinner: false}))
        })
        .catch(() => {
          showAlert("Oops an error was encountered", "error")
          dispatch(setShowCreatingInvoiceSpinner({showCreatingInvoiceSpinner: false}))
        })
      } else {
        dispatch(setShowCreatingInvoiceSpinner({showCreatingInvoiceSpinner: true}))

        let body = {
          ...values,
          invoice_no: randomString(10, '#A'),
          status: values.status === "" ? null : values.status,
          type: values.type === "" ? null : values.type,
          user_id: user.id,
          activity_id: activityId
        }
  
        await instance.post(`invoices`, body)
        .then((res) => {
          showAlert("Invoice created successfully", "success")
          resetForm()
          dispatch(addInvoiceToActivity({invoice: res.data.invoice}))
          dispatch(setShowCreatingInvoiceSpinner({showCreatingInvoiceSpinner: false}))
        })
        .catch(() => {
          showAlert("Oops an error was encountered", "error")
          dispatch(setShowCreatingInvoiceSpinner({showCreatingInvoiceSpinner: false}))
        })
      }
   
      
    },
  });

  const showButtonContent = (text) => {
    if (showCreatingInvoiceSpinner) {
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
    <div>
      <Box sx={style}>
        <form onSubmit={formik.handleSubmit}>

          <TextField
            required
            size='small'
            multiline
            rows={4}
            fullWidth
            id="billing_address"
            name="billing_address"
            label="Billing Address"
            value={formik.values.billing_address}
            onChange={formik.handleChange}
            error={formik.touched.billing_address && Boolean(formik.errors.billing_address)}
            helpertext={formik.touched.billing_address && formik.errors.billing_address}
          />
          <p></p>
          <TextField
            required
            size='small'
            fullWidth
            id="reference"
            name="reference"
            label="Reference"
            value={formik.values.reference}
            onChange={formik.handleChange}
            error={formik.touched.reference && Boolean(formik.errors.reference)}
            helpertext={formik.touched.reference && formik.errors.reference}
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
            helpertext={formik.touched.email && formik.errors.email}
          />
          <p></p>
          <InputLabel id="demo-select-small">Payment Term</InputLabel>
          <Select
            //required
            id='payment_term'
            name="payment_term"
            label="Payment Term"
            size='small'
            fullWidth
            value={formik.values.payment_term}
            onChange={formik.handleChange}
            error={formik.touched.payment_term && Boolean(formik.errors.payment_term)}
            helpertext={formik.touched.payment_term && formik.errors.payment_term}
          >
            <MenuItem value={30}>30</MenuItem>
            <MenuItem value={60}>60</MenuItem>
            <MenuItem value={90}>90</MenuItem>
            
          </Select>
          <p></p>
          <InputLabel id="demo-select-small">Status</InputLabel>
          <Select
            //required
            id='status'
            name="status"
            label="Status"
            size='small'
            fullWidth
            value={formik.values.status}
            onChange={formik.handleChange}
            error={formik.touched.status && Boolean(formik.errors.status)}
            helpertext={formik.touched.status && formik.errors.status}
          >
            <MenuItem value="paid">Paid</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            
          </Select>
          <p></p>
          <InputLabel id="demo-select-small">Payment Method</InputLabel>
          <Select
            required
            id='payment_method'
            name="payment_method"
            label="Payment Method"
            size='small'
            fullWidth
            value={formik.values.payment_method}
            onChange={formik.handleChange}
            error={formik.touched.payment_method && Boolean(formik.errors.payment_method)}
            helpertext={formik.touched.payment_method && formik.errors.payment_method}
          >
            <MenuItem value="cash">Cash</MenuItem>
            <MenuItem value="card">Card</MenuItem>
            
          </Select>
          <p></p>
          <InputLabel id="demo-select-small">Type</InputLabel>
          <Select
            //required
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
            <MenuItem value="onetime">One Time</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
          </Select>
          <p></p>
          <div style={{display: "flex", justifyContent: "space-between"}}>

            {
              !editMode &&
              <Button 
                size='small' 
                color="error" 
                variant="contained" 
                onClick={() => {
                  
                  formik.resetForm()
                }}
                style={{borderRadius: "30px"}}
              >
                Reset
              </Button>
            }

            <Button 
              variant="contained" 
              disableElevation 
              style={{borderRadius: "30px"}} 
              type="submit" 
            >
               {editMode ? showButtonContent("Save Changes") : showButtonContent("Create Invoice")}
            </Button>
          </div>
        
        </form>
      </Box>

      <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={severity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </div>
  )
}

export default InvoiceForm