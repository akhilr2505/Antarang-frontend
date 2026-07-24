import { apiClient } from './api';

export const assessmentService = {
  getAssessments: async (studentId = 'usr_student_001') => {
    const res = await apiClient.get(`/students/${studentId}/assessments`);
    return res.data;
  },

  startAssessment: async (assessmentId, studentId = 'usr_student_001') => {
    const res = await apiClient.post(`/assessments/${assessmentId}/start`, { studentId });
    return res.data;
  },

  submitAssessment: async (attemptId, responses) => {
    const res = await apiClient.post(`/attempts/${attemptId}/submit`, { responses });
    return res.data;
  },

  getStudentScores: async (studentId = 'usr_student_001') => {
    const res = await apiClient.get(`/students/${studentId}/scores`);
    return res.data;
  },

  getRecommendations: async (studentId = 'usr_student_001') => {
    const res = await apiClient.get(`/students/${studentId}/recommendations`);
    return res.data;
  }
};
