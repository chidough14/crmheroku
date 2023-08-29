import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Snackbar, Tab, Tabs, Toolbar, Tooltip, Typography } from '@mui/material'
import React from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types';
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { addComments, addProductItemToActivity, deleteActivityEvent, editComment, removeActivity, removeInvoiceFromActivity, removeProductItem, setClosePrompt, setDownvotes, setShowDeleteNotification, setSingleActivity, setUpvotes, updateProductItem } from '../../features/ActivitySlice'
import instance from '../../services/fetchApi'
import { AddOutlined, DeleteOutlined, EditOutlined } from '@mui/icons-material';
import ActivityProductsTable from './ActivityProductsTable';
import AddProductToActivityModal from '../../components/activities/AddProductToActivityModal';
import ActivityModal from '../../components/activities/ActivityModal';
import ActivityEventsTable from './ActivityEventsTable';
import EventModal from '../../components/events/EventModal';
import ViewEventModal from '../../components/events/ViewEventModal';
import { deleteEvent } from '../../features/EventSlice';
import PromptDialog from './PromptDialog';
import InvoiceForm from './InvoiceForm';
import ActivityInvoiceTable from './ActivityInvoiceTable';
import ViewInvoiceModal from '../../components/invoice/ViewInvoiceModal';
import { setOpenViewInvoiceModal } from '../../features/InvoiceSlice';
import { getToken } from '../../services/LocalStorageService';
import MuiAlert from '@mui/material/Alert';
import { loadStripe } from "@stripe/stripe-js"; 
import axios from "axios"
import { setProductAdding } from '../../features/ProductSlice';
import Comments from '../comments/Comments';
// import { DeltaToStringConverter } from '../../services/DeltaToStringConverter';
import deltaToString from "delta-to-string-converter"
import LineChart from '../../components/activities/LineChart';
import ActivityFiles from './ActivityFiles';
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

const ActivityDetails = ({socket}) => {
  const params = useParams()
  const dispatch = useDispatch()
  const {activity, openPrompt, showCreatingInvoiceSpinner, showDeleteNotification} = useSelector((state) => state.activity)
  const user = useSelector((state) => state.user)
  const [value, setValue] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const [openAddModal, setOpenAddModal] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [productId, setProductId] = React.useState();
  const [quantity, setQuantity] =  React.useState(0);
  const [openEditModal, setOpenEditModal] = React.useState(false);
  const [openDialogDeleteActivity, setOpenDialogDeleteActivity] = React.useState(false);
  const [openAddeventModal, setOpenAddEventModal] = React.useState(false);
  const [openViewEventModal, setOpenViewEventModal] = React.useState(false);
  const [openForm, setOpenForm] = React.useState(false);
  const [eventObj, setEventObj] = React.useState();
  const [invoiceDetails, setInvoiceDetails] = React.useState();
  const [total, setTotal] = React.useState(0);
  const [editingInvoice, setEditingInvoice] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [openAlert, setOpenAlert] =  React.useState(false);
  const [alertMessage, setAlertMessage] =  React.useState("");
  const [severity, setSeverity] =  React.useState("");
  
  const {state} = useLocation()


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

  const navigate = useNavigate()

  
  const token = getToken()

  useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [token])

  useEffect(() => {
    if (state && state.showSuccessAlert) {
      showAlert("Activity created", "success")
    }
  }, [state])

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const getUpvotes = async () => {
    await instance.get(`users-upvotes`)
    .then((res) => {
      dispatch(setUpvotes({upvotes: res.data.upvotes}))
    })
  };

  
  const getDownvotes = async () => {
    await instance.get(`users-downvotes`)
    .then((res) => {
      dispatch(setDownvotes({downvotes: res.data.downvotes}))
    })
  };

  useEffect(() => {
    getUpvotes()
    getDownvotes()
  }, [])

  const isValidJson = (string) => {
    try {
      JSON.parse(string)
      return true
    } catch (error) {
      return false
    }
  }

  useEffect(()=> {

    const getActivityDetails = async () => {
      setLoading(true)
      await instance.get(`activities/${params.id}`)
      .then((res) => {
        let formttedComments = res.data.activity.comments.map((a)=> {
          return {
            ...a,
            content: isValidJson(a.content) ? deltaToString(JSON.parse(a.content).ops) : a.content
          }
        })

        res.data.activity.comments = formttedComments
        dispatch(setSingleActivity({activity: res.data.activity}))
        setLoading(false)
      })
      .catch((e) => {
        showAlert("Oops an error was encountered", "error")
      })
    }

    getActivityDetails()

  }, [params.id])

  useEffect(()=> {
    if (openPrompt) {
      setValue(1)
    }
  }, [openPrompt])

  useEffect(()=> {
    
    let arr = []
    activity?.products?.map((a) => {
       let total = a.price * a.pivot.quantity
       arr.push(total)
    })
    setTotal(arr.reduce((a, b) => a + b, 0))


  }, [activity])

  const updateComments = (data, user, params, flag) => {
    let actId = data.activityId
    let comment = JSON.parse(data.comment)

    if(parseInt(params?.id) === actId) {
      if (flag === "add") {
        dispatch(addComments({comment}))
      } else {
        dispatch(editComment({comment}))
      }
  
    } else {
      
    }
  
    // if(comment.user_id === user?.id) {

    // } else {

    //   if(parseInt(params?.id) === actId) {
    //     if (flag === "add") {
    //       dispatch(addComments({comment}))
    //     } else {
    //       dispatch(editComment({comment}))
    //     }
    
    //   } else {
        
    //   }
    // }
  }

  useEffect(()=> {
     
    socket.on('comment_added', (data) => {
      updateComments(data, user, params, "add")
    
    });

    socket.on('comment_deleted', (data) => {
     
      updateComments(data, user, params, "delete")
    
    });

    socket.on('comment_edited', (data) => {
      updateComments(data, user, params, "edit")
    });

    socket.on('comment_upvoted', (data) => {
      updateComments(data, user, params, "upvote")
    });

  }, [params.id, socket])

  const addProductToActivity = async () => {
    dispatch(setProductAdding({productAdding: true}))
    let body = {
      productId: productId,
      quantity: quantity
    }
    await instance.post(`activities/${params.id}/addUpdateProduct`, body)
    .then((res) => {
      showAlert("Products updated", "success")
      if (editMode) {
        dispatch(updateProductItem({product: res.data.product}))
      } else {
        dispatch(addProductItemToActivity({product: res.data.product}))
      }

      setOpenAddModal(false)
      setEditMode(false)
      setQuantity(0)
      setProductId(undefined)
      dispatch(setProductAdding({productAdding: false}))
    
    })
    .catch(() => {
      showAlert("Oops an error was encountered", "error")
      dispatch(setProductAdding({productAdding: false}))
    })
  }

  const editItem = (value) => {
    setOpenAddModal(true)
    setEditMode(true)
    setQuantity(value.pivot.quantity)
    setProductId(value.id)
  }

  const deleteItem = (value) => {
    setOpen(true)
    setProductId(value.id)
  }

  const removeItem = async () => {
    if (eventObj) {
      dispatch(setShowDeleteNotification({showDeleteNotification: true}))

      await instance.delete(`events/${eventObj.id}`)
      .then((res) => {
        dispatch(setShowDeleteNotification({showDeleteNotification: false}))
        showAlert("Event deleted", "success")
        dispatch(deleteActivityEvent({id: eventObj.id}))
        dispatch(deleteEvent({eventId: eventObj.id}))
        setOpen(false)
        setEventObj()
      
      })
      .catch(()=> {
        showAlert("Oops an error was encountered", "error")
        dispatch(setShowDeleteNotification({showDeleteNotification: false}))
      })

    } else {
      dispatch(setShowDeleteNotification({showDeleteNotification: true}))

      await instance.delete(`activities/${params.id}/deleteProduct`, { data: {productId: productId}})
      .then((res) => {
        dispatch(setShowDeleteNotification({showDeleteNotification: false}))
        showAlert("Product deleted", "success")
        dispatch(removeProductItem({id: productId}))
        setOpen(false)
        setProductId(undefined)
      
      })
      .catch(()=> {
        showAlert("Oops an error was encountered", "error")
        dispatch(setShowDeleteNotification({showDeleteNotification: false}))
      })
    }
  
  }

  const deleteRecord = async () => {
    if (editingInvoice) {
      await instance.delete(`invoices/${invoiceDetails.id}`)
      .then((res) => {
        showAlert("Invoice deleted", "success")
        dispatch(removeInvoiceFromActivity({invoiceId: invoiceDetails.id}))
      
        setOpenDialogDeleteActivity(false)
      
      })
      .catch(()=> {
        showAlert("Oops an error was encountered", "error")
      })
    } else {
      await instance.delete(`activities/${params.id}`)
      .then((res) => {
        showAlert("Activity deleted", "success")
        dispatch(removeActivity({activityId: parseInt(params.id)}))
        dispatch(deleteEvent({activityId: parseInt(params.id)}))
        navigate("/activities")
        setOpenDialogDeleteActivity(false)
      
      })
      .catch(()=> {
        showAlert("Oops an error was encountered", "error")
      })
    }
   
  }

  const handleCloseDialog = () => {
    setOpen(false)
    setEventObj()
  }

  
  const editEvent = (event) => {
    setOpenViewEventModal(true)
    setEventObj(event)
  }

  
  const removeEvent = (event) => {
    setOpen(true)
    setEventObj(event)
  }

  const closePrompt = () => {
    dispatch(setClosePrompt({value: false}))
  }

  const agree = () => {
    setOpenForm(true)
    dispatch(setClosePrompt({value: false}))
  }

  const showInvoice = (row) => {
    setInvoiceDetails(row)
    dispatch(setOpenViewInvoiceModal({value: true}))
  }

  const showDeleteDialog = (row) => {
    setInvoiceDetails(row)
    setOpenDialogDeleteActivity(true)
    setEditingInvoice(true)
  }

  const makePayment = async () => {

    let items = activity.products.map((a) => {
      return {
        id: a.id,
        name: a.name,
        price: a.price,
        qty: a.pivot.quantity
      }
    })

    axios.post(`${process.env.REACT_APP_CLIENT_URL}api/create-checkout-session`, {
      userId: activity?.user_id,
      items,
      activityId: activity?.id,
      token
    })
    .then((res) => {
      if (res.data.url) {
        window.location.href = res.data.url
      }
    })
    .catch((err) => console.log(err))
  }


  return (
    <div>
      {/* <Toolbar>
        <Typography variant='h5'  component="div" sx={{ flexGrow: 2 }}>{`${activity?.label}`}</Typography>
      </Toolbar> */}
      {
        loading ? (
          <Box sx={{ display: 'flex', marginLeft: "50%" }}>
            <CircularProgress />
          </Box>
        ) : (
        <>
          <Box sx={{ width: '100%', marginTop: "30px" }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                <Tab label="Details" {...a11yProps(0)} />
                <Tab label="Products" {...a11yProps(1)} />
                <Tab label="Invoices" {...a11yProps(2)} />
                <Tab label="Movements" {...a11yProps(3)} />
                <Tab label="Attachments" {...a11yProps(4)} />
              </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
              <div style={{display: "flex", justifyContent: "space-between", marginBottom: "20px"}}>
                <div>
                  <Typography variant="h7" display="block"  gutterBottom>
                    <b>Label</b> : {activity?.label}
                  </Typography>

                  <Typography variant="h7" display="block"  gutterBottom>
                    <b>Description</b> : {activity?.description}
                  </Typography>

                  <Typography variant="h7" display="block"  gutterBottom>
                    <b>Assignee</b> : {activity?.assignedTo}
                  </Typography>

                  <Typography variant="h7" display="block"  gutterBottom>
                    <b>Type</b> : {activity?.type}
                  </Typography>

                  <Typography variant="h7" display="block"  gutterBottom>
                    <b>Estimate</b> : {activity?.earningEstimate}
                  </Typography>

                  <Typography variant="h7" display="block"  gutterBottom>
                    <b>Probability</b> : {activity?.probability}
                  </Typography>

                  <Typography variant="h7" display="block"  gutterBottom>
                    <b>Company</b> : 
                    <Button style={{borderRadius: "30px"}} onClick={() => navigate(`/companies/${activity?.company?.id}`)}>
                      {activity?.company?.name}
                    </Button>
                  </Typography>

                  <Button disabled={activity?.user_id !== user?.id} variant="contained" size='small' onClick={() => setOpenEditModal(true)} style={{borderRadius: "30px"}}><EditOutlined /></Button>&nbsp;&nbsp;&nbsp;

                  <Button disabled={activity?.user_id !== user?.id}  variant="contained" color='error' size='small' onClick={()=> setOpenDialogDeleteActivity(true)} style={{borderRadius: "30px"}}><DeleteOutlined /> </Button>
                </div>

                <div style={{margin: "auto", width: "60%"}}>
                  <div style={{display: "flex", justifyContent: "space-between"}}>
                    <Typography variant='h6'  component="div" sx={{ flexGrow: 2 }}><b>Upcoming Events</b></Typography>
                    <Button variant="contained" size='small' onClick={() => setOpenAddEventModal(true)} style={{borderRadius: "30px"}} disabled={activity?.user_id !== user?.id}>
                      <AddOutlined />
                    </Button>
                  </div>

                  <ActivityEventsTable
                    events={activity?.events}
                    editEvent={editEvent}
                    deleteEvent={removeEvent}
                    activity={activity}
                    user={user}
                  />
                </div>
              </div>
            </TabPanel>

            <TabPanel value={value} index={1}>
              <div style={{display: "flex", justifyContent: "space-between"}}>
                <Typography variant='h6'><b>Products</b></Typography>

                <Button disabled={activity?.user_id !== user?.id} variant="contained" size='small' style={{borderRadius: "30px"}} onClick={() => setOpenAddModal(true)}>Add Product</Button>
              </div>
            
              <div>
                <ActivityProductsTable 
                  products={activity?.products} 
                  editItem={editItem} 
                  deleteItem={deleteItem}
                  activity={activity}
                  user={user}
                />


                <div style={{display: "flex", justifyContent: "space-between", marginTop: "40px" }}>
                  <Typography variant='h5'  component="div" sx={{ flexGrow: 2}}>
                    <b>Total:</b> ${total}
                  </Typography>
                  
                  {
                    activity?.probability !== "Closed" ? (
                      <Tooltip title="Close the deal to create an invoice">
                        <div>
                          <Button 
                            variant="contained" 
                            disableElevation 
                            style={{borderRadius: "30px"}} 
                            disabled
                          >
                            Create Invoice
                          </Button>
                        </div>
                      </Tooltip>
                    ) : (
                      <div hidden={openForm}>
                        <Button 
                          variant="contained" 
                          disableElevation 
                          style={{borderRadius: "30px"}} 
                          onClick={() => setOpenForm(true)}
                          disabled={activity?.user_id !== user?.id}
                        >
                          Create Invoice
                        </Button>

                        <Button 
                          variant="contained" 
                          disableElevation 
                          style={{borderRadius: "30px"}} 
                          onClick={() => makePayment()}
                          disabled={activity?.user_id !== user?.id}
                        >
                          Pay with Stripe
                        </Button>
                      </div>
                    )
                  }
                  
                </div>
                
                {
                  openForm && (
                    <div>
                      <InvoiceForm activityId={activity?.id} showCreatingInvoiceSpinner={showCreatingInvoiceSpinner} />
                    </div>
                  )
                }
              
              
              </div>
            </TabPanel>

            <TabPanel value={value} index={2}>
              <ActivityInvoiceTable 
                invoices={activity?.invoices} 
                showInvoice={showInvoice} 
                showDeleteDialog={showDeleteDialog}
                activity={activity}
                user={user}
              />
            </TabPanel>

            <TabPanel value={value} index={3}>
              <LineChart
                data={activity?.movements}
              />
            </TabPanel>

            <TabPanel value={value} index={4}>
              <ActivityFiles files={activity?.files} />
            </TabPanel>
          </Box>

         {
          value === 0 && (
            <div>
              <Typography variant='h6'>
                Comments &nbsp; &nbsp;
                {
                  `(${activity?.comments?.length})`
                }
              </Typography>
              
              <Comments
                comments={activity?.comments}
                activityId={activity?.id}
                socket={socket}
              />
            </div>
          )
         }
        </>
        )
      }
      

      <AddProductToActivityModal
        open={openAddModal}
        setOpen={setOpenAddModal}
        setProductId={setProductId}
        quantity={quantity}
        setQuantity={setQuantity}
        addProductToActivity={addProductToActivity}
        editMode={editMode}
        setEditMode={setEditMode}
        productsinActivity={activity?.products}
      />

      <Dialog
        open={open}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {eventObj ? "Delete Event" : "Delete Product"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this {eventObj ? "event" : "product"} ?
          </DialogContentText>

          <DialogContentText id="alert-dialog-description" sx={{textAlign: "center", color: "red"}}>
            {
              showDeleteNotification && "Deleting..."
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>No</Button>
          <Button onClick={removeItem} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDialogDeleteActivity}
        onClose={() => setOpenDialogDeleteActivity(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Delete {editingInvoice ? "Invoice" : "Activity"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this {editingInvoice ? "invoice" : "activity"} ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialogDeleteActivity(false)}>No</Button>
          <Button onClick={deleteRecord} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <ActivityModal
       open={openEditModal}
       setOpen={setOpenEditModal}
       editMode={true}
       activity={activity && activity}
       socket={socket}
      />

      <EventModal
        open={openAddeventModal}
        setOpen={setOpenAddEventModal}
        activityId={activity?.id}
        user={user}
      />

      <ViewEventModal
        open={openViewEventModal}
        setOpen={setOpenViewEventModal}
        event={eventObj}
        showForm={true}
        //relatedActivity={activities.find((a) => a.id === eventObj?.activity_id)}
      />

      <PromptDialog
        open={openPrompt}
        closePrompt={closePrompt}
        agree={agree}
      />

      <ViewInvoiceModal
        invoice={invoiceDetails}
        companyName={activity?.company?.name}
        activity={activity}
        user={user}
      />


      <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={severity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </div>
  )
}

export default ActivityDetails