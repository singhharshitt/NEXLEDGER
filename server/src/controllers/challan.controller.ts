import type { Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import type { AuthenticatedRequest } from '../types/common';
import * as challansService from '../services/challans.service';
import { mapChallan } from '../utils/mappers';

export const listChallans = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await challansService.listChallans(req.query as Record<string, unknown>);
  res.status(200).json({
    success: true,
    data: {
      items: result.items.map((r) => mapChallan(r.challan, r.items)),
      pagination: result.pagination,
    },
  });
});

export const getChallan = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await challansService.getChallanById(req.params.id as string);
  res.status(200).json({ success: true, data: mapChallan(result.challan, result.items) });
});

export const createChallan = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { customerId, items, notes } = req.body as {
    customerId: string;
    items: { productId: string; quantity: number }[];
    notes?: string;
  };
  const result = await challansService.createChallan({ customerId, items, notes }, req.user!.userId);
  res.status(201).json({ success: true, data: mapChallan(result.challan, result.items) });
});

export const updateChallan = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { customerId, items, notes } = req.body as {
    customerId?: string;
    items?: { productId: string; quantity: number }[];
    notes?: string;
  };
  const result = await challansService.updateChallan(req.params.id as string, { customerId, items, notes });
  res.status(200).json({ success: true, data: mapChallan(result.challan, result.items) });
});

export const confirmChallan = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await challansService.confirmChallan(req.params.id as string, req.user!.userId);
  res.status(200).json({ success: true, data: mapChallan(result.challan, result.items) });
});

export const cancelChallan = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await challansService.cancelChallan(req.params.id as string, req.user!.userId);
  res.status(200).json({ success: true, data: mapChallan(result.challan, result.items) });
});

export const getRecentChallans = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const items = await challansService.getRecentChallans(5);
  res.status(200).json({
    success: true,
    data: items.map((r) => mapChallan(r.challan, r.items)),
  });
});
