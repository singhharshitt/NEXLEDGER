import axios from 'axios';
import { setupMockApi } from './mock-api';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexledger_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nexledger_token');
      localStorage.removeItem('nexledger_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Setup mock API interceptors (remove when real backend is ready)
setupMockApi(api);

export default api;
