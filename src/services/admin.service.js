import { apiClient } from './api';

export const adminService = {
  getDashboardStats: async () => {
    const res = await apiClient.get('/admin/dashboard');
    return res.data;
  },

  createAssessment: async (testData) => {
    const res = await apiClient.post('/assessments', testData);
    return res.data;
  },

  createQuestion: async (questionData) => {
    const res = await apiClient.post('/questions', questionData);
    return res.data;
  },

  getAuditLogs: async () => {
    const res = await apiClient.get('/audit-logs');
    return res.data;
  }
};
