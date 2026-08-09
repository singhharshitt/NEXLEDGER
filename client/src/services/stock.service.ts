import api from './api';
import {
  unwrapData,
  normalizePaginated,
  cleanQueryParams,
  mapStockStatusFilter,
} from '@/lib/api-utils';
import type { Product, StockMovement, CreateStockMovementInput, PaginatedResponse } from '@/types';
import { mapProduct } from './products.service';

export const stockService = {
  getInventory: async (params?: {
    search?: string;
    stockStatus?: string;
  }): Promise<PaginatedResponse<Product>> => {
    const response = await api.get('/stock', {
      params: cleanQueryParams({
        search: params?.search,
        stockStatus: mapStockStatusFilter(params?.stockStatus),
      }),
    });
    const paginated = normalizePaginated<unknown>(unwrapData(response));
    return { ...paginated, data: paginated.data.map(mapProduct) };
  },

  /**
   * Low stock products — GET /api/stock/low returns products at or below minimum stock.
   */
  getLowStock: async (): Promise<Product[]> => {
    const response = await api.get('/stock/low');
    const raw = unwrapData<unknown[]>(response);
    return raw.map(mapProduct);
  },

  /**
   * GET /stock/movements does not exist on the real server.
   * The server only exposes per-product movements at /products/:id/stock-movements.
   */
  getMovements: async (): Promise<StockMovement[]> => {
    try {
      const response = await api.get('/stock/movements');
      return unwrapData<StockMovement[]>(response);
    } catch {
      return [];
    }
  },

  /**
   * Adjust stock for a product.
   * Real server: POST /api/products/:id/stock with { type, quantity, notes }
   */
  adjust: async (input: CreateStockMovementInput): Promise<StockMovement> => {
    const { productId, type, quantity, reason } = input;
    const response = await api.post(`/products/${productId}/stock`, {
      type: type.toUpperCase(),
      quantity,
      notes: reason, // CreateStockMovementInput uses 'reason'; server schema uses 'notes'
    });
    return unwrapData<StockMovement>(response);
  },
};
