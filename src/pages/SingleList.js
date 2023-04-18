import { Box, CircularProgress } from '@mui/material';
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'
import { emptyCompanyObject } from '../features/companySlice';
import {  setLoadingCompanies, setSelectedCompanyId, setSingleList } from '../features/listSlice';
import instance from '../services/fetchApi';
import { getToken } from '../services/LocalStorageService';
import Company from './Company';

const SingleList = () => {
  const {id} = useParams()
  const dispatch = useDispatch()
  const {loadingCompanies} = useSelector((state) => state.list)
  const token = getToken()
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [token])

  useEffect(() => {
    dispatch(setLoadingCompanies({value: true}))
    const getList = async () => {
      await instance.get(`mylists/${id}`)
      .then((res) => {
        if (res.data.list.companies.length) {
          dispatch(setSelectedCompanyId({id: res.data.list.companies[0].id}))
        } else {
          dispatch(emptyCompanyObject())
        }
        dispatch(setSingleList({list: res.data.list}))
        dispatch(setLoadingCompanies({value: false}))
      })
      .catch(()=> {
        dispatch(setSingleList({list: undefined}))
        dispatch(setLoadingCompanies({value: false}))
      })
    }


    getList()
  }, [])

  return ( 
    <>
      {
        loadingCompanies ? (
          <Box sx={{ display: 'flex', marginLeft: "50%" }}>
            <CircularProgress />
          </Box>
        ) : (
          <Company />
        )
      }
     
    </>
  )
}

export default SingleList