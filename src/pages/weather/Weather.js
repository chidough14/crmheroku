import {  useSelector } from 'react-redux';
import React from 'react'
import { Box, Card, CardContent, Divider, Typography } from '@mui/material';
import moment from 'moment';
import { RefreshOutlined } from '@mui/icons-material';

const Weather = ({fetchWeatherUpdate}) => {
  const { weatherDetails, setting, weatherLoading, connectionError } = useSelector(state => state.user)

  const renderMinMaxTemp = (weatherDetails) => {
    if (setting?.temperature_mode === "celcius") {
      return `${Math.round(weatherDetails?.day.mintemp_c)}/${Math.round(weatherDetails?.day.maxtemp_c)} C`
    } else {
      return  `${Math.round(weatherDetails?.day.mintemp_f)}/${Math.round(weatherDetails?.day.maxtemp_f)} F`
    }
  }

  const renderDailyForecast = (forecast) => {
    const currentTime = new Date(); 

    const filteredArray = forecast.filter(obj => {
      const objTime = new Date(obj.time);
      return objTime >= currentTime;
    })
 
    return filteredArray.map((a) => (
      <div>
        <Typography variant='h6'>
        { moment(a.time).format("H:mm") }
        </Typography>

        <img src={ a.condition.icon} alt="icon" />

        <Typography variant='h6'style={{marginLeft: "14px"}}>
        { setting?.temperature_mode === "celcius" ? `${Math.round(a.temp_c)} C` : `${Math.round(a.temp_f)} F` } 
        </Typography>
      </div>
    ))
  }

  const renderWeeklyForecast = (forecast) => {
    const newArray = forecast.slice(1);

    return newArray.map((a) => (
      <>
        <div style={{display: "flex", justifyContent: "space-between", marginBottom: "16px", marginTop: "10px"}}>
          <Typography variant='h6'>
          { moment(a.date).format("dddd") }
          </Typography>

          <img src={ a.day.condition.icon} alt="icon" />

          <Typography variant='h6'style={{marginLeft: "14px"}}>
            {
              renderMinMaxTemp(a)
            }
          </Typography>
        </div>
        <Divider></Divider>
      </>
    ))
    
  }

  return (
    <>
      <div>
        <Card sx={{ minWidth: 275, width: "100%" }}>
          <CardContent>
            <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
              <div style={{display: "flex", justifyContent: "space-between"}}>
                <div>
                <Typography variant='h4'>
                    { setting?.temperature_mode === "celcius" ? Math.round(weatherDetails?.current.temp_c) : Math.round(weatherDetails?.current.temp_f) } 
                    
                    { setting?.temperature_mode === "celcius" ? "C" : "F" }
                  </Typography>
                  <Typography variant='h5'>
                    { weatherDetails?.current.condition.text } 
                  </Typography>

                  <img src={ weatherDetails?.current.condition.icon} alt="icon" style={{marginBottom: "-12px"}} />
                  <span style={{fontSize: "18px"}}>
                    { renderMinMaxTemp(weatherDetails.forecast.forecastday[0]) }
                  </span>
             
                </div>

                <div>
                  <Typography variant='h6'>
                    Humidity: { weatherDetails?.current.humidity } %
                  </Typography>

                  <Typography variant='h6'>
                    Feels Like: { setting?.temperature_mode === "celcius" ? `${Math.round(weatherDetails?.current.feelslike_c)} C` : `${Math.round(weatherDetails?.current.feelslike_f)} F` }
                  </Typography>

                  <Typography variant='h6'>
                    Wind speed: { weatherDetails?.current.wind_kph } Kph
                  </Typography>
                </div>

                <div>
                  <Typography variant='h5'>
                    { weatherDetails?.location.name }  { weatherDetails?.location.region }
                  </Typography>

                  <Typography variant='h4'>
                    { weatherDetails?.location.country }
                  </Typography>
                </div>
              </div>

              <div style={{display: "flex"}}>
                {
                  renderDailyForecast(weatherDetails?.forecast.forecastday[0].hour)
                }
              </div>

              <div style={{display: "flex", float: "right"}}>
                {
                  weatherLoading ? (
                    <Typography variant='h7'>
                      Loading....
                    </Typography>
                  ) : connectionError ? (
                    <Typography variant='h7' style={{color: "red"}}>
                      Error encountered while fetching weather update!!
                    </Typography>
                  ) : (
                    <Typography variant='h7'>
                      Last Updated: { moment(weatherDetails?.current.last_updated).format("DD-MMM-YYYY, h:mm a")}
                    </Typography>
                  )
                }

                <RefreshOutlined 
                  style={{cursor: "pointer"}} 
                  onClick={() => fetchWeatherUpdate()}
                />
              </div>
             
            </Box>
          </CardContent>
        </Card>

        <div style={{marginTop: "20px"}}>
          <Typography variant='h5'>Weekly Forecast</Typography>

          {
            renderWeeklyForecast(weatherDetails?.forecast.forecastday)
          }
        </div>
      </div>

      <div></div>
    </>
  )
}

export default Weather