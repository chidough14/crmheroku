import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import moment from 'moment';
import { CardHeader, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Menu, MenuItem, Snackbar } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { CopyAllOutlined, DeleteOutlined, EditOutlined, MoreVert, MoveUpOutlined } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { getToken } from '../../services/LocalStorageService';
import { useNavigate } from 'react-router-dom';
import ListModal from './ListModal';
import { addList, closeAlert, removeList, showAlert } from '../../features/listSlice';
import instance from '../../services/fetchApi';
import ListTransferModal from './ListTransferModal';

const bull = (
  <Box
    component="span"
    sx={{ display: 'inline-block', mx: '2px', transform: 'scale(0.8)' }}
  >
    •
  </Box>
);

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});


const ListCard = ({list, socket}) => {

  const dispatch = useDispatch()
  const token = getToken()
  const navigate = useNavigate()
  const user = useSelector((state) => state.user)

  const [openModal, setOpenModal] = React.useState(false);
  const handleOpen = () => setOpenModal(true);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const [openDialog, setOpenDialog] = React.useState(false);
  const [openTransferModal, setOpenTransferModal] = React.useState(false);
  const [listObj, setListObj] = React.useState();
  //const [openAlert, setOpenAlert] = React.useState(false);

  const {openAlert, alertMessage, severity} = useSelector((state) => state.list)

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleClick = (event) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const showEditModal = (event) => {
    event.stopPropagation()
    handleOpen()
  };

  const handleClickOpen = (event) => {
    event.stopPropagation()
    setOpenDialog(true);
  };

  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    dispatch(closeAlert())
  };

  const deleteList = async (id, e) => {

    const res = await instance.delete(`mylists/${id}`)
    .then(() => {
      dispatch(showAlert({alertMessage: "List deleted", severity: "success"}))
      dispatch(removeList({listId: id}))
    })
    .catch(() => {
      dispatch(showAlert({alertMessage: "Ooops an error was encountered", severity: "error"}))
    })
  };

  const cloneList = async (list) => {

    await instance.get(`mylists/${list.id}/clone`)
    .then((res)=> {
       dispatch(addList({list: res.data.clonedList}))
    })
    .catch(() => {
      dispatch(showAlert({alertMessage: "Ooops an error was encountered", severity: "error"}))
    })
    
  };

  const transferList =  (value) => {
    setOpenTransferModal(true)
    setListObj(value)
  };

  return (
    <>
      <Card 
        sx={{ width: "90%" }}
      >
        <CardContent>
          <div style={{display: "flex", justifyContent: "space-between"}}>
            <Typography sx={{ fontSize: 12 }} color="text.secondary" gutterBottom>
              {moment(list.created_at).format("MMMM Do YYYY")}
            </Typography>

            <IconButton 
              aria-label="settings"
              id="basic-button"
              aria-controls={open ? 'basic-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              onClick={handleClick}
            >
              <MoreVert />
            </IconButton>

            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-button',
              }}
            >
              <MenuItem onClick={showEditModal} disabled={(list.user_id !== user.id)}><EditOutlined /> Edit</MenuItem>

              <MenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  cloneList(list)
                }} 
                disabled={(list.user_id !== user.id) && (list.type === "private")}
              >
                <CopyAllOutlined /> 
                 Clone
              </MenuItem>

              <MenuItem 
                onClick={(e) => {
                  e.stopPropagation()
                  transferList(list)
                }} 
                disabled={(list.user_id !== user.id) && (list.type === "private")}
              >
                <MoveUpOutlined /> Transfer
              </MenuItem>

              <MenuItem onClick={handleClickOpen} disabled={(list.user_id !== user.id)}><DeleteOutlined /> Delete</MenuItem>
            </Menu>
          </div>
          
          <Typography variant="h7" component="div">
            <b>{list.name}</b>
          </Typography>
          <div style={{display: "flex", justifyContent: "space-between"}}>
            <Typography variant="body2">
            {list.description}
            </Typography>

            <Button size="small" onClick={() => navigate(`/listsview/${list.id}`)}>
              <b>View</b>
            </Button>
          </div>  
        </CardContent>
        {/* <CardActions>
          <Button size="small" onClick={() => navigate(`/listsview/${list.id}`)}>
            View
          </Button>
        </CardActions> */}
      </Card>

      <ListModal 
        list={list}
        open={openModal}
        setOpen={setOpenModal}
      />

      <ListTransferModal
        list={listObj}
        open={openTransferModal}
        setOpen={setOpenTransferModal}
        socket={socket}
      />


      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Delete List
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this list ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>No</Button>
          <Button onClick={(e) => deleteList(list.id, e)} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>


      <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={severity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default ListCard