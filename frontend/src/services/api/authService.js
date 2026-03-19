import axiosInstance from "./axios";

const authService = {
  // Register new user
  register: async (data) => {
    const response = await axiosInstance.post("/auth/register", data);
    return response.data;
  },

  // Login user
  login: async (data) => {
    const response = await axiosInstance.post("/auth/login", data);
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await axiosInstance.get("/auth/me");
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await axiosInstance.put("/auth/profile", data);
    return response.data;
  },

  changePassword: async (data) => {
    const response = await axiosInstance.put("/auth/change-password", data);
    return response.data;
  },
   // ✅ ADD THESE NEW METHODS
  uploadAvatar: async (formData) => {
    const response = await axiosInstance.post('/auth/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  removeAvatar: async () => {
    const response = await axiosInstance.delete('/auth/avatar');
    return response.data;
  },

  getOrganization: async () => {
    const response = await axiosInstance.get('/auth/organization');
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem('user');
  },
};

export default authService;
