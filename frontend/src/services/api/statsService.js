import axiosInstance from './axios';

const statsService = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    const response = await axiosInstance.get('/stats/dashboard');
    return response.data;
  },
};

export default statsService;