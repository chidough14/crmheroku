import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Button, Pagination, Snackbar } from '@mui/material';
import { AddOutlined, DeleteOutline, EditOutlined } from '@mui/icons-material';
import AddAnnouuncementModal from './modals/AddAnnouuncementModal';
import MuiAlert from '@mui/material/Alert';
import AlertDialog from './modals/AlertDialog';
import { useDispatch, useSelector } from 'react-redux';
import { removeAnnouncement, setShowDeleteNotification } from '../../features/AnnouncementsSlice';
import instance from '../../services/fetchApi';

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
  const { showDeleteNotification } = useSelector(state => state.announcement)
  const dispatch = useDispatch()

  React.useEffect(() => {

    setPage(rows?.current_page)

  }, [rows?.current_page])

  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenSnackAlert(false);
  };

  const deleteAnnouncement = async () => {
    dispatch(setShowDeleteNotification({showDeleteNotification: true}))
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
  
    //after delete set productobj to empty
  };

  return (
    <>
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

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Message</TableCell>
              <TableCell align="right">Link</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows?.data?.map((row) => (
              <TableRow
                key={row.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.message}
                </TableCell>
                <TableCell align="right">{row.link}</TableCell>
                <TableCell align="right">
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
        header="Announcement"
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