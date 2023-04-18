import * as React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, TableHead, Tooltip } from '@mui/material';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { ChangeCircleRounded, DeleteOutline } from '@mui/icons-material';
import instance from '../../services/fetchApi';
import { useDispatch } from 'react-redux';
import MuiAlert from '@mui/material/Alert';
import { removeUser, setUserInfo, updateAllUsers } from '../../features/userSlice';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

const getInitials = (string) => {
  let names = string?.split(' '),
      initials = names[0].substring(0, 1).toUpperCase();
  
  if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
  }
  return initials;
}



export default function UserManagementTable({rows}) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [openAlert, setOpenAlert] =  React.useState(false);
  const [alertMessage, setAlertMessage] =  React.useState("");
  const [severity, setSeverity] =  React.useState("");
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [openDialog, setOpenDialog] = React.useState(false);
  const [userId, setUserId] = React.useState();

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenAlert(false);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const updateUserRole = async (user, role) => {
    await instance.patch(`admin-users/${user?.id}`, {role})
    .then((res) => {
      //dispatch(setUserInfo(res.data.user))
      dispatch(updateAllUsers({user: res.data.user}))
      setOpenAlert(true)
      setAlertMessage("User role changed")
      setSeverity("success")
    })
    .catch(() => {
      setOpenAlert(true)
      setAlertMessage("Ooops an error was encountered")
      setSeverity("error")
    })
  };

  const deleteUser = async () => {
    await instance.delete(`admin-users/${userId}`)
    .then(() => {
      dispatch(removeUser({id: userId}))
      setOpenDialog(false)
      setOpenAlert(true)
      setAlertMessage("User deleted")
      setSeverity("success")
    })
    .catch(() => {
      setOpenAlert(true)
      setAlertMessage("Ooops an error was encountered")
      setSeverity("error")
    })
  };

  return (
    <>
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 500 }} aria-label="custom pagination table">
      <TableHead>
          <TableRow>
            <TableCell >Name</TableCell>
            <TableCell >Picture</TableCell>
            <TableCell >Email</TableCell>
            <TableCell >Role</TableCell>
            <TableCell >Date Joined</TableCell>
            <TableCell  >Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(rowsPerPage > 0
            ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : rows
          ).map((row) => (
            <TableRow key={row.name}>
              <TableCell >
                {row.name}
              </TableCell>

              <TableCell style={{ width: 160 }} >
                {
                  (row.profile_pic === "" || row.profile_pic === null) ? (
                  <div 
                    style={{
                      display: "inline-block",
                      backgroundColor: "gray" ,
                      borderRadius: "50%",
                      cursor: "pointer",
                    }}
                    onClick={() => navigate(`/profile/${row?.id}`)}
                  >
                    <p 
                      style={{
                        color: "white",
                        display: "table-cell",
                        verticalAlign: "middle",
                        textAlign: "center",
                        textDecoration: "none",
                        height: "30px",
                        width: "30px",
                        fontSize: "15px"
                      }}
                    >
                      {getInitials(row?.name)}
                    </p>
                  </div>
                  ) : (
                    <img 
                      width="30px" 
                      height="30px" 
                      src={row.profile_pic}  
                      alt='profile_pic' 
                      style={{borderRadius: "50%", cursor: "pointer"}} 
                      onClick={() => navigate(`/profile/${row?.id}`)}
                    />
                  )
                }
              </TableCell>

              <TableCell style={{ width: 160 }} >
                {row.email}
              </TableCell>


              <TableCell style={{ width: 160 }} >
                {row.role}
              </TableCell>

              <TableCell style={{ width: 160 }} >
                {moment(row.created_at).format('MMMM Do YYYY')}
              </TableCell>

              <TableCell style={{ width: 160 }} >
                <Tooltip title='Change Role'>
                  <ChangeCircleRounded 
                    style={{cursor: "pointer"}}
                    onClick={() => {
                      if(row.role === "admin") {
                        updateUserRole(row, "user")
                      } else {
                        updateUserRole(row, "admin")
                      }
                    }}
                  />
                </Tooltip>

                <Tooltip title='Delete user'>
                  <DeleteOutline
                    style={{cursor: "pointer"}}
                    onClick={() => {
                      setOpenDialog(true)
                      setUserId(row.id)
                    }}
                  />
                </Tooltip>
               
              </TableCell>
            </TableRow>
          ))}

          {emptyRows > 0 && (
            <TableRow style={{ height: 53 * emptyRows }}>
              <TableCell colSpan={6} />
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
              colSpan={3}
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              SelectProps={{
                inputProps: {
                  'aria-label': 'rows per page',
                },
                native: true,
              }}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              ActionsComponent={TablePaginationActions}
            />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>



    <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
      <Alert onClose={handleCloseAlert} severity={severity} sx={{ width: '100%' }}>
        {alertMessage}
      </Alert>
    </Snackbar>


      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Use Google's location service?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
           Are you sure you want to delete this user?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Disagree</Button>
          <Button onClick={deleteUser} autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}