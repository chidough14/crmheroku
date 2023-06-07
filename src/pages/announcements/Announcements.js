import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import InboxIcon from '@mui/icons-material/Inbox';
import DraftsIcon from '@mui/icons-material/Drafts';
import { Autocomplete, Button, CircularProgress, FormControlLabel, Pagination, TextField, Typography } from '@mui/material';
import instance from '../../services/fetchApi';
import { useDispatch, useSelector } from 'react-redux';
import { setAnnouncements, setCategories, setSortOptionValue } from '../../features/AnnouncementsSlice';
import { setAnnouncementsLoading } from '../../features/AnnouncementsSlice';
import moment from 'moment';
import Checkbox from '@mui/material/Checkbox';
import { SearchOutlined } from '@mui/icons-material';
import SortButton from '../orders/SortButton';

const style = {
  backgroundColor: "white",
  borderRadius: "50px"
}

export default function Announcements() {
  const dispatch = useDispatch()
  const {announcements, announcementsLoading, categories, sortOption} = useSelector(state => state.announcement)
  const [page, setPage] = useState(1);
  const [categoryNames, setCategoryNames] = useState([]);
  const [text, setText] = useState("");
  const [filterCatagoryLabel, setFilterCategoryLabel] = useState(false)

  const getAnnouncements = async (page = 1) => {
    dispatch(setAnnouncementsLoading({announcementsLoading: true}))

    await    instance.get(`announcements?page=${page}`)
    .then((res) => {
      dispatch(setAnnouncementsLoading({announcementsLoading: false}))
      dispatch(setAnnouncements({announcements: res.data.announcements}))
    })
    .catch(() => {
      dispatch(setAnnouncementsLoading({announcementsLoading: false}))
    })
  }

  const getCategories = async () => {

    await instance.get(`categories`)
    .then((res) => {
      // dispatch(setAnnouncementsLoading({announcementsLoading: false}))
      dispatch(setCategories({categories: res.data.categories}))
    })
    .catch(() => {
      // dispatch(setAnnouncementsLoading({announcementsLoading: false}))
    })
  }

  const fetchAnnouncementsByCategories = async (ids, page = 1) => {
    dispatch(setAnnouncementsLoading({announcementsLoading: true}))
    let body = {
      ids
    }
    await instance.post(`filter-announcements?page=${page}`, body)
    .then((res) => {
      dispatch(setAnnouncementsLoading({announcementsLoading: false}))
      dispatch(setAnnouncements({announcements: res.data.announcements}))
    })
  }

  const getSortedAnnouncements = async (option, page = 1) => {
    dispatch(setAnnouncementsLoading({announcementsLoading: true}))
    await instance.get(`filter-announcements-by-date/${option}?page=${page}`)
    .then((res) => {
      dispatch(setAnnouncementsLoading({announcementsLoading: false}))
      dispatch(setAnnouncements({announcements: res.data.announcements}))
    })
    .catch(() => {
      //showAlert("Oops an error was encountered", "error")
    })
  }

  useEffect(() => {
    if (sortOption === "all") {
      getAnnouncements()
    } else {
      getSortedAnnouncements(sortOption)
    }
  }, [sortOption])

  useEffect(() => {
    if(categoryNames.length > 0) {
      fetchAnnouncementsByCategories(categoryNames)
    }

    if(categoryNames.length < 1) {
      getAnnouncements()
    }
  }, [categoryNames.length])

  useEffect(() => {
    //getAnnouncements()

    getCategories()
  }, [])

  useEffect(() => {

    setPage(announcements?.current_page)

  }, [announcements?.current_page])

  const handleSearch = async (text, page = 1) => {
    dispatch(setAnnouncementsLoading({announcementsLoading: true}))
 
    await instance.get(`search-announcements?query=${text}&page=${page}`)
    .then((res) => {
      dispatch(setAnnouncementsLoading({announcementsLoading: false}))
      dispatch(setAnnouncements({announcements: res.data.announcements}))
    })
  }

  
  const setSortOption =  (value) => {
    dispatch(setSortOptionValue({option: value}))
  }

  return (
    <>
      <div style={{display: "flex"}}>
        <Autocomplete
          size='small'
          freeSolo
          id="free-solo-2-demo"
          disableClearable
          options={[]}
          getOptionLabel={(option) => option.name || ""}
          renderInput={(params) => (
            <TextField
              fullWidth
              size="small"
              {...params}
              label="Search Announcements"
              InputProps={{
                ...params.InputProps,
                type: 'search',
              }}
              style={style}
            />
          )}
          onInputChange={(e)=> {
            setText(e.target.value)
          }}
          onChange={(e, f)=> console.log(e)}
          style={{
            width: "60%"
          }}
        />

        <Button 
          variant="contained"
          onClick={() => handleSearch(text)}
        >
          <SearchOutlined />
        </Button>

        <SortButton setSortOption={setSortOption} sortOption={sortOption} title="Sort Announcements" />
      </div>

      <div>
        <Button
          onClick={() => {
            setFilterCategoryLabel(prev => !prev)
          }}
        >
          {
            filterCatagoryLabel ? "Close" : "Filter by category"
          }
        </Button>
      </div>

      {
        filterCatagoryLabel &&
        categories.map((a) => (
          <FormControlLabel 
            control={
              <Checkbox 
                checked={categoryNames.includes(a.id)}
                onChange={(e,f) => {
                
                  if(f) {
                    setCategoryNames([...categoryNames, a.id])
                  } else {
                    setCategoryNames(categoryNames.filter((b) => b !== a.id))
                  }
                }}
                inputProps={{ 'aria-label': 'controlled' }}
              />
            } 
            label={a.name} 
            style={{marginLeft: "20px"}}
          />
        ))
      }
      
      <div>
        <Button
          onClick={() => {
            setCategoryNames([])
            getAnnouncements()
          }}
        >
          Clear all filters
        </Button>
      </div>
    

      {
        announcementsLoading ? (
          <Box sx={{ display: 'flex', marginLeft: "50%" }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ width: '100%',  bgcolor: 'background.paper' }}>
            <nav aria-label="main mailbox folders">
              <List>
                {
                  !announcements?.data?.length ?
                  (
                    <p>No Results</p>
                  ) :
                  announcements?.data?.map((a) => (
                    <>
                      <ListItem disablePadding>
                        {
                          a.link ? (
                              <Typography variant='h7'>
                                <span>
                                  <a  href={`${a.link}`}>
                                    {a.message}
                                  </a>
                                </span>
                              </Typography>
                          ) : (
                            <Typography variant='h7'>
                            {a.message}
                            </Typography>
                          )
                        }
                      </ListItem>
                      <p >{moment(a.created_at).format("MMMM DD YYYY")}</p>
                      <Divider />
                    </>
                  ))
                }
                
              </List>
            </nav>
          </Box>
        )
      }

     

      <div style={{marginTop: "50px", marginLeft: "40%"}}>
        <Pagination
          count={ Math.ceil(announcements?.total / announcements?.per_page)}
          page={page}
          onChange={(page, idx) => {
            if(categoryNames.length > 0) {
              fetchAnnouncementsByCategories(categoryNames, idx)
            } else {
              getAnnouncements(idx)
            }
          
          }}
          color="secondary"
          showFirstButton
          showLastButton
        />
      </div>
    </>
  );
}