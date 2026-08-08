import type { Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import type { AuthenticatedRequest } from "../types/common";
import * as dashboardRepo from "../repositories/dashboard.repository";
import * as challanRepo from "../repositories/challan.repository";   // direct repo use, no controller coupling
import { mapProduct } from "../utils/mappers";
import { checkDatabase } from "../config/database";

/**
 * GET /api/dashboard/stats
 * Returns main KPIs (total customers, products, stock status, etc.)
 */
export const getStats = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const stats = await dashboardRepo.getDashboardStats();
  res.status(200).json({
    success: true,
    data: stats,
  });
});

/**
 * GET /api/dashboard/activity
 * Recent operational events (follow-ups, stock movements, etc.)
 */
export const getActivity = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const activity = await dashboardRepo.getRecentActivity(10);
  res.status(200).json({
    success: true,
    data: activity,
  });
});

/**
 * GET /api/dashboard/stock-chart
 * Stock levels over the last N days (for chart widgets)
 */
export const getStockChart = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const chart = await dashboardRepo.getStockChartData(7);
  res.status(200).json({
    success: true,
    data: chart,
  });
});

/**
 * GET /api/dashboard/recent-challans
 * Last 5 challans for the dashboard widget.
 * Delegates directly to the challan repository to avoid circular imports.
 */
export const getRecentChallans = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const recentChallans = await challanRepo.getRecentChallansWithItems(5); // returns items included
  res.status(200).json({
    success: true,
    data: recentChallans,   // mapped already or will be mapped if needed
  });
});

/**
 * GET /api/dashboard/low-stock
 * Top N products below minimum stock threshold.
 */
export const getLowStock = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const products = await dashboardRepo.getLowStockProducts(10);
  res.status(200).json({
    success: true,
    data: products.map(mapProduct),
  });
});

/**
 * GET /api/dashboard
 * Aggregated dashboard data for the overview page.
 */
export const getDashboard = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const [stats, activity, recentChallans, lowStock] = await Promise.all([
    dashboardRepo.getDashboardStats(),
    dashboardRepo.getRecentActivity(10),
    challanRepo.getRecentChallansWithItems(5),    // using the same method as above for consistency
    dashboardRepo.getLowStockProducts(10),
  ]);

  res.status(200).json({
    success: true,
    data: {
      stats,
      activity,
      recentChallans,
      lowStock: lowStock.map(mapProduct),
    },
  });
});

/**
 * GET /api/health
 * System health check with actual database connectivity test.
 */
export const healthCheck = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  await checkDatabase();
  res.status(200).json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString(),
    database: "connected",
  });
});