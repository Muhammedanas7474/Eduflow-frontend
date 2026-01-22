import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;
const apiBaseURL = baseURL.endsWith("/api") ? baseURL : `${baseURL}/api`;

const api = axios.create({
  baseURL: apiBaseURL,
});

export default api;
