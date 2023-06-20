import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import moment from 'moment';
import { Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Menu, MenuItem, Snackbar } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { CopyAllOutlined, DeleteOutlined, EditOutlined, MoreVert, MoveUpOutlined, Restore } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { getToken } from '../../services/LocalStorageService';
import { useNavigate } from 'react-router-dom';
import ListModal from './ListModal';
import { addList, addListId, closeAlert, removeList, removeListId, setShowCloningNotification, setShowSpinner, showAlert } from '../../features/listSlice';
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


const ListCard = ({list, socket, showSpinner, showTrash}) => {

  const dispatch = useDispatch()
  const token = getToken()
  const navigate = useNavigate()
  const user = useSelector((state) => state.user)
  const {openAlert, alertMessage, severity, showCloningNotification, listIds} = useSelector((state) => state.list)

  const [openModal, setOpenModal] = React.useState(false);
  const handleOpen = () => setOpenModal(true);

  const [openDialog, setOpenDialog] = React.useState(false);
  const [openTransferModal, setOpenTransferModal] = React.useState(false);
  const [restoreMode, setRestoreMode] = React.useState(false);
  const [listObj, setListObj] = React.useState();
  const [listId, setListId] = React.useState();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setRestoreMode(false)
  };

  const handleClick = (event) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget);

    setListId(list.id)
  };
  const handleClose = () => {
    setAnchorEl(null);
    setListId(null)
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

    dispatch(closeAlert({alertMessage: "", severity: ""}))
  };

  const deleteList = async (id, e) => {
    let url
    url = showTrash ? `mylists-force-delete/${id}` : `mylists/${id}`
    
    dispatch(setShowSpinner({showSpinner: true}))

    await instance.delete(url)
    .then(() => {
      setOpenDialog(false);
      dispatch(showAlert({alertMessage: "List deleted", severity: "success"}))
      dispatch(removeList({listId: id}))
      dispatch(removeListId({id}))
      dispatch(setShowSpinner({showSpinner: false}))
    })
    .catch(() => {
      dispatch(setShowSpinner({showSpinner: false}))
      dispatch(showAlert({alertMessage: "Ooops an error was encountered", severity: "error"}))
    })
  };

  const cloneList = async (list) => {
    setListId(list.id)  // added to make the cloning notification show
    dispatch(setShowCloningNotification({showCloningNotification: true}))

    await instance.get(`mylists/${list.id}/clone`)
    .then((res)=> {
       setListId(false)
       dispatch(addList({list: res.data.clonedList}))
       dispatch(setShowCloningNotification({showCloningNotification: false}))
    })
    .catch(() => {
      dispatch(setShowCloningNotification({showCloningNotification: false}))
      dispatch(showAlert({alertMessage: "Ooops an error was encountered", severity: "error"}))
    })
    
  };

  const transferList =  (value) => {
    setOpenTransferModal(true)
    setListObj(value)
  };

  const restoreList =  async (id) => {
    dispatch(setShowSpinner({showSpinner: true}))

    await instance.get(`mylists-restore/${id}`)
    .then(() => {
      handleCloseDialog()
      dispatch(showAlert({alertMessage: "List restored", severity: "success"}))
      dispatch(removeList({listId: id}))
      dispatch(removeListId({id}))
      dispatch(setShowSpinner({showSpinner: false}))
    })
    .catch(() => {
      dispatch(setShowSpinner({showSpinner: false}))
      dispatch(showAlert({alertMessage: "Ooops an error was encountered", severity: "error"}))
    })
  };

  return (
    <>
      <Card 
        sx={{ width: "90%" }}
        onMouseEnter={() => {
          setListId(list.id)
        }}
        onMouseLeave={() => {
          setListId(null)
        }}
      >
        <CardContent>
          <div style={{display: "flex", justifyContent: "space-between"}}>
            <Typography sx={{ fontSize: 12 }} color="text.secondary" gutterBottom>
              {moment(list.created_at).format("MMMM Do YYYY")}
            </Typography>
            
            <div>
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
              {
                showTrash ? null : (
                  <MenuItem 
                    onClick={showEditModal} 
                    disabled={(list.user_id !== user.id)}
                  >
                      <EditOutlined /> Edit
                  </MenuItem>
                )
              }
             
              
              {
                showTrash ? null : (
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
                )
              }
              

              {
                showTrash ? null : (
                  <MenuItem 
                    onClick={(e) => {
                      e.stopPropagation()
                      transferList(list)
                    }} 
                    disabled={(list.user_id !== user.id) && (list.type === "private")}
                  >
                    <MoveUpOutlined /> Transfer
                  </MenuItem>
                )
              }
            

              {
                showTrash ? (
                  <MenuItem 
                    onClick={(e) => {
                      e.stopPropagation()
                      setRestoreMode(true)
                      setOpenDialog(true);
                    }} 
                    disabled={(list.user_id !== user.id) && (list.type === "private")}
                  >
                    <Restore /> Restore
                  </MenuItem>
                ) : null
              }

              <MenuItem onClick={handleClickOpen} disabled={(list.user_id !== user.id)}><DeleteOutlined /> Delete</MenuItem>  
            </Menu>

           
            {
              (listId === list.id || listIds.includes(list.id)) && (
                <Checkbox
                  size="small"
                  checked={listIds.includes(list.id)}
                  onChange={(e,f) => {
                  
                    if(f) {
                      dispatch(addListId({id: list.id}))
                    } else {
                      dispatch(removeListId({id: list.id}))
                    }
                  }}
                  inputProps={{ 'aria-label': 'controlled' }}
                />
              )
            }
            </div>
          </div>
          
          <Typography variant="h7" component="div">
            <b>{list.name}</b>
            {
              listId === list.id && showCloningNotification ? <span style={{marginLeft: "20px", fontSize: "12px", color: "green"}}>Cloning....</span> : null
            }
           
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
        showSpinner={showSpinner}
      />

      <ListTransferModal
        list={listObj}
        open={openTransferModal}
        setOpen={setOpenTransferModal}
        socket={socket}
        showSpinner={showSpinner}
        mode="single"
      />


      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {restoreMode ? "Restore List ": "Delete List"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {restoreMode ? "Are you sure you want to restore this list" : "Are you sure you want to delete this list ?"}
          </DialogContentText>

          <DialogContentText sx={{textAlign: "center", color: "red"}}>
            {
              showSpinner ? "Please wait...." : null
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>No</Button>
          <Button 
            onClick={(e) => {
              if (restoreMode) {
                 restoreList(list.id)
              } else {
                deleteList(list.id, e)
              }
           
            }} 
            autoFocus
          >
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