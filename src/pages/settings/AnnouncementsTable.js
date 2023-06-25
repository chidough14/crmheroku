import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Button, Checkbox, Pagination, Snackbar, Tooltip, Typography } from '@mui/material';
import { AddOutlined, DeleteOutline, EditOutlined } from '@mui/icons-material';
import AddAnnouuncementModal from './modals/AddAnnouuncementModal';
import MuiAlert from '@mui/material/Alert';
import AlertDialog from './modals/AlertDialog';
import { useDispatch, useSelector } from 'react-redux';
import { removeAnnouncement, removeAnnouncements, setShowDeleteNotification } from '../../features/AnnouncementsSlice';
import instance from '../../services/fetchApi';
import { arraysHaveSameContents } from '../../services/checkers';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});


const AnnouncementsTable = ({rows, announcementsLoading, socket, getAnnouncements}) => {
  const [openModal, setOpenModal] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [openAlert, setOpenAlert] = React.useState(false);
  const [severity, setSeverity] = React.useState("");
  const [openSnackAlert, setOpenSnackAlert] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState("");
  const [announcementObj, setAnnouncementObj] = React.useState();
  const [editMode, setEditMode] = React.useState(false);
  const [announcementsIds, setAnnouncementsIds] = React.useState([]);
  const [announcementId, setAnnouncementId] = React.useState(null);
  const [bulkMode, setBulkMode] = React.useState(false);
  const [header, setHeader] = React.useState("");
  const { showDeleteNotification } = useSelector(state => state.announcement)
  const dispatch = useDispatch()

  React.useEffect(() => {

    setPage(rows?.current_page)

  }, [rows?.current_page])

  React.useEffect(() => {

    if(bulkMode) {
      setHeader("Announcements")
    } else {
      setHeader("Announcement")
    }

  }, [bulkMode])

  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenSnackAlert(false);
  };

  const deleteAnnouncement = async () => {
    dispatch(setShowDeleteNotification({showDeleteNotification: true}))
    if(bulkMode) {
      await instance.post(`announcements-bulk-delete`, {announcementsIds})
      .then(() => {
        dispatch(setShowDeleteNotification({showDeleteNotification: false}))
        dispatch(removeAnnouncements({announcementsIds}))
        setAnnouncementsIds([])
        setOpenAlert(false)
        setOpenSnackAlert(true)
        setSeverity("success")
        setAlertMessage("Announcements Deleted")
      })
      .catch(()=> {
        dispatch(setShowDeleteNotification({showDeleteNotification: false}))
        setOpenSnackAlert(true)
        setSeverity("error")
        setAlertMessage("Ooops an error was encountered")
      })
    } else {
      await instance.delete(`announcements/${announcementObj.id}`)
      .then(() => {
        dispatch(setShowDeleteNotification({showDeleteNotification: false}))
        dispatch(removeAnnouncement({announcementId: announcementObj.id}))
        setOpenAlert(false)
        setOpenSnackAlert(true)
        setSeverity("success")
        setAlertMessage("Announcement Deleted")
      })
      .catch(()=> {
        dispatch(setShowDeleteNotification({showDeleteNotification: false}))
        setOpenSnackAlert(true)
        setSeverity("error")
        setAlertMessage("Ooops an error was encountered")
      })
    }
  };

  return (
    <>
      <div style={{display: "flex", justifyContent: "space-between"}}>
        <Typography variant='h6'></Typography>

        {
          announcementsIds.length ? (
            <div>
              <Tooltip title="Delete">
                <DeleteOutline 
                  style={{marginBottom: "-5px", cursor: "pointer", marginRight: "5px"}} 
                  onClick={() => {
                    setOpenAlert(true)
                    setBulkMode(true)
                  }}
                />
              </Tooltip>

              <span>
                { announcementsIds.length } Items Selected
              </span>
            </div>
          ) : null
        }

     
        <Button  
          variant="contained" 
          size='small' 
          style={{borderRadius: "30px", float: "right"}} 
          onClick={()=> {
            setOpenModal(true)
            setEditMode(false)
          }}
          // disabled={user?.role !== "admin"}
        >
          <AddOutlined />
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>
                <Checkbox
                  checked={arraysHaveSameContents(rows?.data?.map((a) => a?.id), announcementsIds)}
                  indeterminate={announcementsIds.length > 0 && announcementsIds.length < rows?.data?.length}
                  onChange={(e,f) => {
                    if (f) {
                      let ids = rows?.data?.map((a) => a.id)
  
                      setAnnouncementsIds(ids)
                    } else {
                      setAnnouncementsIds([])
                    }
                  }}
                  inputProps={{ 'aria-label': 'controlled' }}
                  style={{marginRight: "-24px"}}
                />
              </TableCell>
              <TableCell>Message</TableCell>
              <TableCell >Link</TableCell>
              <TableCell >
                {announcementId ? "Actions" : null}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows?.data?.map((row) => (
              <TableRow
                key={row?.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                onMouseEnter={() => {
                  setAnnouncementId(row?.id)
                }}
                onMouseLeave={()=> {
                  setAnnouncementId(null)
                }}
              >
                <TableCell style={{ width: 160 }}>
                  <Checkbox
                    checked={announcementsIds.map((a) => a).includes(row?.id)}
                    onChange={(e,f) => {
                      if(f) {
                        setAnnouncementsIds([...announcementsIds, row.id])
                      } else {
                        setAnnouncementsIds(announcementsIds.filter((b) => b !== row.id))
                      }
                    }}
                    inputProps={{ 'aria-label': 'controlled' }}
                    style={{marginRight: "-24px"}}
                  />
                </TableCell>
                <TableCell style={{ width: 160 }}>
                  {row?.message}
                </TableCell>
                <TableCell style={{ width: 160 }} >{row?.link}</TableCell>
                <TableCell style={{ width: 160 }}>
                  {
                    announcementId === row?.id ? (
                      <>
                        <Button
                          size='small'
                          // disabled={user?.role !== "admin"}
                        >
                          <EditOutlined
                            style={{cursor: "pointer"}}
                            onClick={() => {
                              setEditMode(true)
                              setOpenModal(true)
                              setAnnouncementObj(row)
                            }}
                          />
                        </Button>
                      
                        <Button
                          size='small'
                          // disabled={user?.role !== "admin"}
                        >
                          <DeleteOutline 
                            style={{cursor: "pointer"}}
                            onClick={() => {
                              setOpenAlert(true)
                              setAnnouncementObj(row)
                            }}
                          />
                        </Button>
                      </>
                    ) : null
                  }
              
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <div style={{marginTop: "50px", marginLeft: "40%"}}>
        <Pagination
          count={ Math.ceil(rows?.total / rows?.per_page)}
          page={page}
          onChange={(page, idx) => {
            getAnnouncements(idx)
          }}
          color="secondary"
          showFirstButton
          showLastButton
        />
      </div>

      <AddAnnouuncementModal
        open={openModal}
        setOpen={setOpenModal}
        setOpenAlert={setOpenSnackAlert}
        setAlertMessage={setAlertMessage}
        setSeverity={setSeverity}
        announcement={announcementObj}
        editMode={editMode}
        socket={socket}
      />

      <AlertDialog
        open={openAlert}
        setOpen={setOpenAlert}
        deleteItem={deleteAnnouncement}
        companyMode={false}
        showDeleteNotification={showDeleteNotification}
        header={header}
        setBulkMode={setBulkMode}
      />

      <Snackbar open={openSnackAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={severity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
  )
}

export default AnnouncementsTable