import axios from "axios";
import { getBaseURL } from "./base";

const api = axios.create({
  baseURL: getBaseURL(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // ← MUST have Bearer prefix
  }
  return config;
});

export default api;