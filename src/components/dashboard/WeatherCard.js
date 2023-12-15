import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux'
import { RefreshOutlined } from '@mui/icons-material';

const WeatherCard = ({weatherDetails, fetchWeatherUpdate}) => {
  const navigate = useNavigate()
  const { setting, connectionError, weatherLoading } = useSelector(state => state.user)

  return (
    <div style={{width: "50%"}}>
       <Card sx={{ minWidth: 275 }}>

        {
          connectionError ? (
            <>
              <CardContent>
                <Typography variant='h7' style={{color: "red"}}>
                  Error encountered while fetching weather update!!
                </Typography>
              </CardContent>

              <CardActions>
                <div style={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                  <RefreshOutlined 
                    style={{cursor: "pointer"}}
                    onClick={() => {
                      fetchWeatherUpdate()
                    }}
                  />
                </div>
              </CardActions>
            </>
          ) : weatherLoading ? (
            <CardContent>
              <Typography variant='h7'>
              Loading.....
              </Typography>
            </CardContent>
          ) : (
            <>
              <CardContent>
                <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
                  <nav aria-label="main mailbox folders">
                    <Typography variant='h6'>
                      Todays Weather
                    </Typography>
    
                    <div style={{display: "flex", justifyContent: "space-between"}}>
                      <div>
                          <Typography variant='h4'>
                            { setting?.temperature_mode === "celcius" ? Math.round(weatherDetails?.current.temp_c) : Math.round(weatherDetails?.current.temp_f) } 
                            
                            { setting?.temperature_mode === "celcius" ? "C" : "F" }
                          </Typography>
                          <Typography variant='h4'>
                            { weatherDetails?.current.condition.text } 
                          </Typography>
                      </div>
    
                      <div>
                        <img src={ weatherDetails?.current.condition.icon} alt="icon" />
                      </div>
                    </div>
                  </nav>
                </Box>
              </CardContent>
              <CardActions>
                <div style={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                  <Button 
                    size="small"
                    onClick={() => {
                      navigate(`/weather`)
                    }}
                  >
                    View weather
                  </Button>
    
                  <RefreshOutlined 
                    style={{cursor: "pointer"}}
                    onClick={() => {
                      fetchWeatherUpdate()
                    }}
                  />
    
                  <Typography variant='h7'>
                    Last Updated: { moment(weatherDetails?.current.last_updated).format("DD-MMM-YYYY, h:mm a")}
                  </Typography>
                </div>
              </CardActions>
            </>
          )
        }
      </Card>
    </div>
  )
}

export default WeatherCard