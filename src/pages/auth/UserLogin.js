import { TextField, Button, Box, Alert, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getToken, storeToken } from '../../services/LocalStorageService';
import { useLoginUserMutation } from '../../services/userAuthApi';
import { setUserToken } from '../../features/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { setShowLoginSpinner, setUserInfo } from '../../features/userSlice';

const UserLogin = () => {
  const [error, setError] = useState({
    status: false,
    msg: "",
    type: ""
  })
  const navigate = useNavigate();
  const [loginUser] = useLoginUserMutation()
  const dispatch = useDispatch()
  const { showLoginSpinner } = useSelector(state => state.user)

  const handleSubmit = async (e) => {
    dispatch(setShowLoginSpinner({showLoginSpinner: true}))
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const actualData = {
      email: data.get('email'),
      password: data.get('password'),
    }
    if (actualData.email && actualData.password) {
      const res = await loginUser(actualData)
      
      if (res.data && res.data.status === "success") {
        // Store Token Code here
        storeToken(res.data.token)
        dispatch(setUserInfo({ email: res.data.user.email, name: res.data.user.name }))
        dispatch(setUserToken({ token: res.data.token }))
        dispatch(setShowLoginSpinner({showLoginSpinner: false}))
        navigate('/dashboard')
      }
      if (res.data && res.data.status === "failed") {
        setError({ status: true, msg: res.data.message, type: 'error' })
        dispatch(setShowLoginSpinner({showLoginSpinner: false}))
      }
    } else {
      setError({ status: true, msg: "All Fields are Required", type: 'error' })
      dispatch(setShowLoginSpinner({showLoginSpinner: false}))
    }
  }

  // Store User Auth Token in Redux Store
  // let token = getToken()
  // const dispatch = useDispatch()
  // useEffect(() => {
  //   dispatch(setUserToken({ token: token }))
  // }, [token, dispatch])

  return <>
    <Box component='form' noValidate sx={{ mt: 1 }} id='login-form' onSubmit={handleSubmit}>
      <TextField margin='normal' required fullWidth id='email' name='email' label='Email Address' />
      <TextField margin='normal' required fullWidth id='password' name='password' label='Password' type='password' />
      <Box textAlign='center'>
        <Button type='submit' variant='contained' sx={{ mt: 3, mb: 2, px: 5 }}>
          Login 
        </Button>
        {
          showLoginSpinner && (
            <CircularProgress size={28}  style={{marginLeft: "16px", marginBottom: "-14px"}} />
          )
        }
      </Box>
      <NavLink to='/sendpasswordresetemail' >Forgot Password ?</NavLink>
      {error.status ? <Alert severity={error.type} sx={{ mt: 3 }}>{error.msg}</Alert> : ''}
    </Box>
  </>;
};

export default UserLogin;
