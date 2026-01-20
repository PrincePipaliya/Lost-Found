
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api"
});

// Attach JWT token automatically to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
