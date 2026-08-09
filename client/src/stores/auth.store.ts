import { create } from 'zustand';
import type { User } from '@/types';
import { authService } from '@/services/auth.service';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: authService.getStoredUser(),
  isAuthenticated: !!authService.getToken(),
  isLoading: true,

  login: async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    authService.setToken(response.token);
    authService.setUser(response.user);
    set({ user: response.user, isAuthenticated: true });
  },

  logout: () => {
    void authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  initialize: async () => {
    const token = authService.getToken();
    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }
    try {
      const user = await authService.getMe();
      authService.setUser(user);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      authService.logout();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
