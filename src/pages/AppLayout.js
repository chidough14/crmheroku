import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Link, matchPath, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getToken } from "../services/LocalStorageService";
import { AddOutlined, DashboardOutlined, DensitySmallOutlined, MeetingRoomOutlined, MessageOutlined, PeopleOutline, SettingsOutlined, ShoppingCartOutlined } from '@mui/icons-material';
import ListIcon from '@mui/icons-material/List';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import CalendarMonthIcon from '@mui/icons-material/CalendarViewMonth';
import { Badge, Button, CircularProgress, Collapse, Snackbar, Tooltip } from '@mui/material';
import BellNotification from '../components/BellNotification';
import UserAccountsCircle from '../components/UserAccountsCircle';
import SearchBar from '../components/SearchBar';
import instance from '../services/fetchApi';
import { setSearchResults } from '../features/companySlice';
import { setSelectedCompanyId } from '../features/listSlice';
import MuiAlert from '@mui/material/Alert';

import InboxIcon from '@mui/icons-material/MoveToInbox';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import StarBorder from '@mui/icons-material/StarBorder';
import { setOnlineUsers } from '../features/userSlice';
import ActivityModal from '../components/activities/ActivityModal';
import { setReloadMessages } from '../features/MessagesSlice';


const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);


const sideBarItems = [
  {
    name: "Dashboard",
    icon: <DashboardOutlined />,
    link: "/dashboard"
  },
  {
    name: "Lists",
    icon: <ListIcon />,
    link: "/lists"
  },
  {
    name: "Activities",
    icon: <PointOfSaleIcon />,
    link: "/activities"
  },
  {
    name: "Calendar",
    icon: <CalendarMonthIcon />,
    link: "/events"
  },
  {
    name: "Orders",
    icon: <ShoppingCartOutlined />,
    link: "/orders"
  },
  {
    name: "Messages",
    icon: <MessageOutlined />,
    link: "/messages"
  },
  {
    name: "Meetings",
    icon: <MeetingRoomOutlined />,
    link: "/mymeetings"
  },
  {
    name: "Settings",
    icon: <SettingsOutlined />,
    link: "/settings"
  },
]


export default function AppLayout({socket}) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);
  const [openActivityModal, setOpenActivityModal] = React.useState(false);

  const token = getToken()
  const {id, name, allUsers, profile_pic, onlineUsers, showLogoutNotification} = useSelector(state => state.user)
  const {list, loadingCompanies} = useSelector(state => state.list)
  const [loggedIn, setLoggedIn] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("");
  const {searchResults} = useSelector(state=> state.company)
  const dispatch = useDispatch()
  const {pathname} = useLocation()
  const {selectedCompanyId} = useSelector(state => state.list)
  const [inboxData, setInboxData] = React.useState([])
  const [invitedMeetingsData, setInvitedMeetingsData] = React.useState([])
  const { invitedMeetings } = useSelector((state) => state.meeting) 
  const {fetchNotifications} = useSelector(state => state.message)
  const {activities} = useSelector(state=> state.activity)
  const [openAlert, setOpenAlert] = React.useState(false)
  const [text, setText] = React.useState("")
  const [alertType, setAlertType] = React.useState("")
  const navigate = useNavigate()

  const handleOpen = () => setOpenActivityModal(true);

  const [openUsersMenu, setOpenUsersMenu] = React.useState(false);

  const handleOpenUsersMenu = () => {
    setOpenUsersMenu(!openUsersMenu);
  };

  const [state, setState] = React.useState({
    openNotification: false,
    vertical: 'top',
    horizontal: 'center',
  });
  const { vertical, horizontal, openNotification } = state;

  const handleCloseNotification = () => {
    setState({ ...state, openNotification: false });
  };

  const isListPage = matchPath("/listsview/*", pathname)
  const isJoinPage = matchPath("/join/*", pathname)

  const handleCloseAlert = () => {
    setOpenAlert(false)
  }

  const showAlert = (msg, sev) => {
    setOpenAlert(true)
    setAlertType(sev)
    setText(msg)
  }

  React.useEffect(() => {
    if (!token || name === "") {
      setLoggedIn(false)
    } else {
      setLoggedIn(true)
    }
  }, [token, name])

  React.useEffect(()=> {
    const getSearchResult = async () => {
      await instance({
        url: `companies/search?query=${searchQuery}`,
        method: "GET",
      }).then((res) => {

        dispatch(setSearchResults({companies: res.data.companies}))
      })
      .catch(()=> {
        showAlert("Ooops an error was encountered", "error")
      })
    }

    if (searchQuery.length === 3){
      getSearchResult()
    }
  }, [searchQuery])

  React.useEffect(()=> {
    if ( isListPage?.pathnameBase === "/listsview") {
      setOpen(true)
    }
  }, [isListPage?.pathnameBase])

  const getNotifications = async (value) => {
    await instance.get(`notifications`)
    .then((res) => {
       setInboxData(res.data.inbox)
       setInvitedMeetingsData(res.data.invitedMeetings)

       if (value === "showNotification") {
        setState({ ...state, openNotification: true });
       }
    })
  }

  React.useEffect(()=> {
     getNotifications("none")
  }, [loggedIn, fetchNotifications])

  React.useEffect(()=> {
    socket.on('receiveNotification', (message) => {
      dispatch(setReloadMessages({reloadMessages: true}))
      getNotifications("showNotification")
      
    });
    
    socket.on('newUserResponse', (arr) => {
      dispatch(setOnlineUsers({onlineUsers: arr}))
      
    });

    socket.on('userLogoutResponse', (arr) => {
      dispatch(setOnlineUsers({onlineUsers: arr}))
      
    });
  }, [socket])

  // React.useEffect(()=> {
  //  console.log(onlineUsers);
  // }, [onlineUsers])

  const handleDrawerOpen = () => {
    setOpen(prev => !prev)
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const getInitials = (string) => {
    let names = string?.split(' '),
        initials = names[0].substring(0, 1).toUpperCase();
    
    if (names.length > 1) {
        initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  }

  const getImage = (userId) => {

    let image_src = allUsers?.find((a)=> a.id === userId)?.profile_pic

    if ( image_src === ""  || image_src === null) {
      return (
        <div 
          style={{
            display: "inline-block",
            backgroundColor: "gray" ,
            borderRadius: "50%",
            cursor: "pointer",
          }}
          onClick={() => navigate(`/profile/${allUsers?.find((a)=> a.id === userId)?.id}`)}
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
            {getInitials(allUsers?.find((a)=> a.id === userId)?.name)}
          </p>
        </div>
      )
    } else {
      return (
        <img 
          width="30px" 
          height="30px" 
          src={image_src}  
          alt='profile_pic' 
          style={{borderRadius: "50%", cursor: "pointer"}} 
          onClick={() => navigate(`/profile/${allUsers?.find((a)=> a.id === userId)?.id}`)}
        />
      )
    }
  }

  const renderBox = () => {
    return (
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <main style={{width: "100%", marginTop: "50px"}}>
          
          {
            showLogoutNotification && (<p style={{margin: "auto", textAlign: "center", color: "green"}}>Logging out...</p>)
          }
          <Outlet />
        </main>
      </Box>
    )
  }

  const renderExpandIcon = (open) => {
    if(open) {
      return (
        <ExpandLess />
      )
    } else {
      return (
        <ExpandMore />
      )
    }
  }

  const renderBorderRadius = (a) => {

    if(!open) {
      return "100px"
    } else {
      if(matchPath(`${a.link}/*`, pathname)?.pathnameBase === `${a.link}`) {
        return "15px"
      } else {
        return ""
      }
    }
  }

  const listItemIcon = (obj) => {
    return <ListItemIcon
            sx={{
              minWidth: 0,
              mr: open ? 3 : 'auto',
              justifyContent: 'center',
            }}
          >
            {obj?.icon}
          </ListItemIcon>
  }

  const renderListItem = (a, activities) => {
    let total_inbox = inboxData?.filter((a) => !a.isRead)?.length 
    if(!open ) {
      if (a?.name === "Activities") {
        if(activities.length > 0) {
          return  <Badge color="secondary" variant="dot">
                    {
                      listItemIcon(a)
                    }
                  </Badge>
        } else {
          return listItemIcon(a)
        }
    
      }

      if (a?.name === "Messages") {
        if(total_inbox > 0) {
          return  <Badge color="secondary" variant="dot">
                    {
                      listItemIcon(a)
                    }
                  </Badge>
        } else {
          return listItemIcon(a)
        }
    
      } 

      return listItemIcon(a)
    } else {
      return listItemIcon(a)
    }
  }

  const renderOnlineUsres = (users) => {
    if(!open && users.length) {
      return  <Badge color="secondary" variant="dot">
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  <PeopleOutline />
                </ListItemIcon>
              </Badge>
    } else {
      return  <>
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  <PeopleOutline />
                </ListItemIcon>
                <ListItemText primary="Online Users" sx={{ opacity: open ? 1 : 0 }}  />
              </>
    }
  }

  const renderCount = (obj) => {
    let total_inbox = inboxData?.filter((a) => !a.isRead)?.length 

    if(obj?.name === "Activities") {
      return <span>{activities.length}</span>
    }
    
    if(obj?.name === "Messages") {
      return <span>{total_inbox}</span>
    }

    return null
  }

  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />

        <AppBar position='fixed' open={open} color="secondary" sx={{ width: "100%" }}>
          <Toolbar>
            <Typography variant='h5' component="div" sx={{ flexGrow: 1 }} >
              <DensitySmallOutlined onClick={handleDrawerOpen} style={{cursor: "pointer"}} /> &nbsp;&nbsp;&nbsp;
              <Link to="/" style={{textDecoration: "none", color: "white"}}>
                <span>CRM</span>
              </Link>
            </Typography>

            {
              loggedIn && (
                  <SearchBar  
                    data={searchResults} 
                    setSearchQuery={setSearchQuery} 
                    navigate={navigate}
                  />
              )
            }&nbsp;&nbsp;&nbsp;&nbsp;

            {
                loggedIn && (
                  <BellNotification inbox={inboxData} allUsers={allUsers} invitedMeetings={invitedMeetingsData} setState={setState} />
                )
            }&nbsp;&nbsp;&nbsp;&nbsp;
          
            
  {/* 
            <Button component={NavLink} to='/' style={({ isActive }) => { return { backgroundColor: isActive ? '#6d1b7b' : '' } }} sx={{ color: 'white', textTransform: 'none' }}>About</Button>

            <Button component={NavLink} to='/contact' style={({ isActive }) => { return { backgroundColor: isActive ? '#6d1b7b' : '' } }} sx={{ color: 'white', textTransform: 'none' }}>Contact</Button> */}

            {
              loggedIn ? 
              <UserAccountsCircle name={name} profile_pic={profile_pic} socket={socket}/> : 
              <Button 
                component={NavLink} 
                to='/login' style={({ isActive }) => { return { backgroundColor: isActive ? '#6d1b7b' : '' } }} 
                sx={{ color: 'white', textTransform: 'none' }}
              >
                  Login/Registration
              </Button>
            }

          </Toolbar>  
          
        </AppBar>
        {
            ( loggedIn && isJoinPage?.pathnameBase !== "/join" ) ? (
                <>
                  <Drawer variant="permanent" open={open} backgroundColor="red">
                    <DrawerHeader>
                      <IconButton onClick={handleDrawerClose}>
                        {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                      </IconButton>
                    </DrawerHeader>
                    <Divider />
                    {
                      isListPage?.pathnameBase !== "/listsview" && (
                        <Tooltip title="Start Activity">
                          {
                            open ? (
                              <Button 
                                variant="contained" 
                                size='small' 
                                onClick={handleOpen} 
                                style={{
                                  borderRadius: "30px", 
                                  marginTop: "10px", 
                                  width: "80%", 
                                  marginLeft: "20px"
                                }}
                              >
                                <AddOutlined />Start Activity
                              </Button>
                            ) : (
                              <IconButton color="primary" aria-label="start-activity" size="large"  onClick={handleOpen}>
                                <AddOutlined fontSize="inherit" />
                              </IconButton>
                            )
                          }
                         
                        </Tooltip>
                      )
                    }
                  
                    <List>
                      {
                        isListPage?.pathnameBase === "/listsview" ? (
                          <>
                          {
                              loadingCompanies ? (
                                <Box sx={{ display: 'flex', marginLeft: "35%" }}>
                                  <Typography variant='h6'>Loading...</Typography>
                                </Box>
                              ) : (
                                <>
                                  <div style={{display: "flex", justifyContent: "space-between"}}>
                                    {
                                      list?.name.length > 10 ? (
                                        <Tooltip title={list?.name}>
                                            <Typography variant="h6" style={{marginLeft: "10px", opacity: open ? 1 : 0 }}>
                                              <b>{`${list?.name.substring(0,10)}...`}</b>
                                            </Typography>
                                        </Tooltip>
                                      ) : (
                                      
                                        <Typography variant="h6" style={{marginLeft: "10px", opacity: open ? 1 : 0 }}>
                                          <b>{list?.name}</b>
                                        </Typography>
                                      )
                                    }


                                    <ListIcon style={{cursor: "pointer", opacity: open ? 1 : 0 }} onClick={() => navigate("/lists")} />

                                  </div>
                                
                                  { 
                                    open &&
                                    list?.companies.map((a) => (
                                    <ListItem  
                                        disablePadding 
                                        sx={{ 
                                          display: 'block',
                                          backgroundColor: selectedCompanyId === a.id ? "#DDA0DD" : "" ,
                                          borderRadius: selectedCompanyId === a.id ? "15px" : "" 
                                        }}
                                        onClick={() => dispatch(setSelectedCompanyId({id: a.id}))}
                                      >
                                        <ListItemButton
                                          sx={{
                                            minHeight: 48,
                                            justifyContent: open ? 'initial' : 'center',
                                            px: 2.5,
                                          }}
                                        >
                                          <ListItemText 
                                            primary={a.name} 
                                            sx={{ opacity: open ? 1 : 0 }} 
                                          />
                                        </ListItemButton>
                                      </ListItem>
                                    ))
                                  }
                                </>
                              )
                          }
                          
                          </>
                        ) : 
                        sideBarItems.map((a, i) => (
                            <ListItem 
                              key={i} 
                              disablePadding 
                              sx={{ 
                                display: 'block', 
                                backgroundColor: matchPath(`${a.link}/*`, pathname)?.pathnameBase === `${a.link}` ? "#DDA0DD" : null ,
                                borderRadius: renderBorderRadius(a),
                                width: open ? null : "50px",
                                height: open ? null : "50px",
                                marginLeft: open ? null : "6px"
                              }}
                              onClick={()=> navigate(`${a.link}`)}
                            >
                               <ListItemButton
                                  sx={{
                                    minHeight: 48,
                                    justifyContent: open ? 'initial' : 'center',
                                    px: 2.5,
                                  }}
                               >
                                {
                                  renderListItem(a, activities)
                                }
                                  <ListItemText primary={a.name} sx={{ opacity: open ? 1 : 0 }} />
                                  {
                                    open && renderCount(a)
                                  }
                                
                                </ListItemButton>
                            </ListItem>
                        ))
                      }

                      {
                         isListPage?.pathnameBase !== "/listsview" &&  (
                          <Tooltip title="Online users">
                            <ListItem 
                              disablePadding 
                              sx={{ 
                                display: 'block',
                              }}
                            >
                              <ListItemButton 
                                onClick={handleOpenUsersMenu}
                                sx={{
                                  minHeight: 48,
                                  justifyContent: open ? 'initial' : 'center',
                                  px: 2.5,
                                }}
                              >
                                {
                                  renderOnlineUsres(onlineUsers.filter((b) => b.userId !== id))
                                }

                                {/* <ListItemText primary="Online Users" sx={{ opacity: open ? 1 : 0 }}  /> */}

                                {open && <span style={{marginTop: "3px"}}>{onlineUsers.filter((b) => b.userId !== id).length}</span>}

                                {
                                  open ? renderExpandIcon(openUsersMenu) : null
                                }
                              </ListItemButton>
                              <Collapse in={openUsersMenu} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
      
                                  {
                                    onlineUsers.filter((b) => b.userId !== id).map((a) => (
                                      <Tooltip title={allUsers?.find((c) => c.id === a.userId)?.name}>
                                        <ListItemButton sx={{ pl: 4 }}  onClick={() => navigate(`/profile/${allUsers?.find((c)=> c.id === a.userId)?.id}`)}>
                                        {getImage(a.userId)}
                                          <ListItemText primary={allUsers?.find((c) => c.id === a.userId)?.name} />
                                        </ListItemButton>
                                      </Tooltip>
                                    ))
                                  }
                                </List>
                              </Collapse>
                            </ListItem>
                          </Tooltip>
                         )
                      }
                     
                    
                    </List>
                  </Drawer>

                  {
                    renderBox()
                  }
                </>
            ) : renderBox()
        }
      
      </Box>

      <ActivityModal
        open={openActivityModal}
        setOpen={setOpenActivityModal}
        mode="sidebar"
      />


      <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alertType} sx={{ width: '100%' }}>
          {text}
        </Alert>
      </Snackbar>

      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={openNotification}
        onClose={handleCloseNotification}
        key={vertical + horizontal}
      >
      <Alert onClose={handleCloseNotification} severity="success" sx={{ width: '100%' }}>
        You have a new notification
      </Alert>
    </Snackbar>
    </>
  );
}