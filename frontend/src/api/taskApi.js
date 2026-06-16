import axiosInstance from "./axiosInstance";

export const taskApi = {
  getTasks: async () => {
    const response = await axiosInstance.get("/tasks/");
    return response.data;
  },

  getTask: async (id) => {
    const response = await axiosInstance.get(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (data) => {
    const response = await axiosInstance.post("/tasks/", data);
    return response.data;
  },

  updateTask: async (id, data) => {
    const response = await axiosInstance.put(`/tasks/${id}`, data);
    return response.data;
  },

  deleteTask: async (id) => {
    const response = await axiosInstance.delete(`/tasks/${id}`);
    return response.data;
  },

  addDependency: async (taskId, dependsOnTaskId) => {
    const response = await axiosInstance.post(`/tasks/${taskId}/dependencies`, {
      depends_on_task_id: dependsOnTaskId,
    });
    return response.data;
  },

  removeDependency: async (taskId, dependencyId) => {
    const response = await axiosInstance.delete(
      `/tasks/${taskId}/dependencies/${dependencyId}`,
    );
    return response.data;
  },

  getAllDependencies: async () => {
    const response = await axiosInstance.get("/tasks/dependencies/all");
    return response.data;
  },
};
