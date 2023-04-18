import { Grid, Card, Tabs, Typography, Tab, Box } from '@mui/material';
import { useEffect, useState } from 'react';
import Pic1 from '../../images/pic1.png'
import Registration from './Registration';
import UserLogin from './UserLogin';
import { ShoppingBag } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../services/LocalStorageService';

const TabPanel = (props) => {
  const { children, value, index } = props;
  return (
    <div role='tabpanel' hidden={value !== index}>
      {
        value === index && (
          <Box>{children}</Box>
        )
      }
    </div>
  )
}
const LoginReg = () => {
  const navigate = useNavigate()
  const token = getToken()

  const [value, setValue] = useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  }

  useEffect(() => {
    if (token) {
      navigate('/dashboard')
    }
  }, [token])
  return <>
    <Grid container sx={{ height: '90vh' }}>
      <Grid item lg={7} sm={5} sx={{
        backgroundImage: `url(${Pic1})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: { xs: 'none', sm: 'block' }
      }}>
      </Grid>
      <Grid item lg={5} sm={7} xs={12}>
        <Card sx={{ width: '100%', height: '100%', marginTop: "60px" }}>
          <Box sx={{ mx: 3, height: 530 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={value} textColor='secondary' indicatorColor='secondary' onChange={handleChange}>
                <Tab label='Login' sx={{ textTransform: 'none', fontWeight: 'bold' }}></Tab>
                <Tab label='Registration' sx={{ textTransform: 'none', fontWeight: 'bold' }}></Tab>
              </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
              <UserLogin />
            </TabPanel>
            <TabPanel value={value} index={1}>
              <Registration />
            </TabPanel>
          </Box>
          <Box textAlign='center' sx={{ mt: 2 }}>
            <ShoppingBag sx={{ color: 'purple', fontSize: 100 }} />
            <Typography variant='h5' sx={{ fontWeight: 'bold' }}>Geek-Shop</Typography>
          </Box>
        </Card>
      </Grid>
    </Grid>
  </>;
};

export default LoginReg;
