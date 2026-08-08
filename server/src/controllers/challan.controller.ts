import type { Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import type { AuthenticatedRequest } from "../types/common";
import * as challanRepo from "../repositories/challan.repository";
import { notFound, conflict } from "../utils/errors";
import { mapChallan } from "../utils/mappers";
import { paginatedResponse } from "../utils/pagination";
import { z } from "zod";

// --- Zod schemas for request validation ---
const challanItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().positive(),
});

const createChallanSchema = z.object({
  customer_id: z.string().uuid(),
  items: z.array(challanItemSchema).min(1),
});

const updateChallanSchema = z.object({
  customer_id: z.string().uuid().optional(),
  items: z.array(challanItemSchema).optional(),
}).refine(data => data.customer_id || data.items, {
  message: "At least one field must be provided for update",
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
  status: z.enum(["DRAFT", "CONFIRMED", "CANCELLED"]).optional(),
  customer_id: z.string().uuid().optional(),
  sort_by: z.enum(["created_at", "challan_number", "status"]).optional().default("created_at"),
  sort_order: z.enum(["asc", "desc"]).optional().default("desc"),
});

// --- Controller methods ---

/**
 * GET /api/challans
 * Role: ADMIN, SALES, ACCOUNTS
 */
export const listChallans = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const query = listQuerySchema.parse(req.query);
  const result = await challanRepo.listChallansWithItems(query); // avoids N+1

  res.status(200).json({
    success: true,
    data: {
      items: result.items.map(mapChallan),
      pagination: result.pagination,
    },
  });
});

/**
 * GET /api/challans/:id
 * Role: ADMIN, SALES, ACCOUNTS
 */
export const getChallan = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const challan = await challanRepo.findChallanWithItems(req.params.id);
  if (!challan) throw notFound("Challan not found");

  res.status(200).json({
    success: true,
    data: mapChallan(challan.challan, challan.items),
  });
});

/**
 * POST /api/challans
 * Role: ADMIN, SALES
 */
export const createChallan = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const payload = createChallanSchema.parse(req.body);
  const data = await challanRepo.createChallan(payload, req.user!.userId);

  res.status(201).json({
    success: true,
    data: mapChallan(data.challan, data.items),
  });
});

/**
 * PUT /api/challans/:id
 * Only editable when status = DRAFT.
 * Role: ADMIN, SALES
 */
export const updateChallan = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const payload = updateChallanSchema.parse(req.body);
  const data = await challanRepo.updateChallan(req.params.id, payload);

  res.status(200).json({
    success: true,
    data: mapChallan(data.challan, data.items),
  });
});

/**
 * POST /api/challans/:id/confirm
 * Performs transactional stock deduction.
 * Role: ADMIN, SALES
 */
export const confirmChallan = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = await challanRepo.confirmChallan(req.params.id, req.user!.userId);
  // If the repo throws on conflict (stock, state), the global error handler will catch it.
  // We only reach here if confirmation succeeded.
  res.status(200).json({
    success: true,
    data: mapChallan(data.challan, data.items),
  });
});

/**
 * POST /api/challans/:id/cancel
 * DRAFT → CANCELLED (no stock impact)
 * CONFIRMED → CANCELLED (stock restored) if implemented.
 * Role: ADMIN, SALES
 */
export const cancelChallan = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = await challanRepo.cancelChallan(req.params.id, req.user!.userId);
  res.status(200).json({
    success: true,
    data: mapChallan(data.challan, data.items),
  });
});

/**
 * GET /api/challans/recent
 * Returns last 5 challans for dashboard.
 * Role: appropriate roles
 */
export const getRecentChallans = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const items = await challanRepo.getRecentChallansWithItems(5); // avoids N+1
  res.status(200).json({
    success: true,
    data: items.map(mapChallan),
  });
});