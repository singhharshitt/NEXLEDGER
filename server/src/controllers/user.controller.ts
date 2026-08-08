import type { Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import type { AuthenticatedRequest } from "../types/common";
import * as userRepo from "../repositories/user.repository";
import { conflict, notFound } from "../utils/errors";
import { mapUser } from "../utils/mappers";
import { z } from "zod";

// ─── Validation Schemas ─────────────────────────────────────────
const userCreateSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"]),
});

const userUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  role: z.enum(["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"]).optional(),
  is_active: z.boolean().optional(), // deactivation toggle
});

// ─── Controllers ────────────────────────────────────────────────

/**
 * GET /api/users
 * Role: ADMIN only
 */
export const listUsers = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const users = await userRepo.listUsers();

  res.status(200).json({
    success: true,
    data: users.map(mapUser),
  });
});

/**
 * GET /api/users/:id
 * Role: ADMIN only
 */
export const getUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await userRepo.findUserById(req.params.id);
  if (!user) throw notFound("User not found");

  res.status(200).json({
    success: true,
    data: mapUser(user),
  });
});

/**
 * POST /api/users
 * Role: ADMIN only
 */
export const createUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const payload = userCreateSchema.parse(req.body);

  const existing = await userRepo.findUserByEmail(payload.email);
  if (existing) throw conflict("A user with this email already exists");

  const user = await userRepo.createUser(payload);

  res.status(201).json({
    success: true,
    data: mapUser(user),
  });
});

/**
 * PUT /api/users/:id
 * Role: ADMIN only
 * Prevents removal of last active admin.
 */
export const updateUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const payload = userUpdateSchema.parse(req.body);
  const { id } = req.params;

  const existing = await userRepo.findUserById(id);
  if (!existing) throw notFound("User not found");

  // Prevent removing the last admin (role change or deactivation)
  if (
    (payload.role && payload.role !== "ADMIN" && existing.role === "ADMIN") ||
    (payload.is_active === false && existing.role === "ADMIN")
  ) {
    const adminCount = await userRepo.countActiveAdmins(id);
    if (adminCount === 0) {
      throw conflict("Cannot remove or deactivate the only active admin");
    }
  }

  const user = await userRepo.updateUser(id, payload);

  res.status(200).json({
    success: true,
    data: mapUser(user),
  });
});