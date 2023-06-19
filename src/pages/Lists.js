import * as React from 'react';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { useDispatch, useSelector } from 'react-redux';
import { getToken } from '../services/LocalStorageService';
import { useNavigate } from 'react-router-dom';
import {  Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, TextField, Toolbar, Tooltip, Typography } from '@mui/material';
import ListCard from '../components/lists/ListCard';
import ListModal from '../components/lists/ListModal';
import "./list.css"
import instance from '../services/fetchApi';
import { addList, addListIds, removeListIds, removeLists, setLists, setShowCloningNotification, setShowSpinner, setSortOptionValue } from '../features/listSlice';
import Pagination from '@mui/material/Pagination';
import SortButton from './orders/SortButton';
import { AddOutlined, ContentPasteOff, CopyAllOutlined, DeleteOutline, FolderDelete, MoveUpOutlined, Restore, RestorePage, SearchOutlined } from '@mui/icons-material';
import UploadFile from '../components/lists/UploadFile';
import MuiAlert from '@mui/material/Alert';
import ListTransferModal from '../components/lists/ListTransferModal';


const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});


const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));



export default function Lists({socket}) {
  const token = getToken()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const {lists, sortOption, showSpinner, listIds, showCloningNotification} = useSelector((state) => state.list)
  const [page, setPage] = React.useState(1)

  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [showSearch, setShowSearch] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const handleOpen = () => setOpen(true);
  const [openAlert, setOpenAlert] = React.useState(false);
  const [severity, setSeverity] = React.useState("");
  const [alertMessage, setAlertMessage] = React.useState("");
  const [openTransferModal, setOpenTransferModal] = React.useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [showTrash, setShowTrash] = React.useState(false);
  const [restoreMode, setRestoreMode] = React.useState(false);

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

  const getListsResult = async (pageNo = 1) => {
    setLoading(true)
    setShowTrash(false)
    await instance.get(`mylists?page=${pageNo}`)
    .then((res)=> {
      dispatch(setLists({lists: res.data.lists}))
      setLoading(false)
    })
    .catch(() => {
      showAlert("Oops an error was encountered", "error")
    })
  }

  const getSortedLists = async (option, page = 1) => {
    setLoading(true)
    await instance.get(`filter-lists/${option}?page=${page}`)
    .then((res) => {
      dispatch(setLists({lists: res.data.lists}))
      setLoading(false)
    })
    .catch(() => {
      showAlert("Oops an error was encountered", "error")
    })
  }

  const getSearchResult = async (page = 1) => {
    setLoading(true)
    await instance({
      url: `search-lists?query=${searchQuery}&page=${page}`,
      method: "GET",
    }).then((res) => {
      dispatch(setSortOptionValue({option: ""}))
      dispatch(dispatch(setLists({lists: res.data.lists})))
      setLoading(false)
    })
    .catch(() => {
      showAlert("Oops an error was encountered", "error")
    })
  }

  React.useEffect(() => {
    setPage(lists?.current_page)
  }, [lists?.current_page])

  React.useEffect(() => {
      if (sortOption === "all") {
        getListsResult()
      } else {
        if (sortOption === "") {

        } else {
          getSortedLists(sortOption)
        }
       
      }
  }, [sortOption])

  React.useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [token])

 

  React.useEffect(()=> {
    if (searchQuery.length === 3){
      getSearchResult()
    } else if (searchQuery.length === 0) {
      dispatch(setSortOptionValue({option: "all"}))
    }
  }, [searchQuery])

  const setSortOption =  (value) => {
    dispatch(setSortOptionValue({option: value}))
  }

  const closeSearch =  () => {
    //setSearchQuery("")
    setShowSearch(false)
  }

  const cloneList = async (list) => {
    dispatch(setShowCloningNotification({showCloningNotification: true}))

    await instance.get(`mylists/${list}/clone`)
    .then((res)=> {
       dispatch(addList({list: res.data.clonedList}))
       dispatch(setShowCloningNotification({showCloningNotification: false}))
    })
    .catch(() => {
      dispatch(setShowCloningNotification({showCloningNotification: false}))
      dispatch(showAlert({alertMessage: "Ooops an error was encountered", severity: "error"}))
    })
    
  };

  const deleteLists = async (listIds) => {
    let url
    url = showTrash ? `mylists-bulk-force-delete` : `mylists/bulk-delete`
    dispatch(setShowSpinner({showSpinner: true}))

    await instance.post(url, { listIds })
    .then((res)=> {
       dispatch(removeLists({listIds}))
       dispatch(removeListIds({listIds}))
       dispatch(setShowSpinner({showSpinner: false}))
       handleCloseDialog()
       
    })
    .catch(() => {
      dispatch(setShowSpinner({showSpinner: false}))
      handleCloseDialog()
      dispatch(showAlert({alertMessage: "Ooops an error was encountered", severity: "error"}))
    })
    
  };

  const fetchListsWithTrashed = async (page = 1) => {
    setLoading(true)
    setShowTrash(true)
    await instance.get(`mylists-with-trashed?page=${page}`)
    .then((res)=> {
      const convertedObject = {
        ...res.data.lists,
        data: Object.values(res.data.lists.data)
      }

      dispatch(setLists({lists: convertedObject}))
      setLoading(false)
    })
    .catch(() => {
      showAlert("Oops an error was encountered", "error")
    })
  };

  const restoreLists = async (listIds) => {
    dispatch(setShowSpinner({showSpinner: true}))

    await instance.post(`mylists-bulk-restore`, { listIds })
    .then((res)=> {
       dispatch(removeLists({listIds}))
       dispatch(removeListIds({listIds}))
       dispatch(setShowSpinner({showSpinner: false}))
       dispatch(showAlert({alertMessage: "Lists restored", severity: "success"}))
       handleCloseDialog()
       
    })
    .catch(() => {
      dispatch(setShowSpinner({showSpinner: false}))
      handleCloseDialog()
      dispatch(showAlert({alertMessage: "Ooops an error was encountered", severity: "error"}))
    })
    
  };

  const handleCloseDialog = () => {
    setOpenDeleteDialog(false);
  };

  return (
    <div >
      <Toolbar>
        <Typography variant='h5'  component="div" sx={{ flexGrow: 2 }} >My Lists{showTrash ? " - Trash" : null}</Typography>

        {
          listIds.length ? (
            <div style={{display: "flex", marginRight: "30%"}}>
              <Tooltip title="Delete">
                <DeleteOutline  
                  style={{marginLeft: "10px",  cursor: "pointer"}}
                  onClick={() => {
                    setOpenDeleteDialog(true)
                  }}
                />
              </Tooltip>
             
    
             
              {
                (listIds.length === 1 && !showTrash) ? (
                  <Tooltip title="Clone">
                    <CopyAllOutlined 
                      style={{marginLeft: "10px", cursor: "pointer"}} 
                      onClick={() => {
                        cloneList(listIds[0])
                      }}
                    /> 
                  </Tooltip>
                ) : null
              }
              
              {
                showTrash ? null : (
                  <Tooltip title="Transfer">
                    <MoveUpOutlined 
                      style={{marginLeft: "10px", cursor: "pointer"}}
                      onClick={() => {
                        setOpenTransferModal(true)
                      }}
                    />
                  </Tooltip>
                )
              }
            

              {
                showTrash ? (
                  <Tooltip title="Restore">
                    <Restore 
                      style={{marginLeft: "10px", cursor: "pointer"}}
                      onClick={() => {
                        setRestoreMode(true)
                        setOpenDeleteDialog(true)
                      }}
                    />
                  </Tooltip>
                ) : null
              }
    
              <span style={{marginLeft: "10px"}}>
                {listIds.length} Items Selected
              </span>

              {
                showCloningNotification ? (
                  <span style={{marginLeft: "10px", color: "green"}}>
                    Cloning List...
                  </span>
                ) : null
              }
            </div>
          ) : null
        }

        <Tooltip title="Select all">
          <Checkbox
            checked={listIds.length}
            onChange={(e,f) => {
              let ids = lists?.data?.map((a) => a.id)
              if (f) {

                dispatch(addListIds({listIds: ids}))
              } else {
                dispatch(removeListIds({listIds: ids}))
              }
            }}
            inputProps={{ 'aria-label': 'controlled' }}
          />
        </Tooltip>
        {
          showTrash ? (
            <Tooltip title="Show lists">
              <RestorePage
                style={{fontSize: "28px", cursor: "pointer"}}
                onClick={() => {
                  dispatch(removeListIds({listIds}))
                  getListsResult()
                }}
              />
            </Tooltip>
          ) : (
            <>
             {
              lists?.data?.length ? (
                <FolderDelete
                  style={{fontSize: "28px", cursor: "pointer"}}
                  onClick={() => {
                    dispatch(removeListIds({listIds}))
                    fetchListsWithTrashed()
                  }}
                />
              ) : null
             }
            </>
          )
        }
      

        {
          showSearch && (
            <TextField
              className='text'
              size="small"
              label="Search lists"
              InputProps={{
                type: 'search',
              }}
              onChange={(e)=> setSearchQuery(e.target.value)}
            />
          )
        }
      
        <Tooltip title="Search lists">
          <Button
             onClick={() => {
              setShowSearch(prev => !prev)
              setSearchQuery("")
            }}
            size="small"
            style={{borderRadius: "30px"}}
            disabled={showTrash}
          >
            <SearchOutlined />
          </Button>
        </Tooltip>
       

        <SortButton 
          setSortOption={setSortOption} 
          sortOption={sortOption} 
          title="Sort Lists" 
          closeSearch={closeSearch} 
          showTrash={showTrash}
        />

        <Tooltip title="Upload list">
          <UploadFile showTrash={showTrash} />
        </Tooltip>

        <Tooltip title="Add List">
          <Button 
            variant="contained" 
            onClick={handleOpen} 
            className="addButton" 
            size='small' 
            style={{borderRadius: "30px", marginLeft: "20px"}}
            disabled={showTrash}
          >
            <AddOutlined />
          </Button>
        </Tooltip>
      </Toolbar>

      <div className="cards">
        {
          loading ? (
            <div style={{ width: "300%", marginLeft: "190%" }}>
              <CircularProgress />
            </div>
          ) :  (
            <>
              {
                !lists?.data?.length ? (
                  <ContentPasteOff sx={{marginTop: "50px", marginLeft: "175%", fontSize: "64px"}}/>
                ) : (
                  lists?.data?.map((list, idx) => (
                    <Grid item key={idx} >
                      <ListCard 
                        list={list} 
                        socket={socket} 
                        showSpinner={showSpinner}
                        showTrash={showTrash}
                      />
                    </Grid>
                  ))
                )
              }
            </>
          )
        }
      </div>
      

      <div style={{marginTop: "50px", marginLeft: "40%"}}>
        <Pagination
          count={ Math.ceil(lists?.total / lists?.per_page)}
          page={page}
          onChange={(page, idx) => {
           
            if (searchQuery.length) {
               getSearchResult(idx)
            } else if(showTrash) {
               fetchListsWithTrashed(idx)
            } else {
              if (sortOption === "all") {
                getListsResult(idx)
              } else {
                getSortedLists(sortOption, idx)
              }
            }
            
          }}
          color="secondary"
          showFirstButton
          showLastButton
        />
      </div>

      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {restoreMode ? "Restore Lists" : "Delete List"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to {restoreMode ? "restore" : "delete"} these lists ?
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
              if(restoreMode) {
                restoreLists(listIds)
              } else {
                deleteLists(listIds)
              }
            
            }} 
            autoFocus
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <ListModal
         open={open}
         setOpen={setOpen}
         showSpinner={showSpinner}
      />


      <ListTransferModal
        open={openTransferModal}
        setOpen={setOpenTransferModal}
        socket={socket}
        showSpinner={showSpinner}
        mode="bulk"
      />


      <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={severity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}