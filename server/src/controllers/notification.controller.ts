import type { Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import type { AuthenticatedRequest } from '../types/common';
import * as notificationService from '../services/notification.service';
import { parsePagination } from '../utils/pagination';

export const getNotifications = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { limit, offset } = parsePagination(req.query);
  const notifications = await notificationService.getNotifications(req.user!.userId, limit, offset);
  res.status(200).json({ success: true, data: notifications });
});

export const getUnreadCount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const count = await notificationService.getUnreadCount(req.user!.userId);
  res.status(200).json({ success: true, data: { count } });
});

export const markAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const notification = await notificationService.markAsRead(req.params.id as string, req.user!.userId);
  res.status(200).json({ success: true, data: notification });
});

export const markAllAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await notificationService.markAllAsRead(req.user!.userId);
  res.status(200).json({ success: true });
});

export const getUserSettings = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const settings = await notificationService.getUserSettings(req.user!.userId);
  res.status(200).json({ success: true, data: settings });
});

export const updateUserSettings = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const settings = await notificationService.updateUserSettings(req.user!.userId, req.body as Record<string, boolean>);
  res.status(200).json({ success: true, data: settings });
});
