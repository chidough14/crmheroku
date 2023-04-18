import React, { useEffect, useState } from 'react'
import {LoadScript, GoogleMap } from '@react-google-maps/api'
import { Button, Card, CardActions, CardContent, Typography } from '@mui/material';
import Geocode from "react-geocode";
import axios from 'axios';

const containerStyle = {
  width: '600px',
  height: '300px',
  margin: "auto"
};

const center = {
  lat: -3.745,
  lng: -38.523
};


// Geocode.setApiKey("AIzaSyBJwct4cQyPLSk7CMXJ-NgEi7hj_mxlLh4");
// Geocode.setLanguage("en");
// Geocode.setRegion("es");
// Geocode.setLocationType("ROOFTOP");
// Geocode.enableDebug();


const Map = () => {
  const [center, setCenter] = useState()

  // Geocode.fromAddress("Diamantvagen 20, Skovde").then(
  //   (response) => {
  //     const { lat, lng } = response.results[0].geometry.location;
  //     console.log(lat, lng);
  //     setCenter({
  //       lat, lng
  //     })
  //   },
  //   (error) => {
  //     console.error(error);
  //   }
  // );

  // const getAddress = async () => {
  //   const address = "Diamantvagen 20, Skovde";
  //   await axios.get(`https://nominatim.openstreetmap.org/search?q=${address}&format=json`)
  //       .then(response => {
  //           const lat = response.data[0].lat;
  //           const lng = response.data[0].lon;
  //           console.log(`Latitude: ${lat}, Longitude: ${lng}`);
  //           setCenter({
  //             lat, lng
  //           })
  //       });
  // }

  // useEffect(() => {
  //   getAddress()
  // }, [])



 
  return (
    <Card sx={{ minWidth: 275 }}>
      {/* <LoadScript
        googleMapsApiKey="AIzaSyBJwct4cQyPLSk7CMXJ-NgEi7hj_mxlLh4"
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={10}
        >
        
          <></>
        </GoogleMap>
      </LoadScript> */}
      <div>MAP</div>

      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          Word of the Day
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          adjective
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small">Learn More</Button>
      </CardActions>
    </Card>
  )
}

export default Map