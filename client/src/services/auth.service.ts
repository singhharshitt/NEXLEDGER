import api from './api';
import type { LoginCredentials, AuthResponse, User } from '@/types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get('/auth/me');
    return data.user;
  },

  logout: () => {
    localStorage.removeItem('nexledger_token');
    localStorage.removeItem('nexledger_user');
  },

  getToken: (): string | null => {
    return localStorage.getItem('nexledger_token');
  },

  setToken: (token: string) => {
    localStorage.setItem('nexledger_token', token);
  },

  setUser: (user: User) => {
    localStorage.setItem('nexledger_user', JSON.stringify(user));
  },

  getStoredUser: (): User | null => {
    const stored = localStorage.getItem('nexledger_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  },
};
