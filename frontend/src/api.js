//Create an interceptor to help take in request for all pages
import axios from "axios";
import { ACCESS_TOKEN } from "./constants";


const api = axios.create({
    baseURL: "http://127.0.0.1:5000/"
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        console.log(config.headers);
        return config
    },
    (error) => {
        return Promise.reject(error);
    }
)

export default api