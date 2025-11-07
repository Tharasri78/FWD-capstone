import axios from "axios";
import { getBaseURL } from "./base";

const api = axios.create({
  baseURL: getBaseURL(), // e.g. http://localhost:5000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = token; // backend reads from "authorization"
  return config;
});

export default api;
