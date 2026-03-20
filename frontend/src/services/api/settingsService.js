import axiosInstance from './axios';

const settingsService = {
  // Organization
  getOrganization: async () => {
    const response = await axiosInstance.get('/settings/organization');
    return response.data;
  },

  updateOrganization: async (data) => {
    const response = await axiosInstance.put('/settings/organization', data);
    return response.data;
  },

  deleteOrganization: async () => {
    const response = await axiosInstance.delete('/settings/organization');
    return response.data;
  },

  // Notifications
  getNotificationSettings: async () => {
    const response = await axiosInstance.get('/settings/notifications');
    return response.data;
  },

  updateNotificationSettings: async (data) => {
    const response = await axiosInstance.put('/settings/notifications', data);
    return response.data;
  },
};

export default settingsService;