import type { Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import type { AuthenticatedRequest } from "../types/common";
import * as userRepo from "../repositories/user.repository";
import { signToken } from "../utils/jwt";
import { unauthorized } from "../utils/errors";
import { mapUser } from "../utils/mappers";

export const login = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { email, password } = req.body;
  const user = await userRepo.findUserByEmail(email);

  if (!user || !user.is_active) {
    throw unauthorized("Invalid email or password");
  }

  const valid = await userRepo.verifyPassword(user.password_hash, password);
  if (!valid) {
    throw unauthorized("Invalid email or password");
  }

  const token = signToken({ userId: user.id, role: user.role });
  res.json({ token, user: mapUser(user) });
});

export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: mapUser(req.user!) });
});

export const logout = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, message: "Logged out successfully" });
});
