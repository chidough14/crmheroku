import axios from "axios"; 
import { useSelector } from "react-redux";
import { getToken } from './LocalStorageService';

const instance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
});

instance.CancelToken = axios.CancelToken;
instance.isCancel = axios.isCancel;

instance.interceptors.request.use(
  async config => {

    //const token = store.getState()
    let token =  getToken('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  err => Promise.reject(err),
);

instance.interceptors.response.use(
  config => config,
  err => {
    if (err.response.status === 401) {
      // store.dispatch();
    }
    return Promise.reject(err);
  },
);

export default instance;
