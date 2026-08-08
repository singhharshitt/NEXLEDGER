import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { AppError } from "../utils/errors";

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(
        new AppError(
          422,
          "Validation failed",
          "VALIDATION_ERROR",
          result.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }))
        )
      );
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(
        new AppError(
          422,
          "Validation failed",
          "VALIDATION_ERROR",
          result.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }))
        )
      );
      return;
    }
    req.query = result.data as typeof req.query;
    next();
  };
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      next(
        new AppError(
          422,
          "Validation failed",
          "VALIDATION_ERROR",
          result.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }))
        )
      );
      return;
    }
    req.params = result.data as typeof req.params;
    next();
  };
}
