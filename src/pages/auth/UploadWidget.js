import { EditOutlined, UploadFileOutlined } from '@mui/icons-material'
import { Button } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'

const UploadWidget = ({setImageUrl, imageUrl, setImageLoaded}) => {
  const cloudinaryRef = useRef()
  const widgetRef = useRef()
  //const [imageUrl, setImageUrl] = useState("")

  // const uploadImage = () => {
  //   console.log(imageUrl);
  // }

  useEffect(() => {
    cloudinaryRef.current = window.cloudinary
    widgetRef.current = cloudinaryRef.current?.createUploadWidget({
      cloudName:'dhqx47dut',
      uploadPreset: 'crmclient',
      maxImageHeight: '30px',
      maxImageWidth: '30px'
    }, (error, result) => {
      if (result.event === "success") {
        setImageUrl(result.info.secure_url)
        setImageLoaded(true)
      }
     
    })
  }, [])

  return (
    <div>
       {/* <Button variant="contained" size='small' onClick={() => widgetRef.current.open()} style={{borderRadius: "30px"}}>
        <UploadFileOutlined onClick={() => widgetRef.current.open()}/>
      </Button> */}
      <EditOutlined style={{cursor: "pointer"}} onClick={() => widgetRef.current.open()}/>
    </div>
  )
}

export default UploadWidget