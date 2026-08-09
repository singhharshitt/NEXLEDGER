import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardService.getStats,
  });
}

export function useDashboardActivity() {
  return useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: dashboardService.getActivity,
  });
}

export function useStockChart() {
  return useQuery({
    queryKey: ['dashboard', 'stock-chart'],
    queryFn: dashboardService.getStockChart,
  });
}

export function useRecentChallans(enabled = true) {
  return useQuery({
    queryKey: ['dashboard', 'recent-challans'],
    queryFn: dashboardService.getRecentChallans,
    enabled,
  });
}

export function useLowStock(enabled = true) {
  return useQuery({
    queryKey: ['dashboard', 'low-stock'],
    queryFn: dashboardService.getLowStock,
    enabled,
  });
}
