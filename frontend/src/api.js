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
// Schedule API calls
export const fetchSchedules = async () => {
  const response = await axios.get(`${BASE_URL}/events/`);
  return response.data;
};

export const createSchedule = async (scheduleData) => {
  const response = await axios.post(`${BASE_URL}/events/create/`, scheduleData);
  return response.data;
};

export const updateSchedule = async (scheduleId, scheduleData) => {
  const response = await axios.put(`${BASE_URL}/events/edit/${scheduleId}/`, scheduleData);
  return response.data;
};

export const deleteSchedule = async (scheduleId) => {
  const response = await axios.delete(`${BASE_URL}/events/delete/${scheduleId}/`);
  return response.data;
};

export default api