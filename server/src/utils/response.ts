import type { Response } from 'express';

/** Single-resource success response: { success: true, data } */
export function sendSuccess<T>(res: Response, data: T, status = 200): void {
  res.status(status).json({ success: true, data });
}

/** Paginated list success response: { success: true, data: { items, pagination } } */
export function sendPaginated<T>(
  res: Response,
  items: T[],
  pagination: { page: number; limit: number; total: number; totalPages: number }
): void {
  res.status(200).json({ success: true, data: { items, pagination } });
}

/** Error response: { success: false, message, errors } */
export function sendError(
  res: Response,
  message: string,
  errors: Array<{ field?: string; message: string }> = [],
  status = 400
): void {
  res.status(status).json({ success: false, message, errors });
}
