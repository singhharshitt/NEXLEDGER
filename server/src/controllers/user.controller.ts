import type { Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import type { AuthenticatedRequest } from '../types/common';
import * as usersService from '../services/users.service';

/**
 * GET /api/users
 * Role: ADMIN only
 */
export const listUsers = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const users = await usersService.listUsers();
  res.status(200).json({ success: true, data: users });
});

/**
 * GET /api/users/:id
 * Role: ADMIN only
 */
export const getUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await usersService.getUserById(req.params.id as string);
  res.status(200).json({ success: true, data: user });
});

/**
 * POST /api/users
 * Role: ADMIN only
 * Validation is handled by the `validate` middleware in the route.
 */
export const createUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name, email, password, role } = req.body as {
    name: string;
    email: string;
    password: string;
    role: string;
  };
  const user = await usersService.createUser({ fullName: name, email, password, role });
  res.status(201).json({ success: true, data: user });
});

/**
 * PUT /api/users/:id
 * Role: ADMIN only
 * Validation is handled by the `validate` middleware in the route.
 */
export const updateUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name, email, role, isActive } = req.body as {
    name?: string;
    email?: string;
    role?: string;
    isActive?: boolean;
  };
  const user = await usersService.updateUser(req.params.id as string, {
    fullName: name,
    email,
    role,
    isActive,
  });
  res.status(200).json({ success: true, data: user });
});
