import {  SortOutlined } from '@mui/icons-material'
import {  Box, Button, Snackbar, Tab, Tabs, Toolbar, Tooltip, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux'
import ViewInvoiceModal from '../../components/invoice/ViewInvoiceModal'
import { setAllInvoices, setOpenViewInvoiceModal, setSortOptionValue, setSortOptionValuePayments, setStripeOrders } from '../../features/InvoiceSlice'
import instance from '../../services/fetchApi'
import OrdersTable from './OrdersTable'
import SortButton from './SortButton'
import MuiAlert from '@mui/material/Alert';
import StripePaymentsTable from './StripePaymentsTable';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const Orders = () => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [value, setValue] = useState(0);
  const [invoiceDetails, setInvoiceDetails] = useState(false)
  const { invoices, sortOption, stripeOrders, sortOptionPayments } = useSelector(state => state.invoice)
  const user = useSelector(state => state.user)
  const [company, setCompany] = useState()
  const [openAlert, setOpenAlert] = useState(false)
  const [severity, setSeverity] = useState("")
  const [text, setText] = useState("")

  const handleCloseAlert = () => {
    setOpenAlert(false)
  }

  const handleChange = (event, newValue) => {
    setValue(newValue);
  }

  const showAlert = (txt) => {
    setOpenAlert(true)
    setSeverity("error")
    setText(txt)
  }

  const getInvoices = async (page = 1) => {
    setLoading(true)
    await instance.get(`invoices?page=${page}`)
    .then((res) => {
      dispatch(setAllInvoices({invoices: res.data.invoices}))
      setLoading(false)
    })
    .catch(()=> {
      showAlert("Ooops an error was encountered")
    })
  }

  const getSortedInvoices = async (option, page = 1) => {
    setLoading(true)
    await instance.get(`filter-invoices/${option}?page=${page}`)
    .then((res) => {
      dispatch(setAllInvoices({invoices: res.data.invoices}))
      setLoading(false)
    })
    .catch(()=> {
      showAlert("Ooops an error was encountered")
    })
  }

  const viewInvoice = async (value) => {
    setInvoiceDetails(value)
    dispatch(setOpenViewInvoiceModal({value: true}))

    await instance.get(`companies/${value.activity.company_id}`)
    .then((res) => {
      setCompany(res.data.company)
    })
    .catch(()=> {
      showAlert("Ooops an error was encountered")
    })
  }

  useEffect(() => {
    if (sortOption === "all") {
      getInvoices()
    } else {
      getSortedInvoices(sortOption)
    }
  }, [sortOption])

  const getStripePayments = async (page = 1) => {
    await instance.get(`stripe-orders?page=${page}`)
    .then((res)=> {
      dispatch(setStripeOrders({stripeOrders: res.data.orders}))
    })
    .catch(() => {

    })
  }
  
  useEffect(() => {
    if (value !== 1) {

    } 

    if (value === 1) {

      if (sortOptionPayments === "all") {
        getStripePayments()
      } else {
        console.log("options")
      }
    
    }
  }, [value, sortOptionPayments])

  const setSortOption =  (value) => {
    dispatch(setSortOptionValue({option: value}))
  }

  const setSortOptionPayments =  (value) => {
    dispatch(setSortOptionValuePayments({option: value}))
  }

  return (
    <div>

      <Box sx={{ width: '100%', marginTop: "30px" }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            <Tab label="My Orders" {...a11yProps(0)} />
            <Tab label="Stripe Payments" {...a11yProps(1)} />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <Toolbar>
            <Typography variant='h5'  component="div" sx={{ flexGrow: 2 }} >My Orders</Typography>

            <SortButton setSortOption={setSortOption} sortOption={sortOption} title="Sort Invoices" />
        
          </Toolbar>

          <OrdersTable 
            invoices={invoices} 
            getInvoices={getInvoices}
            viewInvoice={viewInvoice}
            getSortedInvoices={getSortedInvoices}
            sortOption={sortOption}
            loading={loading}
          />
        </TabPanel>

        <TabPanel value={value} index={1}>
          <Toolbar>
            <Typography variant='h5'  component="div" sx={{ flexGrow: 2 }} >Stripe Payments</Typography>

            <SortButton setSortOption={setSortOptionPayments} sortOption={sortOptionPayments} title="Sort Payments" />
        
          </Toolbar>

          <StripePaymentsTable 
            stripeOrders={stripeOrders} 
            getStripePayments={getStripePayments}
          />
        </TabPanel>


       
        
      </Box>
    


      <ViewInvoiceModal
        invoice={invoiceDetails}
        companyName={company?.name}
        activity={invoiceDetails?.activity}
        user={user}
      />


      <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={severity} sx={{ width: '100%' }}>
          { text }
        </Alert>
      </Snackbar>
    </div>
  )
}

export default Orders