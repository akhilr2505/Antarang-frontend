import { mockClient } from './api/mockClient';

export const API_BASE_URL = '/api/v1';

export const apiClient = {
  get: (endpoint, config) => mockClient.get(`${API_BASE_URL}${endpoint}`, config),
  post: (endpoint, data, config) => mockClient.post(`${API_BASE_URL}${endpoint}`, data, config),
  put: (endpoint, data, config) => mockClient.put(`${API_BASE_URL}${endpoint}`, data, config),
  patch: (endpoint, data, config) => mockClient.patch(`${API_BASE_URL}${endpoint}`, data, config),
  delete: (endpoint, config) => mockClient.delete(`${API_BASE_URL}${endpoint}`, config)
};
