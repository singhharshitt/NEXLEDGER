import type { Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import type { AuthenticatedRequest } from "../types/common";
import * as challanRepo from "../repositories/challan.repository";
import { notFound } from "../utils/errors";
import { mapChallan } from "../utils/mappers";
import { paginatedResponse } from "../utils/pagination";

export const listChallans = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await challanRepo.listChallans(req.query as Record<string, unknown>);
  const items = await Promise.all(
    result.rows.map(async (row) => {
      const challanItems = await challanRepo.getChallanItems(row.id);
      return mapChallan(row, challanItems);
    })
  );
  res.json(paginatedResponse(items, result.total, result.page, result.limit));
});

export const getChallan = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = await challanRepo.findChallanWithItems(req.params.id);
  if (!data) throw notFound("Challan");
  res.json(mapChallan(data.challan, data.items));
});

export const createChallan = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = await challanRepo.createChallan(req.body, req.user!.id);
  if (!data) throw notFound("Challan");
  res.status(201).json(mapChallan(data.challan, data.items));
});

export const updateChallan = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = await challanRepo.updateChallan(req.params.id, req.body);
  if (!data) throw notFound("Challan");
  res.json(mapChallan(data.challan, data.items));
});

export const confirmChallan = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = await challanRepo.confirmChallan(req.params.id, req.user!.id);
  if (!data) throw notFound("Challan");
  res.json(mapChallan(data.challan, data.items));
});

export const cancelChallan = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = await challanRepo.cancelChallan(req.params.id, req.user!.id);
  if (!data) throw notFound("Challan");
  res.json(mapChallan(data.challan, data.items));
});

export const getRecentChallans = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const rows = await challanRepo.getRecentChallans(5);
  const items = await Promise.all(
    rows.map(async (row) => {
      const challanItems = await challanRepo.getChallanItems(row.id);
      return mapChallan(row, challanItems);
    })
  );
  res.json(items);
});
