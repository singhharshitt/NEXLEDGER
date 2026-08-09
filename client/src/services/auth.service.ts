import api from './api';
import { unwrapData } from '@/lib/api-utils';
import type { LoginCredentials, AuthResponse, User, ServerUser } from '@/types';

// Normalize server's SafeUser shape to the client's User model.
function toClientUser(serverUser: ServerUser): User {
  return {
    id: serverUser.id,
    name: serverUser.full_name,
    email: serverUser.email,
    role: serverUser.role,
    createdAt: serverUser.created_at,
  };
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    // Server returns: { success: true, data: { token, user } }
    // where user is SafeUser (with full_name, is_active, etc.)
    const data = unwrapData<{ token: string; user: ServerUser }>(response);
    return {
      token: data.token,
      user: toClientUser(data.user),
    };
  },

  getMe: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    // Server returns: { success: true, data: { user: SafeUser } }
    const data = unwrapData<{ user: ServerUser }>(response);
    return toClientUser(data.user);
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Stateless JWT — clearing local storage is sufficient.
    } finally {
      localStorage.removeItem('nexledger_token');
      localStorage.removeItem('nexledger_user');
    }
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
        return JSON.parse(stored) as User;
      } catch {
        return null;
      }
    }
    return null;
  },
};
