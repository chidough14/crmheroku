import { useEffect } from 'react';
import { getToken, removeToken } from './LocalStorageService';
import { useLogoutUserMutation } from './userAuthApi';
import { unsetUserInfo } from '../features/userSlice';
import { unsetUserToken } from '../features/authSlice';
import { useDispatch } from 'react-redux';

const SessionTimer = ({socket}) => {
  const token = getToken()
  const [logoutUser] = useLogoutUserMutation()
  const dispatch = useDispatch()

  useEffect(() => {
    let timer = null;

    const resetTimer = () => {
      // Reset the timer whenever there is user activity
      clearTimeout(timer);
      timer = setTimeout(logout, 2 * 60 * 1000); // 60 minutes in milliseconds
    };

    const logout = async () => {
      const res = await logoutUser({ token })
      if (res.data.status === "success") {
        socket.emit("logout")
        dispatch(unsetUserToken({ token: null }))
        dispatch(unsetUserInfo({ id: undefined, email: "", name: "", setting: undefined, created_at: "", profile_pic: "" }))
        removeToken('token')
        // navigate('/login')
        //location.reload()
        window.location.href = '/login'; 
      }
    };

    // Add event listeners to detect user activity
    document.addEventListener('mousemove', resetTimer);
    document.addEventListener('mousedown', resetTimer);
    document.addEventListener('keypress', resetTimer);
    document.addEventListener('touchmove', resetTimer);
    document.addEventListener('touchstart', resetTimer);

    // Start the initial timer
    resetTimer();

    // Cleanup event listeners on component unmount
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousemove', resetTimer);
      document.removeEventListener('mousedown', resetTimer);
      document.removeEventListener('keypress', resetTimer);
      document.removeEventListener('touchmove', resetTimer);
      document.removeEventListener('touchstart', resetTimer);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default SessionTimer;
