import { apiClient } from './api';

export const userService = {
  getUsers: async (params = {}) => {
    const res = await apiClient.get('/users', { params });
    return res.data;
  },

  getUserById: async (userId) => {
    const res = await apiClient.get(`/users/${userId}`);
    return res.data;
  },

  createUser: async (userData) => {
    const res = await apiClient.post('/users', userData);
    return res.data;
  },

  updateUserStatus: async (userId, status) => {
    const res = await apiClient.patch(`/users/${userId}/status`, { status });
    return res.data;
  }
};
