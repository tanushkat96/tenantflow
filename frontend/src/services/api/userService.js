import axiosInstance from './axios';

const userService = {
  // Get all users
  getAllUsers: async () => {
    const response = await axiosInstance.get('/users');
    return response.data;
  },

  // Invite user
  inviteUser: async (data) => {
    const response = await axiosInstance.post('/users/invite', data);
    return response.data;
  },

  // Update user role
  updateUserRole: async (userId, role) => {
    const response = await axiosInstance.patch(`/users/${userId}/role`, { role });
    return response.data;
  },

  // Remove user
  removeUser: async (userId) => {
    const response = await axiosInstance.delete(`/users/${userId}`);
    return response.data;
  },
};

export default userService;