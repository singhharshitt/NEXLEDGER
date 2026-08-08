import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";

declare global {
  namespace Express {
    interface Request {
      validatedBody?: unknown;
      validatedQuery?: unknown;
      validatedParams?: unknown;
    }
  }
}

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req.body);
      req.body = data;
      req.validatedBody = data;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req.query);
      req.validatedQuery = data;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req.params);
      req.validatedParams = data;
      next();
    } catch (error) {
      next(error);
    }
  };
}