import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "";
const apiBaseURL = baseURL ? (baseURL.endsWith("/api") ? baseURL : `${baseURL}/api`) : "/api";

const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
});

export default api;
