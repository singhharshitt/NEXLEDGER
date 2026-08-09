import axios from 'axios';
import { getApiErrorMessage } from '@/lib/api-utils';

const getBaseUrl = () => {
  const serverUrl = import.meta.env.SERVER_URL;
  if (!serverUrl) return '/api';
  // If SERVER_URL already ends with /api, use it as is
  if (serverUrl.endsWith('/api')) return serverUrl;
  // Otherwise append /api
  return `${serverUrl.replace(/\/$/, '')}/api`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexledger_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest) {
        localStorage.removeItem('nexledger_token');
        localStorage.removeItem('nexledger_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    error.message = getApiErrorMessage(error);
    return Promise.reject(error);
  }
);

export default api;
