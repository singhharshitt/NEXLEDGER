import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/errors";

/**
 * Catches requests to undefined routes and forwards a 404 error.
 * Returns: { success: false, message: "Route not found", errors: [] }
 */
export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, "Route not found"));
}

/**
 * Central Express error-handling middleware (4-argument signature required by Express).
 *
 * Cases handled:
 *  1. AppError            → use err.statusCode, err.message, err.errors
 *  2. ZodError            → HTTP 422 with field-level error array
 *  3. PostgreSQL 23505    → HTTP 409 (unique_violation)
 *  4. PostgreSQL 23503    → HTTP 404 (foreign_key_violation)
 *  5. Everything else:
 *       development → HTTP 500 with err.message + err.stack in errors[]
 *       production  → HTTP 500 without stack trace
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // 1. Known operational errors ─────────────────────────────────
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  // 2. Zod validation errors ─────────────────────────────────────
  if (err instanceof ZodError) {
    const errors = err.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    res.status(422).json({
      success: false,
      message: "Validation failed",
      errors,
    });
    return;
  }

  // 3 & 4. PostgreSQL driver errors ─────────────────────────────
  const pgErr = err as Error & { code?: string };
  if (pgErr.code === "23505") {
    // unique_violation
    res.status(409).json({
      success: false,
      message: "A record with this value already exists",
      errors: [],
    });
    return;
  }
  if (pgErr.code === "23503") {
    // foreign_key_violation
    res.status(404).json({
      success: false,
      message: "Referenced resource not found",
      errors: [],
    });
    return;
  }

  // 5. Unexpected / programming errors ──────────────────────────
  console.error("Unhandled error:", err);

  const isDevelopment = process.env.NODE_ENV !== "production";
  res.status(500).json({
    success: false,
    message: "Internal server error",
    errors: isDevelopment
      ? [{ message: err.message, stack: err.stack }]
      : [],
  });
}
