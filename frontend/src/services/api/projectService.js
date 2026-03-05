import axiosInstance from './axios';

const projectService = {
  // Get all projects
  getAllProjects: async () => {
    const response = await axiosInstance.get('/projects');
    return response.data;
  },

  // Get single project
  getProject: async (id) => {
    const response = await axiosInstance.get(`/projects/${id}`);
    return response.data;
  },

  // Create project
  createProject: async (data) => {
    const response = await axiosInstance.post('/projects', data);
    return response.data;
  },

  // Update project
  updateProject: async (id, data) => {
    const response = await axiosInstance.put(`/projects/${id}`, data);
    return response.data;
  },

  // Delete project
  deleteProject: async (id) => {
    const response = await axiosInstance.delete(`/projects/${id}`);
    return response.data;
  },
};

export default projectService;