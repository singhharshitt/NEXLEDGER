import type { Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import type { AuthenticatedRequest } from "../types/common";
import * as userRepo from "../repositories/user.repository";
import { signToken } from "../utils/jwt";
import { UnauthorizedError } from "../utils/errors"; // custom error class
import { mapUser } from "../utils/mappers";
import { z } from "zod";

// --- Validation schemas (can be moved to validators/auth.validator.ts) ---
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// --- Controller ---

/**
 * Authenticates a user and returns a JWT token.
 * Body is expected to be validated by middleware before reaching here,
 * but we also apply a final Zod check as a safety net.
 */
export const login = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // Validate body (defensive, in case middleware is missing)
  const { email, password } = loginSchema.parse(req.body);

  const user = await userRepo.findUserByEmail(email);

  // Use constant-time comparison friendly message – never reveal if email exists
  if (!user || !user.is_active) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const valid = await userRepo.verifyPassword(user.password_hash, password);
  if (!valid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  // All good – generate token
  const token = signToken({ userId: user.id, role: user.role });

  // Standard response format
  res.status(200).json({
    success: true,
    data: {
      token,
      user: mapUser(user),
    },
  });
});

/**
 * Returns the currently authenticated user's data.
 * Requires authentication middleware to run first.
 */
export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // req.user is guaranteed by the auth middleware
  const user = await userRepo.findUserById(req.user!.userId);

  if (!user || !user.is_active) {
    // Edge case: user deleted/deactivated after token issued
    throw new UnauthorizedError("User no longer active");
  }

  res.status(200).json({
    success: true,
    data: {
      user: mapUser(user),
    },
  });
});

/**
 * Logs out the user (stateless JWT – client must discard token).
 * No server-side token invalidation needed.
 */
export const logout = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});