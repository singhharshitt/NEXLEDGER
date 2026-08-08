import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, "Route not found", "NOT_FOUND"));
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.details ?? [],
    });
    return;
  }

  console.error("Unhandled error:", err.message);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    errors: [],
  });
}
