import axiosInstance from './axios';

const authService = {
  // Register new user
  register: async (data) => {
    const response = await axiosInstance.post('/auth/register', data);
    return response.data;
  },

  // Login user
  login: async (data) => {
    const response = await axiosInstance.post('/auth/login', data);
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
  },
};

export default authService;