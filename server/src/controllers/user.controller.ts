import type { Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import type { AuthenticatedRequest } from "../types/common";
import * as userRepo from "../repositories/user.repository";
import { conflict, notFound } from "../utils/errors";
import { mapUser } from "../utils/mappers";
import { paginatedResponse } from "../utils/pagination";

export const listUsers = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const users = await userRepo.listUsers();
  res.json({ success: true, data: users.map(mapUser) });
});

export const createUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const existing = await userRepo.findUserByEmail(req.body.email);
  if (existing) throw conflict("Email already registered");

  const user = await userRepo.createUser(req.body);
  res.status(201).json({ success: true, data: mapUser(user) });
});

export const updateUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const existing = await userRepo.findUserById(id);
  if (!existing) throw notFound("User");

  if (req.body.role && req.body.role.toUpperCase() !== "ADMIN" && existing.role === "ADMIN") {
    const adminCount = await userRepo.countActiveAdmins(id);
    if (adminCount === 0) throw conflict("Cannot remove the only active admin");
  }

  if (req.body.isActive === false && existing.role === "ADMIN") {
    const adminCount = await userRepo.countActiveAdmins(id);
    if (adminCount === 0) throw conflict("Cannot deactivate the only active admin");
  }

  const user = await userRepo.updateUser(id, req.body);
  res.json({ success: true, data: mapUser(user) });
});

export const getUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await userRepo.findUserById(req.params.id);
  if (!user) throw notFound("User");
  res.json({ success: true, data: mapUser(user) });
});
