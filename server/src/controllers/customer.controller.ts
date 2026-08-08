import type { Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import type { AuthenticatedRequest } from "../types/common";
import * as customerRepo from "../repositories/customer.repository";
import { notFound } from "../utils/errors";
import { mapCustomer, mapFollowUp } from "../utils/mappers";
import { paginatedResponse } from "../utils/pagination";
import { z } from "zod";

// ─── Validation Schemas ────────────────────────────────────────
const customerListSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
  status: z.enum(["LEAD", "ACTIVE", "INACTIVE"]).optional(),
  customer_type: z.enum(["RETAIL", "WHOLESALE", "DISTRIBUTOR"]).optional(),
  sort_by: z
    .enum(["customer_name", "created_at", "updated_at", "follow_up_date"])
    .optional()
    .default("created_at"),
  sort_order: z.enum(["asc", "desc"]).optional().default("desc"),
});

const customerCreateSchema = z.object({
  customer_name: z.string().min(1).max(200),
  mobile: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  business_name: z.string().optional(),
  gst_number: z.string().optional(),
  customer_type: z.enum(["RETAIL", "WHOLESALE", "DISTRIBUTOR"]),
  address: z.string().optional(),
  status: z.enum(["LEAD", "ACTIVE", "INACTIVE"]).optional().default("LEAD"),
  follow_up_date: z.string().datetime().optional(),
  notes: z.string().optional(),
});

const customerUpdateSchema = customerCreateSchema.partial();

const followUpCreateSchema = z.object({
  follow_up_date: z.string().datetime(),
  note: z.string().min(1),
});

// ─── Controllers ───────────────────────────────────────────────

/**
 * GET /api/customers
 * Role: ADMIN, SALES, ACCOUNTS
 */
export const listCustomers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const query = customerListSchema.parse(req.query);
  const result = await customerRepo.listCustomers(query);

  res.status(200).json({
    success: true,
    data: {
      items: result.rows.map(mapCustomer),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    },
  });
});

/**
 * GET /api/customers/:id
 * Role: ADMIN, SALES, ACCOUNTS
 */
export const getCustomer = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const customer = await customerRepo.findCustomerById(req.params.id);
  if (!customer) throw notFound("Customer not found");

  res.status(200).json({
    success: true,
    data: mapCustomer(customer),
  });
});

/**
 * POST /api/customers
 * Role: ADMIN, SALES
 */
export const createCustomer = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const payload = customerCreateSchema.parse(req.body);
  const customer = await customerRepo.createCustomer(payload);

  res.status(201).json({
    success: true,
    data: mapCustomer(customer),
  });
});

/**
 * PUT /api/customers/:id
 * Role: ADMIN, SALES
 */
export const updateCustomer = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const payload = customerUpdateSchema.parse(req.body);
  const customer = await customerRepo.updateCustomer(req.params.id, payload);
  if (!customer) throw notFound("Customer not found");

  res.status(200).json({
    success: true,
    data: mapCustomer(customer),
  });
});

/**
 * DELETE /api/customers/:id (soft delete)
 * Role: ADMIN (or specific rules)
 */
export const deleteCustomer = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const customer = await customerRepo.softDeleteCustomer(req.params.id);
  if (!customer) throw notFound("Customer not found");

  res.status(200).json({
    success: true,
    data: mapCustomer(customer),
  });
});

/**
 * GET /api/customers/:id/followups
 * Role: ADMIN, SALES
 */
export const listFollowUps = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // Verify customer exists first
  const customer = await customerRepo.findCustomerById(req.params.id);
  if (!customer) throw notFound("Customer not found");

  const followUps = await customerRepo.listFollowUps(req.params.id);

  res.status(200).json({
    success: true,
    data: followUps.map(mapFollowUp),
  });
});

/**
 * POST /api/customers/:id/followups
 * Role: ADMIN, SALES
 */
export const createFollowUp = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // Verify customer exists
  const customer = await customerRepo.findCustomerById(req.params.id);
  if (!customer) throw notFound("Customer not found");

  const payload = followUpCreateSchema.parse(req.body);
  const followUp = await customerRepo.createFollowUp(
    req.params.id,
    payload,
    req.user!.userId // must come from token, not body
  );

  res.status(201).json({
    success: true,
    data: mapFollowUp(followUp),
  });
});