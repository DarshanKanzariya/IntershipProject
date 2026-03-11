import axios from "axios";

const API = axios.create({ baseURL: process.env.REACT_APP_BASEURL });

API.interceptors.request.use((req) => {
  if (sessionStorage.getItem("token")) {
    req.headers.Authorization = `Bearer ${sessionStorage.getItem("token")} `;
  }
  return req;
});

export default API;
