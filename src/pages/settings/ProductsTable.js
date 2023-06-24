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
import {  Button, Checkbox, CircularProgress, Pagination, Snackbar, TableHead, Tooltip, Typography } from '@mui/material';
import { Add, AddOutlined, DeleteOutlined, EditOutlined } from '@mui/icons-material';
import AddProductModal from './modals/AddProductModal';
import AlertDialog from './modals/AlertDialog';
import instance from '../../services/fetchApi';
import { useDispatch, useSelector } from 'react-redux';
import { removeProduct, removeProducts, setShowDeleteNotification } from '../../features/ProductSlice';
import MuiAlert from '@mui/material/Alert';
import { arraysHaveSameContents } from '../../services/checkers';

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

const ProductsTable = ({rows, getProducts, loading, user}) => {
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [openModal, setOpenModal] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [productObj, setProductObj] = React.useState();
  const [openAlert, setOpenAlert] = React.useState(false);
  const [openSnackAlert, setOpenSnackAlert] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState("");
  const [productIds, setProductIds] = React.useState([]);
  const [productId, setProductId] = React.useState();
  const [bulkMode, setBulkMode] = React.useState(false);
  const [header, setHeader] = React.useState("");
  const [severity, setSeverity] = React.useState("");

  const dispatch = useDispatch()
  const { showDeleteNotification } = useSelector(state => state.product)

  React.useEffect(() => {

    setPage(rows?.current_page)

  }, [rows?.current_page])

  React.useEffect(() => {

    if(bulkMode) {
      setHeader("Products")
    } else {
      setHeader("Product")
    }

  }, [bulkMode])


  const deleteProduct = async () => {
    dispatch(setShowDeleteNotification({showDeleteNotification: true}))

    if(bulkMode) {
      await instance.post(`products-bulk-delete`, {productIds})
      .then(() => {
        dispatch(setShowDeleteNotification({showDeleteNotification: false}))
        dispatch(removeProducts({productIds}))
        setProductIds([])
        setOpenAlert(false)
        setSeverity("success")
        setOpenSnackAlert(true)
        setAlertMessage("Products Deleted")
      })
      .catch(() => {
        dispatch(setShowDeleteNotification({showDeleteNotification: false}))
        setSeverity("error")
        setOpenSnackAlert(true)
        setAlertMessage("Ooops An error was encountered")
      })
    } else {
      await instance.delete(`products/${productObj.id}`)
      .then(() => {
        dispatch(setShowDeleteNotification({showDeleteNotification: false}))
        dispatch(removeProduct({productId: productObj.id}))
        setOpenAlert(false)
        setSeverity("success")
        setOpenSnackAlert(true)
        setAlertMessage("Product Deleted")
      })
      .catch(() => {
        dispatch(setShowDeleteNotification({showDeleteNotification: false}))
        setSeverity("error")
        setOpenSnackAlert(true)
        setAlertMessage("Ooops An error was encountered")
      })
    }
  
    //after delete set productobj to empty
  };

  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenSnackAlert(false);
  };

  const renderDisabled = (user) => {
    if(user?.role === "admin" || user?.role === "super admin"){
      return false
    } else {
      return true
    }
  }

  return (
    <>
    <div style={{display: "flex", justifyContent: "space-between"}}>
      <Typography variant='h6'></Typography>

      {
        productIds.length ? (
          <div>
            <Tooltip title="Delete">
              <DeleteOutlined 
                style={{marginBottom: "-5px", cursor: "pointer", marginRight: "5px"}} 
                onClick={() => {
                  setOpenAlert(true)
                  setBulkMode(true)
                }}
              />
            </Tooltip>

            <span>
              { productIds.length } Items Selected
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
        disabled={renderDisabled(user)}
      >
        <AddOutlined />
      </Button>
    </div>
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 500 }} aria-label="custom pagination table">
      <TableHead>
          <TableRow>
            <TableCell >
              <Tooltip title="Select all">
                <Checkbox
                  checked={arraysHaveSameContents(rows?.data?.map((a) => a.id), productIds)}
                  indeterminate={productIds.length > 0 && productIds.length < rows?.data?.length}
                  onChange={(e,f) => {
                    if (f) {
                      let ids = rows?.data?.map((a) => a.id)
  
                      setProductIds(ids)
                    } else {
                      setProductIds([])
                    }
                  }}
                  inputProps={{ 'aria-label': 'controlled' }}
                  style={{marginRight: "-24px"}}
                />
              </Tooltip>
            </TableCell>
            <TableCell >Name</TableCell>
            <TableCell >Description</TableCell>
            <TableCell >Price</TableCell>
            <TableCell >Tax %</TableCell>
            <TableCell >Status</TableCell>
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
            rows?.data.map((row) => (
            <TableRow 
              key={row.name}
              onMouseEnter={() => {
                setProductId(row.id)
              }}
              onMouseLeave={()=> {
                setProductId(null)
              }}
            >
              <TableCell>
                <Checkbox
                  checked={productIds.map((a) => a).includes(row.id)}
                  onChange={(e,f) => {
                    if(f) {
                      setProductIds([...productIds, row.id])
                    } else {
                      setProductIds(productIds.filter((b) => b !== row.id))
                    }
                  }}
                  inputProps={{ 'aria-label': 'controlled' }}
                  style={{marginRight: "-24px"}}
                />
              </TableCell>
              <TableCell >
                {row.name}
              </TableCell>
              <TableCell style={{ width: 160 }}>
                {row.description}
              </TableCell>
              <TableCell style={{ width: 160 }}>
                {row.price}
              </TableCell>
              <TableCell style={{ width: 160 }}>
                {row.tax_percentage}
              </TableCell>
              <TableCell style={{ width: 160 }}>
                {row.active}
              </TableCell>
              <TableCell style={{ width: 160 }}>

                {
                  productId === row.id ? (
                    <>
                      <Tooltip title="Edit">
                        <Button
                          size='small'
                          disabled={renderDisabled(user)}
                        >
                          <EditOutlined
                            style={{cursor: "pointer"}}
                            onClick={() => {
                              setEditMode(true)
                              setOpenModal(true)
                              setProductObj(row)
                            }}
                          />
                        </Button>
                      </Tooltip>

                      <Tooltip title="Edit">
                        <Button
                          size='small'
                          disabled={renderDisabled(user)}
                        >
                          <DeleteOutlined 
                            style={{cursor: "pointer"}}
                            onClick={() => {
                              setOpenAlert(true)
                              setProductObj(row)
                            }}
                          />
                        </Button>
                      </Tooltip>
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
          getProducts(idx)
        }}
        color="secondary"
        showFirstButton
        showLastButton
      />
    </div>

    <AddProductModal
      open={openModal}
      setOpen={setOpenModal}
      editMode={editMode}
      product={productObj}
      setOpenAlert={setOpenSnackAlert}
      setAlertMessage={setAlertMessage}
      setSeverity={setSeverity}
    />

    <AlertDialog
      open={openAlert}
      setOpen={setOpenAlert}
      deleteItem={deleteProduct}
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
  );
}

export default ProductsTable