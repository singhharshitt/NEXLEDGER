import type { Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import type { AuthenticatedRequest } from "../types/common";
import * as dashboardRepo from "../repositories/dashboard.repository";
import * as challanController from "./challan.controller";
import { mapProduct } from "../utils/mappers";
import { checkDatabase } from "../config/database";

export const getStats = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const stats = await dashboardRepo.getDashboardStats();
  res.json(stats);
});

export const getActivity = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const activity = await dashboardRepo.getRecentActivity(10);
  res.json(activity);
});

export const getStockChart = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const chart = await dashboardRepo.getStockChartData(7);
  res.json(chart);
});

export const getRecentChallans = challanController.getRecentChallans;

export const getLowStock = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const products = await dashboardRepo.getLowStockProducts(10);
  res.json(products.map(mapProduct));
});

export const getDashboard = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const [stats, activity, recentChallans, lowStock] = await Promise.all([
    dashboardRepo.getDashboardStats(),
    dashboardRepo.getRecentActivity(10),
    dashboardRepo.getRecentChallans(5),
    dashboardRepo.getLowStockProducts(10),
  ]);

  res.json({
    success: true,
    data: {
      stats,
      activity,
      recentChallans,
      lowStock: lowStock.map(mapProduct),
    },
  });
});

export const healthCheck = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  await checkDatabase();
  res.json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString(),
    database: "connected",
  });
});
