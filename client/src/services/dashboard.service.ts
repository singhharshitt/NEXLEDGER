import api from './api';
import type { DashboardStats, DashboardActivity, StockChartData, Challan, Product } from '@/types';

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get('/dashboard/stats');
    return data;
  },

  getActivity: async (): Promise<DashboardActivity[]> => {
    const { data } = await api.get('/dashboard/activity');
    return data;
  },

  getStockChart: async (): Promise<StockChartData[]> => {
    const { data } = await api.get('/dashboard/stock-chart');
    return data;
  },

  getRecentChallans: async (): Promise<Challan[]> => {
    const { data } = await api.get('/dashboard/recent-challans');
    return data;
  },

  getLowStock: async (): Promise<Product[]> => {
    const { data } = await api.get('/dashboard/low-stock');
    return data;
  },
};
