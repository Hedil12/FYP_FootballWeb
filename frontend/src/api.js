//Create an interceptor to help take in request for all pages
import axios from "axios";
import { ACCESS_TOKEN } from "./constants";


const api = axios.create({
    baseURL: "http://127.0.0.1:5000/",
    withCredentials: true,
    headers: {
        'Content-Type': "multipart/form-data",
      },
});

const handle401Error = async (error) => {
    if (error.response?.status === 401) {
      // Try refreshing the token
      await refreshToken();
      // Retry the original request with the new token
      return api.request(error.config);
    }
    return Promise.reject(error);
  };

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        console.log(config.headers);
        return config
    },
    async (error) => handle401Error(error)
)

export default api