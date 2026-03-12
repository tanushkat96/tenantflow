import axiosInstance from './axios';

const taskService = {
  // Get all tasks
  getAllTasks: async (params) => {
    const response = await axiosInstance.get('/tasks', { params });
    return response.data;
  },

  // Get single task
  getTask: async (id) => {
    const response = await axiosInstance.get(`/tasks/${id}`);
    return response.data;
  },

  // Create task
  createTask: async (data) => {
    const response = await axiosInstance.post('/tasks', data);
    return response.data;
  },

  // Update task
  updateTask: async (id, data) => {
    const response = await axiosInstance.put(`/tasks/${id}`, data);
    return response.data;
  },

   // Update task status (for drag-and-drop)
  updateTaskStatus: async (id, status) => {
    const response = await axiosInstance.patch(`/tasks/${id}/status`, { status });
    return response.data;
  },

  // Delete task
  deleteTask: async (id) => {
    const response = await axiosInstance.delete(`/tasks/${id}`);
    return response.data;
  },
};

export default taskService;