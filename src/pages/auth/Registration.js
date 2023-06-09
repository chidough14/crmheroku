import { TextField, FormControlLabel, Checkbox, Button, Box, Alert, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegisterUserMutation } from '../../services/userAuthApi';
import { storeToken } from '../../services/LocalStorageService';
import { useDispatch, useSelector } from 'react-redux';
import { setShowLoginSpinner, setUserInfo } from '../../features/userSlice';
import { setUserToken } from '../../features/authSlice';

const Registration = () => {
  const dispatch = useDispatch()
  const [error, setError] = useState({
    status: false,
    msg: "",
    type: ""
  })
  const navigate = useNavigate();
  const { showLoginSpinner } = useSelector(state => state.user)
  const [registerUser] = useRegisterUserMutation()
  const handleSubmit = async (e) => {
    dispatch(setShowLoginSpinner({showLoginSpinner: true}))
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const actualData = {
      name: data.get('name'),
      email: data.get('email'),
      password: data.get('password'),
      password_confirmation: data.get('password_confirmation'),
      tc: data.get('tc'),
    }
    if (actualData.name && actualData.email && actualData.password && actualData.password_confirmation && actualData.tc !== null) {
      if (actualData.password === actualData.password_confirmation) {

        const res = await registerUser(actualData)

        if (res.data.status === "success") {
          // Store Token Code here
          storeToken(res.data.token)
          dispatch(setUserInfo({ email: res.data.user.email, name: res.data.user.name }))
          dispatch(setUserToken({ token: res.data.token }))
          dispatch(setShowLoginSpinner({showLoginSpinner: false}))
          navigate('/dashboard')
          //window.location.reload()
        }
        if (res.data.status === "failed") {
          setError({ status: true, msg: res.data.message, type: 'error' })
          dispatch(setShowLoginSpinner({showLoginSpinner: false}))
        }
      } else {
        setError({ status: true, msg: "Password and Confirm Password Doesn't Match", type: 'error' })
        dispatch(setShowLoginSpinner({showLoginSpinner: false}))
      }
    } else {
      setError({ status: true, msg: "All Fields are Required", type: 'error' })
      dispatch(setShowLoginSpinner({showLoginSpinner: false}))
    }
  }
  return <>
    <Box component='form' noValidate sx={{ mt: 1 }} id='registration-form' onSubmit={handleSubmit}>
      <TextField margin='normal' required fullWidth id='name' name='name' label='Name' />
      <TextField margin='normal' required fullWidth id='email' name='email' label='Email Address' />
      <TextField margin='normal' required fullWidth id='password' name='password' label='Password' type='password' />
      <TextField margin='normal' required fullWidth id='password_confirmation' name='password_confirmation' label='Confirm Password' type='password' />
      <FormControlLabel control={<Checkbox value={true} color="primary" name="tc" id="tc" />} label="I agree to term and condition." />
      <Box textAlign='center'>
        <Button type='submit' variant='contained' sx={{ mt: 3, mb: 2, px: 5 }}>Join</Button>
        {
          showLoginSpinner && (
            <CircularProgress size={28}  style={{marginLeft: "16px", marginBottom: "-14px"}} />
          )
        }
      </Box>
      {error.status ? <Alert severity={error.type}>{error.msg}</Alert> : ''}
    </Box>
  </>;
};

export default Registration;
