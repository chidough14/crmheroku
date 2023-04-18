import { AddOutlined, DeleteOutlined } from '@mui/icons-material'
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Snackbar, Toolbar, Tooltip, Typography } from '@mui/material'
import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useMatch, useNavigate, useParams } from 'react-router-dom'
import ActivityModal from '../components/activities/ActivityModal'
import AddCompanyToListModal from '../components/company/AddCompanyToListModal'
import ComanyActivitiesTable from '../components/company/CompanyActivitiesTable'
import LineChart from '../components/company/LineChart'
import Map from '../components/company/Map'
import { setSingleCompany } from '../features/companySlice'
import { removeCompanyFromList } from '../features/listSlice'
import instance from '../services/fetchApi'
import { getToken } from '../services/LocalStorageService'
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Company = ({companyObj}) => {
  const params = useParams()
  const dispatch = useDispatch()
  const {company} = useSelector(state => state.company)
  const [open, setOpen] = useState(false);
  const [openActivityModal, setOpenActivityModal] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleOpenActivityModal = () => setOpenActivityModal(true);
  const {pathname} = useLocation()
  const {selectedCompanyId, list} = useSelector(state => state.list)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [severity, setSeverity] = useState("");


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

  const isListPage = useMatch("/listsview/*", pathname)
  
  useEffect(() => {
    const fetchCompany = async (id) => {
      setLoading(true)
      await instance.get(`companies/${id}`)
      .then((res)=> {
        dispatch(setSingleCompany({company: res.data.company}))
        setLoading(false)
      })
      .catch(() => {
        showAlert("Ooops an error was encountered", "error")
      })
    }

    if (isListPage && selectedCompanyId) {
      fetchCompany(selectedCompanyId)
    } else {
      fetchCompany(params.id)
    }
  }, [params.id, isListPage, selectedCompanyId])

  const token = getToken()
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [token])

  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true)
  }

  const agree = async () => {
    await instance.delete(`companies/${selectedCompanyId}/lists`)
    .then((res) => {
      showAlert("Company removed from list", "success")
      dispatch(removeCompanyFromList({companyId: selectedCompanyId}))
      handleClose()
    })
    .catch(() => {
      showAlert("Ooops an error was encountered", "error")
    })
  }

  const handleClose = () => {
    setOpenDeleteDialog(false)
  }

  return (
    <>
      {
        loading ? (
          <Box sx={{ display: 'flex', marginLeft: "50%" }}>
            <CircularProgress />
          </Box>
        ) : (
          <div>
            {
              (isListPage && !list) ? (
                    <p>List has been deleted</p>
              ) : (
                <>
                  {
                        (isListPage && !list?.companies.length) ? (
                            <Toolbar>
                               <Typography variant='h5'  component="div" sx={{ flexGrow: 2 }}>No companies in list</Typography>
                            </Toolbar>
                        ) : (
                          <>
                            <Toolbar>
                              <Typography variant='h5'  component="div" sx={{ flexGrow: 2 }}>{`${company?.name}'s Details`}</Typography>
                              <Button variant="contained" style={{borderRadius: "30px"}} size='small' onClick={handleOpenDeleteDialog} disabled={!isListPage || !list?.companies.length}>
                                <Tooltip title="Delete company from list" placement="top">
                                  <DeleteOutlined />
                                </Tooltip> 
                              </Button>&nbsp;&nbsp;&nbsp;
          
                              <Button variant="contained" style={{borderRadius: "30px"}} size='small' onClick={handleOpen} disabled={isListPage && !list?.companies.length}>
                                <Tooltip title="Add company to list" placement="top">
                                  <AddOutlined />
                                </Tooltip> 
                              </Button>&nbsp;&nbsp;&nbsp;
          
                              <Button variant="contained" style={{borderRadius: "30px"}} size='small' onClick={handleOpenActivityModal} disabled={isListPage && !list?.companies.length}>Start Activity</Button>
                            </Toolbar>

                            <div style={{display: "flex", justifyContent: "space-between", marginBottom: "20px"}}>
                            <div>
                              <Typography variant="h7" display="block"  gutterBottom>
                                <b>Name</b> : {company?.name}
                              </Typography>

                              <Typography variant="h7" display="block"  gutterBottom>
                                <b>Address</b> : {company?.address}
                              </Typography>

                              <Typography variant="h7" display="block"  gutterBottom>
                                <b>Email</b> : {company?.email}
                              </Typography>

                              <Typography variant="h7" display="block"  gutterBottom>
                                <b>Phone</b> : {company?.phone}
                              </Typography>

                              <Typography variant="h7" display="block"  gutterBottom>
                                <b>Contact Person</b> : {company?.contactPerson}
                              </Typography>
                            </div>

                            <div style={{margin: "auto", width: "50%"}}>
                              <Map />
                            </div>
                            </div>
                            <Divider>
                              <Typography variant='h6'><b>Activities</b></Typography>
                            </Divider>
                            <div>
                              <ComanyActivitiesTable rows={company?.activities} />
                            </div>
                          </>
                        )
                  }
                </>
              )
            }

            {/* <div style={{display: "flex", justifyContent: "space-between", marginTop: "20px"}}>
              <LineChart />
            </div> */}

            <AddCompanyToListModal
              open={open}
              setOpen={setOpen} 
              companyId={company?.id}
            />

            <ActivityModal
              openActivityModal={openActivityModal}
              setOpen={setOpenActivityModal}
              companyObject={company}
            />


            <Dialog
              open={openDeleteDialog}
              onClose={handleClose}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">
                Delete company from list
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                Are you sure you want to delete this company from the list?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Disagree</Button>
                <Button onClick={agree} autoFocus>
                  Agree
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        )
      }

      <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={severity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
  </>
  )
}
  


export default Company