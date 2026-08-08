import type { Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import type { AuthenticatedRequest } from '../types/common';
import * as authService from '../services/auth.service';

/**
 * Authenticates a user and returns a JWT token.
 * Input validation is handled by the validate middleware on the route.
 */
export const login = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const result = await authService.login(email, password);
  res.status(200).json({ success: true, data: result });
});

/**
 * Returns the currently authenticated user's data.
 * Requires authentication middleware to run first.
 */
export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await authService.getMe(req.user!.userId);
  res.status(200).json({ success: true, data: { user } });
});

/**
 * Logs out the user (stateless JWT — client must discard token).
 * No server-side token invalidation needed.
 */
export const logout = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});
