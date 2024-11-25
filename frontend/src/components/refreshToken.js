import axios from "axios";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";

const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);
    if (!refreshToken) {
        throw new Error("No refresh token available");
    }

    try {
        const response = await axios.post("http://127.0.0.1:5000/api/token/refresh/", {
            refresh: refreshToken,
        });
        localStorage.setItem(ACCESS_TOKEN, response.data.access);
        return response.data.access;
    } catch (error) {
        console.error("Error refreshing token:", error);
        throw error;
    }
};

export default refreshAccessToken;