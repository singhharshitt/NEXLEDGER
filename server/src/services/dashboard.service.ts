import * as dashboardRepo from '../repositories/dashboard.repository';
import * as challanRepo from '../repositories/challan.repository';
import { computeStockStatus } from '../utils/mappers';

export async function getStats() {
  return dashboardRepo.getDashboardStats();
}

export async function getActivity() {
  return dashboardRepo.getRecentActivity(10);
}

export async function getStockChart() {
  return dashboardRepo.getStockChartData(7);
}

export async function getFullDashboard() {
  const [stats, activity, recentChallans, lowStock] = await Promise.all([
    dashboardRepo.getDashboardStats(),
    dashboardRepo.getRecentActivity(10),
    challanRepo.getRecentChallansWithItems(5),
    dashboardRepo.getLowStockProducts(10),
  ]);

  return {
    stats,
    activity,
    recentChallans,
    lowStock: lowStock.map((p) => ({
      ...p,
      stockStatus: computeStockStatus(Number(p.current_stock), Number(p.minimum_stock)),
    })),
  };
}
