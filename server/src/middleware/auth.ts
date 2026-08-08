import type { Response, NextFunction } from "express";
import { pool } from "../config/database";
import { unauthorized, forbidden } from "../utils/errors";
import { verifyToken } from "../utils/jwt";
import type { AuthenticatedRequest, Role } from "../types/common";

export async function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw unauthorized("Missing or invalid authorization token");
    }

    const token = header.slice(7);
    const payload = verifyToken(token);

    const { rows } = await pool.query(
      `SELECT id, name, email, role FROM users WHERE id = $1 AND is_active = TRUE`,
      [payload.userId]
    );

    if (rows.length === 0) {
      throw unauthorized("User not found or inactive");
    }

    req.user = {
      id: rows[0].id,
      name: rows[0].name,
      email: rows[0].email,
      role: rows[0].role as Role,
    };
    next();
  } catch (error) {
    if (error instanceof Error && error.name === "JsonWebTokenError") {
      next(unauthorized("Invalid token"));
      return;
    }
    if (error instanceof Error && error.name === "TokenExpiredError") {
      next(unauthorized("Token expired"));
      return;
    }
    next(error);
  }
}

export function authorize(...roles: Role[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(unauthorized());
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(forbidden("You do not have permission to perform this action"));
      return;
    }
    next();
  };
}
