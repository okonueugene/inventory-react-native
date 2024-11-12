import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const ApiManager = axios.create({
  baseURL: "https://test.tokenlessreport.optitech.co.ke/api/v1/",
  headers: {
    "Content-Type": "multipart/form-data",
    "Accept": "application/json",
    "Access-Control-Allow-Origin": "*",
    Authorization: `Bearer ${AsyncStorage.getItem('token')}`,

  },
  responseType: "json",
  withCredentials: true
});

export default ApiManager;
