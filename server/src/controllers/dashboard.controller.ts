import type { Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import type { AuthenticatedRequest } from '../types/common';
import * as dashboardService from '../services/dashboard.service';
import { checkDatabase } from '../config/database';

/**
 * GET /api/dashboard/stats
 * Returns main KPIs (total customers, products, stock status, etc.)
 */
export const getStats = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const stats = await dashboardService.getStats();
  res.status(200).json({ success: true, data: stats });
});

/**
 * GET /api/dashboard/activity
 * Recent operational events (follow-ups, stock movements, etc.)
 */
export const getActivity = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const activity = await dashboardService.getActivity();
  res.status(200).json({ success: true, data: activity });
});

/**
 * GET /api/dashboard/stock-chart
 * Stock levels over the last 7 days (for chart widgets)
 */
export const getStockChart = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const chart = await dashboardService.getStockChart();
  res.status(200).json({ success: true, data: chart });
});

/**
 * GET /api/dashboard
 * Aggregated dashboard data for the overview page.
 */
export const getDashboard = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const data = await dashboardService.getFullDashboard();
  res.status(200).json({ success: true, data });
});

/**
 * GET /api/health
 * System health check with actual database connectivity test.
 */
export const healthCheck = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  await checkDatabase();
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    database: 'connected',
  });
});
