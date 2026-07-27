import { apiClient } from './api';

export const authService = {
  login: async (username, password) => {
    const res = await apiClient.post('/auth/login', { loginId: username, password });
    if (res.success && res.data && res.data.user) {
      return { success: true, user: res.data.user, token: res.data.accessToken };
    }
    throw new Error(res.message || 'Authentication failed');
  },

  logout: async () => {
    return apiClient.post('/auth/logout', {});
  },

  refreshToken: async (refreshToken) => {
    const res = await apiClient.post('/auth/refresh-token', { refreshToken });
    return res.data;
  },

  getCurrentUser: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  }
};
