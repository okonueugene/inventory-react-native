import axios from "axios";

const ApiManager = axios.create({
  baseURL: "https://test.tokenlessreport.optitech.co.ke/api/v1/",
  headers: {
    "Content-Type": "application/json"
  },
  responseType: "json",
  withCredentials: true
});

export default ApiManager;
