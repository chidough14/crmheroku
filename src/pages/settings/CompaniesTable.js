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
import {  Button, CircularProgress, Pagination, Snackbar, TableHead } from '@mui/material';
import { AddOutlined, DeleteOutlined, EditOutlined } from '@mui/icons-material';
import AddCompanyModal from './modals/AddCompanyModal';
import AlertDialog from './modals/AlertDialog';
import instance from '../../services/fetchApi';
import { removeCompany } from '../../features/companySlice';
import { useDispatch } from 'react-redux';
import MuiAlert from '@mui/material/Alert';


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

const CompaniesTable = ({rows, getCompanies, loading, user}) => {
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [openModal, setOpenModal] = React.useState(false);
  const [openSnackAlert, setOpenSnackAlert] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState("");

  const [editMode, setEditMode] = React.useState(false);
  const [companyObj, setCompanyObj] = React.useState();
  const [openAlert, setOpenAlert] = React.useState(false);
  const [severity, setSeverity] = React.useState("");

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

  const deleteCompany = async () => {
    await instance.delete(`companies/${companyObj.id}`)
    .then(() => {
      dispatch(removeCompany({companyId: companyObj.id}))
      setOpenAlert(false)
      setOpenSnackAlert(true)
      setSeverity("success")
      setAlertMessage("Company Deleted")
    })
    .catch(()=> {
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
      disabled={user?.role !== "admin"}
    >
      <AddOutlined />
    </Button>
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 500 }} aria-label="custom pagination table">
      <TableHead>
          <TableRow>
            <TableCell >Name</TableCell>
            <TableCell >Address</TableCell>
            <TableCell >Phone</TableCell>
            <TableCell >Contact</TableCell>
            <TableCell >Email</TableCell>
            <TableCell  >Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            loading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Box sx={{ display: 'flex', marginLeft: "45%" }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) :
          rows?.data?.map((row) => (
            <TableRow key={row.name}>
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell style={{ width: 160 }}>
                {row.address}
              </TableCell>
              <TableCell style={{ width: 160 }}>
                {row.phone}
              </TableCell>
              <TableCell style={{ width: 160 }}>
                {row.contactPerson}
              </TableCell>
              <TableCell style={{ width: 160 }}>
                {row.email}
              </TableCell>
              <TableCell style={{ width: 160 }}>
                <Button
                  size='small'
                  disabled={user?.role !== "admin"}
                >
                  <EditOutlined
                    style={{cursor: "pointer"}}
                    onClick={() => {
                      setEditMode(true)
                      setOpenModal(true)
                      setCompanyObj(row)
                    }}
                  />
                </Button>
               
                <Button
                  size='small'
                  disabled={user?.role !== "admin"}
                >
                  <DeleteOutlined 
                    style={{cursor: "pointer"}}
                    onClick={() => {
                      setOpenAlert(true)
                      setCompanyObj(row)
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
          getCompanies(idx)
        }}
        color="secondary"
        showFirstButton
        showLastButton
      />
    </div>


    <AddCompanyModal
      open={openModal}
      setOpen={setOpenModal}
      setOpenAlert={setOpenSnackAlert}
      setAlertMessage={setAlertMessage}
      editMode={editMode}
      company={companyObj}
      setSeverity={setSeverity}
    />

    <Snackbar open={openSnackAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
      <Alert onClose={handleCloseAlert} severity={severity} sx={{ width: '100%' }}>
        {alertMessage}
      </Alert>
    </Snackbar>

    <AlertDialog
      open={openAlert}
      setOpen={setOpenAlert}
      deleteItem={deleteCompany}
      companyMode={true}
    />
    </>
  );
}

export default CompaniesTable