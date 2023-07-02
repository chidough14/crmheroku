import { Box, TextField, Button, Typography, Tooltip, Snackbar, CircularProgress } from '@mui/material';
import React, { useEffect, useReducer, useState } from 'react';
import { getToken } from '../../services/LocalStorageService';
import { useChangeUserPasswordMutation } from '../../services/userAuthApi';
import { useDispatch, useSelector } from 'react-redux';
import { ChangeCircleOutlined, MessageOutlined, PeopleOutlineOutlined, SaveOutlined, UpdateOutlined} from '@mui/icons-material';
import moment from 'moment';
import UploadWidget from './UploadWidget';
import instance from '../../services/fetchApi';
import { addFollowers, reloadFollowers, removeFollower, setFollwed, setFollwers, setShowSaveNotification, setShowSpinner, setUserInfo, updateAllUsers } from '../../features/userSlice';
import avatar from '../../assets/avtar9.jpg';
import MuiAlert from '@mui/material/Alert';
import { useNavigate, useParams } from 'react-router-dom';


const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const MyAccount = ({ socket }) => {

  const [error, setError] = useState({
    status: false,
    msg: "",
    type: ""
  });
  const [imageUrl, setImageUrl] = useState("")
  const [imageLoaded, setImageLoaded] = useState(false)
  const [changeUserPassword] = useChangeUserPasswordMutation()
  const token = getToken()
  const {
    id, 
    name, 
    email, 
    created_at, 
    profile_pic, 
    allUsers, 
    showSpinner, 
    showSaveNotification, 
    onlineUsers,
    followers,
    followed,
    usersFollowed,
    usersFollowers,
    reload
  } = useSelector(state => state.user)
  const dispatch = useDispatch()
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [severity, setSeverity] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showUpdateProfileForm, setShowUpdateProfileForm] = useState(false);
  const [profile, setProfile] = useState();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [lastSeen, setLastSeen] = useState("")
  const [loadingLastSeen, setLoadingLastSeen] = useState(false)
  const [showUpdateNotification, setShowUpdateNotification] = useState(false)
  const params = useParams()
  const navigate = useNavigate()

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

  
  const getLastSeen = async (user_id) => {
    setLoadingLastSeen(true)
    await instance.get(`userlogout/${user_id}`)
    .then((res) => {
       console.log(res);
       setLastSeen(res.data.record)
       setLoadingLastSeen(false)
    })
    .catch((e) => {
       console.log(e);
    })
  };

  const getUserProfile = async (user_id) => {
    setLoadingProfile(true)
    await instance.get(`get-profile/${user_id}`)
    .then((res) => {
      setLoadingProfile(false)
      setProfile(res.data.profile)
    })
    .catch(() => {
      setLoadingProfile(false)
      showAlert("Ooops an error was encountred", "error")
    })
  }

  const getFollwers = async (id = null) => {
    let url
    url = id ? `followers/${id}` : `followers`
    await instance.get(url)
    .then((res) => {
      if(id) {
        dispatch(setFollwers({followers: res.data.followers}))
      } else {
        dispatch(setFollwers({usersFollowers: res.data.followers}))
      }
    })
    .catch(() => {
      
    })
  }

  const getFollwed = async (id = null) => {
    let url
    url = id ? `followed/${id}` : `followed`
    await instance.get(url)
    .then((res) => {
       if(id) {
        dispatch(setFollwed({followed: res.data.followed}))
      } else {
        dispatch(setFollwed({usersFollowed: res.data.followed}))
      }
    })
    .catch(() => {
      
    })
  }

  
  useEffect(() => {
    if (params.id === "mine") {
      getFollwers()
      getFollwed()
    } else {
      getFollwers(params.id)
      getFollwed(params.id)
    }
  }, [params.id, reload])

  useEffect(() => {
    if (params.id === "mine") {
      
    } else {
      getLastSeen(params.id)
    }
  }, [params.id, onlineUsers.length])

  useEffect(() => {
    if (profile_pic !== "") {
      setImageUrl(profile_pic)
    }
  }, [profile_pic])

  useEffect(() => {
    
    if (params.id === "mine") {
      getUserProfile(id)
      setImageUrl(profile_pic)
    } else {
      getUserProfile(params.id)
      setImageUrl(allUsers?.find((a)=> a.id === parseInt(params.id))?.profile_pic)
    }
  }, [params.id])

  const initialState = {
    bio: "",
    company: "",
    address: "",
    occupation: "",
    website: ""
  };

  const [data, updateData] = useReducer(
    (state, updates) => ({ ...state, ...updates }),
    initialState
  );

  const populateFields = () => {
    updateData({
      bio: profile?.bio,
      company: profile?.company,
      address: profile?.address,
      occupation: profile?.occupation,
      website: profile?.website,
    })
  }

  const showLastSeen = (lastSeen) => {
    if(lastSeen && lastSeen.created_at) {
      return moment(lastSeen.created_at).format("MMM Do YYYY, h:mm a")
    } else {
      return null
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const actualData = {
      password: data.get('password'),
      password_confirmation: data.get('password_confirmation'),
    }

    if (actualData.password && actualData.password_confirmation) {

      if (actualData.password === actualData.password_confirmation) {
        const res = await changeUserPassword({ actualData, token })

        if (res.data.status === "success") {
          document.getElementById("password-change-form").reset();
          setError({ status: true, msg: "Password Changed Successful", type: "success" });
          setShowChangePassword(false)
        }

      } else {
        setError({ status: true, msg: "Password and Confirm Password Doesn't Match", type: "error" })
      }
    } else {
      setError({ status: true, msg: "All Fields are Required", type: "error" })
    }
  };

  const uploadImage = async (value) => {
    dispatch(setShowSaveNotification({showSaveNotification: true}))
    await instance.patch(`users/${id}`, {profile_pic: value})
    .then((res) => {
      dispatch(setShowSaveNotification({showSaveNotification: false}))
      dispatch(setUserInfo(res.data.user))
      dispatch(updateAllUsers({user: res.data.user}))
      showAlert("Picture saved", "success")
      setImageLoaded(false)
    })
    .catch(() => {
      showAlert("Ooops an error was encountred", "error")
      dispatch(setShowSaveNotification({showSaveNotification: false}))
    })
  }

  const updateProfile = async () => {
    dispatch(setShowSpinner({showSpinner: true}))
    let body = {
      bio: data.bio,
      company: data.company,
      address: data.address,
      occupation: data.occupation,
      website: data.website,
    }
    await instance.post(`update-profile`, body)
    .then((res) => {
      dispatch(setShowSpinner({showSpinner: false}))
      setProfile(res.data.profile)
      showAlert("Profile saved", "success")
    })
    .catch(() => {
      dispatch(setShowSpinner({showSpinner: false}))
      showAlert("Ooops an error was encountred", "error")
    })
  }

  const showOnlineStatus = (id) => {
    let status = onlineUsers.find((a) => a.userId === parseInt(id))
    if(status){
      return (<span>Online</span>)
    } else {
      return (<span>{loadingLastSeen ?  "Loading status..."  : showLastSeen(lastSeen)}</span>)
    }
  }

  const renderFollowersCount = () => {
    if (params.id === "mine") {
      return usersFollowers.length 
    } else {
      return followers.length 
    }
  }

  const renderFollowedCount = () => {
    if (params.id === "mine") {
      return usersFollowed.length 
    } else {
      return followed.length 
    }
  }

  const followUser = async (followee_id) => {
    setShowUpdateNotification(true)
    await instance.post(`follow-user`, {followee_id})
    .then((res) => {
      setShowUpdateNotification(false)
      dispatch(addFollowers({follower: res.data.record}))
      socket.emit('userFollowed', { recipientId:  parseInt(followee_id)});
    })
    .catch(() => {
      setShowUpdateNotification(false)
      showAlert("Ooops an error was encountred", "error")
    })
  }

  const unFollowUser = async (followee_id) => {
    setShowUpdateNotification(true)
    await instance.post(`unfollow-user`, {followee_id})
    .then((res) => {
      setShowUpdateNotification(false)
      dispatch(removeFollower({id}))
      socket.emit('userFollowed', { recipientId:  parseInt(followee_id)});
    })
    .catch(() => {
      setShowUpdateNotification(false)
      showAlert("Ooops an error was encountred", "error")
    })
  }

  const renderFollowIcon = () => {
    if (followers.map((a) => a.follower_id).includes(id)) {
      return (
        <Tooltip title="Unfollow">
          <Button
            onClick={() => {
              unFollowUser(params.id)
            }}
            variant='contained'
            size='small'
          >
            Unfollow
          </Button>
        </Tooltip>
      )
    } else {
      return (
        <Tooltip title="Follow">
          <Button
            onClick={() => {
              followUser(params.id)
            }}
            size='small'
            variant='contained'
          >
            Follow
          </Button>
        </Tooltip>
      )
    }
  }

  return <>
    <Box sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap', maxWidth: 600, mx: 4 }}>
      <div style={{display: "flex", justifyContent: 'space-between', marginTop: "30px"}}>
        
        <div>
          {
           ( imageUrl === ""  || imageUrl === null) ? (
              <img width="300px" height="300px" src={avatar}  alt='profile_pic' style={{borderRadius: "50%"}}/>
              
            ) : (
              <img width="300px" height="300px" src={imageUrl}  alt='profile_pic' style={{borderRadius: "50%"}}/>
            )
          }
          
          {
           ( profile?.user_id === id || params.id === "mine" || parseInt(params.id) === id) &&
            <div style={{display: 'flex', justifyContent: 'space-between', width: "120%"}}>
              <Tooltip title='Change Picture'>
                <Button 
                  size='small' 
                >
                  <UploadWidget setImageUrl={setImageUrl} imageUrl={imageUrl} setImageLoaded={setImageLoaded} />
                </Button>
                
              </Tooltip>

              <Tooltip title='Save'>
                <Button 
                  size='small' 
                  onClick={() => {
                    uploadImage(imageUrl)
                  }} 
                  style={{borderRadius: "30px"}}
                  disabled={!imageLoaded}
                >
                  <SaveOutlined />
                </Button>
              </Tooltip>

              <Tooltip title='Update Profile'>
                <Button
                  size='small' 
                  onClick={()=> {
                    setShowUpdateProfileForm(prev => !prev)
                    populateFields()
                  }}
                  
                >
                  <UpdateOutlined />
                </Button>
              </Tooltip>

              <Tooltip title='Change Password'>
                <Button
                  size='small' 
                  onClick={()=> setShowChangePassword(prev => !prev)}
                  
                >
                  <ChangeCircleOutlined />
                </Button>
              </Tooltip>
            </div>
          }


          {
            (params.id !== "mine" && profile?.user_id !== id) && (
              <>
                {
                  renderFollowIcon()
                }

                <Tooltip title="Send Message">
                  <Button onClick={() => navigate(`/messages`, { state: {id: params?.id, populateEmail: true, sendMessage: true}})}>
                    <MessageOutlined />
                  </Button>
                </Tooltip>
              </>
            
            )
          }
        </div>
        
        {
          loadingProfile ? (
              <Box sx={{ display: 'flex', marginRight: "30%", marginTop: "20%" }}>
                <CircularProgress size={48} />
              </Box>
          ) : (
            <div style={{marginLeft: "50px"}}>
              <Typography variant="h7" display="block"  gutterBottom>
                <b>Name</b> : { params.id === "mine" ? name : allUsers?.find((a)=> a.id === parseInt(params.id))?.name }
              </Typography>

              <Typography variant="h7" display="block"  gutterBottom>
                <b>Email</b> : {params.id === "mine" ?  email : allUsers?.find((a)=> a.id === parseInt(params.id))?.email }
              </Typography>

              <Typography variant="h7" display="block"  gutterBottom>
                <b>Date Registered</b> : { params.id === "mine" ? moment(created_at).format('MMMM Do YYYY') : moment(allUsers?.find((a)=> a.id === parseInt(params.id))?.created_at).format('MMMM Do YYYY') }
              </Typography>


              <Typography variant="h7" display="block"  gutterBottom>
                <b>Bio</b> : { profile?.bio }
              </Typography>

              <Typography variant="h7" display="block"  gutterBottom>
                <b>Company</b> : { profile?.company }
              </Typography>

              <Typography variant="h7" display="block"  gutterBottom>
                <b>Address</b> :  { profile?.address }
              </Typography>

              <Typography variant="h7" display="block"  gutterBottom>
                <b>Occupation</b> :  { profile?.occupation }
              </Typography>

              <Typography variant="h7" display="block"  gutterBottom>
                <b>Website</b> :  { profile?.website }
              </Typography>

              {
                params.id !== "mine" && (
                  <Typography variant="h7" display="block"  gutterBottom>
                    <b>Last seen</b> :  { showOnlineStatus(params.id) }
                  </Typography>
                )
              }

              <div>
                <PeopleOutlineOutlined style={{marginBottom: "-5px"}} /> <span >{ renderFollowersCount() } Follower . { renderFollowedCount() } Following</span>
              </div>
             
            </div>
          )
        }
      </div>

      {
        showUpdateNotification && (<p style={{color: "green", fontSize: "14px"}}>Updating....</p>)
      }
      
      {
        showSaveNotification && (<p style={{color: "green", fontSize: "14px"}}>Saving picture....</p>)
      }

      {
        showChangePassword && (
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }} id="password-change-form">
            <TextField size='small' margin="normal" required fullWidth name="password" label="New Password" type="password" id="password" />
            <TextField  size='small' margin="normal" required fullWidth name="password_confirmation" label="Confirm New Password" type="password" id="password_confirmation" />
            <Box textAlign='center'>
              <Button type="submit" size='small' variant="contained" sx={{ mt: 3, mb: 2, px: 5, borderRadius: "30px" }}> Update </Button>
            </Box>
            {error.status ? <Alert severity={error.type}>{error.msg}</Alert> : ""}
          </Box>
        )
      }


      {
        showUpdateProfileForm && (
          <Box noValidate sx={{ mt: 1 }} id="password-change-form">
            <TextField size='small' margin="normal" fullWidth name="bio" label="Bio"  id="bio" multiline rows={4} value={data.bio} onChange={(e) => updateData({bio: e.target.value})} />
            <TextField size='small' margin="normal" fullWidth name="company" label="Company"  id="company" value={data.company}  onChange={(e) => updateData({company: e.target.value})} />
            <TextField size='small' margin="normal" fullWidth name="address" label="Address"  id="address" value={data.address}  onChange={(e) => updateData({address: e.target.value})} />
            <TextField size='small' margin="normal" fullWidth name="occupation" label="Occupation"  id="occupation" value={data.occupation}  onChange={(e) => updateData({occupation: e.target.value})} />
            <TextField size='small' margin="normal" fullWidth name="website" label="Website"  id="website" value={data.website} onChange={(e) => updateData({website: e.target.value})} />
            <Box textAlign='center'>
              <Button  
                size='small' 
                variant="contained" 
                sx={{ mt: 3, mb: 2, px: 5, borderRadius: "30px" }} 
                onClick={updateProfile}
              >
                 {
                  showSpinner ? (
                    <Box sx={{ display: 'flex' }}>
                      <CircularProgress size={24} color="inherit" />
                    </Box>
                  ) : "Update"
                 } 
              </Button>
            </Box>
          </Box>
        )
      }
     
    </Box>


    <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
      <Alert onClose={handleCloseAlert} severity={severity} sx={{ width: '100%' }}>
        {alertMessage}
      </Alert>
    </Snackbar>
  </>;
};

export default MyAccount;
