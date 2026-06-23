import axios from "axios";
import { store } from "../store";
import { setGlobalError } from "../store/errorSlice";

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
    } else if (error.response?.status >= 500) {
      // Server errors (500+) show the error page
      const message =
        error.response?.data?.detail || "An unexpected server error occurred.";
      store.dispatch(
        setGlobalError({
          code: "500",
          message: Array.isArray(message)
            ? message[0]?.msg || message.join(", ")
            : message,
        }),
      );
    } else if (error.response?.status === 422) {
      // Validation errors (422) show the error page
      const detail = error.response?.data?.detail;
      let message = "Validation error. Please check your input.";
      if (Array.isArray(detail)) {
        message = detail
          .map((err) => `${err.loc?.slice(1).join(".") || "field"}: ${err.msg}`)
          .join("; ");
      } else if (typeof detail === "string") {
        message = detail;
      }
      store.dispatch(
        setGlobalError({
          code: "422",
          message,
        }),
      );
    } else if (!error.response) {
      // Network errors (no response)
      store.dispatch(
        setGlobalError({
          code: "generic",
          message: "Network error. Please check your connection and try again.",
        }),
      );
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
