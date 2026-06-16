import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't trigger redirect for the auth/me endpoint - it's expected to 401 when not logged in
      const isAuthMeEndpoint = error.config?.url?.includes("/auth/me");
      if (!isAuthMeEndpoint) {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
