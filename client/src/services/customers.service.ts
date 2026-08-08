import api from './api';
import type { Customer, CustomerFollowUp, CreateCustomerInput, CustomerFilters, PaginatedResponse } from '@/types';

export const customersService = {
  getAll: async (filters?: CustomerFilters): Promise<PaginatedResponse<Customer>> => {
    const { data } = await api.get('/customers', { params: filters });
    return data;
  },

  getById: async (id: string): Promise<Customer> => {
    const { data } = await api.get(`/customers/${id}`);
    return data;
  },

  create: async (input: CreateCustomerInput): Promise<Customer> => {
    const { data } = await api.post('/customers', input);
    return data;
  },

  update: async (id: string, input: Partial<CreateCustomerInput>): Promise<Customer> => {
    const { data } = await api.put(`/customers/${id}`, input);
    return data;
  },

  getFollowUps: async (customerId: string): Promise<CustomerFollowUp[]> => {
    const { data } = await api.get(`/customers/${customerId}/followups`);
    return data;
  },

  addFollowUp: async (customerId: string, input: { date: string; notes: string }): Promise<CustomerFollowUp> => {
    const { data } = await api.post(`/customers/${customerId}/followups`, input);
    return data;
  },
};
