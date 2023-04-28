import * as React from 'react';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { useDispatch, useSelector } from 'react-redux';
import { getToken } from '../services/LocalStorageService';
import { useNavigate } from 'react-router-dom';
import {  Button, CircularProgress, Snackbar, TextField, Toolbar, Tooltip, Typography } from '@mui/material';
import ListCard from '../components/lists/ListCard';
import ListModal from '../components/lists/ListModal';
import "./list.css"
import instance from '../services/fetchApi';
import { setLists, setSortOptionValue } from '../features/listSlice';
import Pagination from '@mui/material/Pagination';
import SortButton from './orders/SortButton';
import { Box } from '@mui/system';
import { AddOutlined, ContentPasteOff, SearchOutlined } from '@mui/icons-material';
import UploadFile from '../components/lists/UploadFile';
import MuiAlert from '@mui/material/Alert';


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
  const {lists, sortOption, showSpinner} = useSelector((state) => state.list)
  const [page, setPage] = React.useState(1)

  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [showSearch, setShowSearch] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const handleOpen = () => setOpen(true);
  const [openAlert, setOpenAlert] = React.useState(false);
  const [severity, setSeverity] = React.useState("");
  const [alertMessage, setAlertMessage] = React.useState("");

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

  return (
    <div >
      <Toolbar>
        <Typography variant='h5'  component="div" sx={{ flexGrow: 2 }} >My Lists</Typography>
        
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
          <SearchOutlined
            style={{cursor: "pointer"}}
            onClick={() => {
              setShowSearch(prev => !prev)
              setSearchQuery("")
            }}
          />
        </Tooltip>
       

        <SortButton setSortOption={setSortOption} sortOption={sortOption} title="Sort Lists" closeSearch={closeSearch} />

        <Tooltip title="Upload list">
          <UploadFile />
        </Tooltip>

        <Tooltip title="Add List">
          <Button variant="contained" onClick={handleOpen} className="addButton" size='small' style={{borderRadius: "30px", marginLeft: "20px"}}>
            <AddOutlined />
          </Button>
        </Tooltip>
      </Toolbar>

      {
         !lists?.data?.length ? (
           <ContentPasteOff sx={{marginTop: "50px", marginLeft: "45%", fontSize: "64px"}}/>
         ) : (
            <div className="cards">
              {
                loading ? (
                  <div style={{ width: "300%", marginLeft: "190%" }}>
                    <CircularProgress />
                  </div>
                ) :
                lists?.data?.map((list, idx) => (
                  <Grid item key={idx} >
                    <ListCard list={list} socket={socket} showSpinner={showSpinner}/>
                  </Grid>
                ))
              }  
            
            </div>
         )
      }
      

      <div style={{marginTop: "50px", marginLeft: "40%"}}>
        <Pagination
          count={ Math.ceil(lists?.total / lists?.per_page)}
          page={page}
          onChange={(page, idx) => {
           
            if (searchQuery.length) {
               getSearchResult(idx)
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

      <ListModal
         open={open}
         setOpen={setOpen}
         showSpinner={showSpinner}
      />


      <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={severity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}