import api from './api';
import { unwrapData, normalizePaginated } from '@/lib/api-utils';
import type { DashboardStats, DashboardActivity, StockChartData, Challan, Product } from '@/types';
import { mapChallan } from './challans.service';
import { mapProduct } from './products.service';

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return unwrapData<DashboardStats>(response);
  },

  getActivity: async (): Promise<DashboardActivity[]> => {
    const response = await api.get('/dashboard/activity');
    return unwrapData<DashboardActivity[]>(response);
  },

  getStockChart: async (): Promise<StockChartData[]> => {
    const response = await api.get('/dashboard/stock-chart');
    return unwrapData<StockChartData[]>(response);
  },

  /**
   * Recent challans — GET /api/challans?limit=5 (no dedicated dashboard endpoint).
   */
  getRecentChallans: async (): Promise<Challan[]> => {
    const response = await api.get('/challans', {
      params: { limit: 5, sortBy: 'created_at', sortOrder: 'desc' },
    });
    const paginated = normalizePaginated<unknown>(unwrapData(response));
    return paginated.data.map(mapChallan);
  },

  /**
   * Low stock products — GET /api/stock/low.
   */
  getLowStock: async (): Promise<Product[]> => {
    const response = await api.get('/stock/low');
    const raw = unwrapData<unknown[]>(response);
    return raw.map(mapProduct);
  },
};
