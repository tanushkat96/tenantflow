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

  // Add member to project
  addMember: async (projectId, userId, role) => {
    const response = await axiosInstance.post(`/projects/${projectId}/members`, {
      userId,
      role
    });
    return response.data;
  },

  // Remove member from project
  removeMember: async (projectId, memberId) => {
    const response = await axiosInstance.delete(`/projects/${projectId}/members/${memberId}`);
    return response.data;
  },
};

export default projectService;