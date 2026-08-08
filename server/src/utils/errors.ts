/**
 * Base application error with HTTP status code and structured error list.
 * The global error handler serialises this into the standard API response:
 *   { success: false, message: string, errors: Array<{ field?: string; message: string }> }
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly message: string,
    public readonly errors: Array<{ field?: string; message: string }> = []
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// ── Convenience alias used by auth.controller.ts ───────────────
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(401, message);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

// ── 4xx Client Error factories ─────────────────────────────────

/** 400 – Bad Request */
export const badRequest = (
  message: string,
  errors: Array<{ field?: string; message: string }> = []
) => new AppError(400, message, errors);

/** 401 – Unauthorized (authentication required) */
export const unauthorized = (message = "Unauthorized") =>
  new AppError(401, message);

/** 403 – Forbidden (insufficient permissions) */
export const forbidden = (message = "Forbidden") =>
  new AppError(403, message);

/** 404 – Not Found */
export const notFound = (resource = "Resource") =>
  new AppError(404, `${resource} not found`);

/** 409 – Conflict (duplicate, state conflict) */
export const conflict = (
  message: string,
  errors: Array<{ field?: string; message: string }> = []
) => new AppError(409, message, errors);

/** 422 – Unprocessable Entity (validation errors) */
export const unprocessableEntity = (
  message = "Validation failed",
  errors: Array<{ field?: string; message: string }> = []
) => new AppError(422, message, errors);

/** 429 – Too Many Requests (rate limiting) */
export const tooManyRequests = (message = "Too many requests, please try again later") =>
  new AppError(429, message);

// ── 5xx Server Errors ──────────────────────────────────────────

/** 500 – Internal Server Error */
export const internal = (message = "Internal server error") =>
  new AppError(500, message);
