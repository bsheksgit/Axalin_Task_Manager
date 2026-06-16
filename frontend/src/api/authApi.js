import axiosInstance from "./axiosInstance";

export const authApi = {
  signup: async (data) => {
    const response = await axiosInstance.post("/auth/signup", data);
    return response.data;
  },

  login: async (data) => {
    const response = await axiosInstance.post("/auth/login", data);
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post("/auth/logout");
    return response.data;
  },

  getMe: async () => {
    const response = await axiosInstance.get("/auth/me");
    return response.data;
  },
};
