import api from './api';
import { unwrapData } from '@/lib/api-utils';
import type { User } from '@/types';

// The backend creates an empty password requirement (or a default one depending on the route logic).
// Let's assume the CreateUserInput has name, email, password, role.
export interface CreateUserInput {
  name: string;
  email: string;
  password?: string;
  role: string;
}

export const usersService = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return unwrapData<User[]>(response);
  },

  create: async (input: CreateUserInput): Promise<User> => {
    const response = await api.post('/users', input);
    return unwrapData<User>(response);
  },
};
