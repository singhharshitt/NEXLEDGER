import api from './api';
import type { Product, CreateProductInput, ProductFilters, PaginatedResponse, StockMovement } from '@/types';

export const productsService = {
  getAll: async (filters?: ProductFilters): Promise<PaginatedResponse<Product>> => {
    const { data } = await api.get('/products', { params: filters });
    return data;
  },

  getById: async (id: string): Promise<Product> => {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },

  create: async (input: CreateProductInput): Promise<Product> => {
    const { data } = await api.post('/products', input);
    return data;
  },

  update: async (id: string, input: Partial<CreateProductInput>): Promise<Product> => {
    const { data } = await api.put(`/products/${id}`, input);
    return data;
  },

  getStockMovements: async (productId: string): Promise<StockMovement[]> => {
    const { data } = await api.get(`/products/${productId}/stock-movements`);
    return data;
  },

  getCategories: async (): Promise<string[]> => {
    const { data } = await api.get('/products/categories');
    return data;
  },
};
