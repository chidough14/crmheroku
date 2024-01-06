import React from 'react'
import { useLocation, useParams } from 'react-router'
import { useDispatch, useSelector } from "react-redux";
import { Typography } from '@mui/material';

const MyLabel = () => {
  const { labels } = useSelector(state => state.user)
  const params = useParams()
  return (
    <div>
      <Typography variant='h5'>{labels?.find((a) => a.id === parseInt(params?.id)).name}</Typography>
    </div>
  )
}

export default MyLabel