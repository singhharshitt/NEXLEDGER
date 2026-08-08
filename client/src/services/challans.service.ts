import api from './api';
import type { Challan, CreateChallanInput, ChallanFilters, PaginatedResponse } from '@/types';

export const challansService = {
  getAll: async (filters?: ChallanFilters): Promise<PaginatedResponse<Challan>> => {
    const { data } = await api.get('/challans', { params: filters });
    return data;
  },

  getById: async (id: string): Promise<Challan> => {
    const { data } = await api.get(`/challans/${id}`);
    return data;
  },

  create: async (input: CreateChallanInput): Promise<Challan> => {
    const { data } = await api.post('/challans', input);
    return data;
  },

  confirm: async (id: string): Promise<Challan> => {
    const { data } = await api.post(`/challans/${id}/confirm`);
    return data;
  },

  cancel: async (id: string): Promise<Challan> => {
    const { data } = await api.post(`/challans/${id}/cancel`);
    return data;
  },
};
