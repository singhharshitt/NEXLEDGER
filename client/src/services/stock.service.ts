import api from './api';
import type { Product, StockMovement, CreateStockMovementInput, PaginatedResponse } from '@/types';

export const stockService = {
  getInventory: async (params?: { search?: string; stockStatus?: string }): Promise<PaginatedResponse<Product>> => {
    const { data } = await api.get('/stock', { params });
    return data;
  },

  getMovements: async (): Promise<StockMovement[]> => {
    const { data } = await api.get('/stock/movements');
    return data;
  },

  adjust: async (input: CreateStockMovementInput): Promise<StockMovement> => {
    const { data } = await api.post('/stock/adjust', input);
    return data;
  },
};
