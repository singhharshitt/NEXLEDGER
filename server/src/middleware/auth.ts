import type { Response, NextFunction } from "express";
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
    const payload = verifyToken(token); // returns { userId, role }

    req.user = {
      userId: payload.userId,
      role: payload.role,
    };

    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "JsonWebTokenError") {
        return next(unauthorized("Invalid token"));
      }
      if (error.name === "TokenExpiredError") {
        return next(unauthorized("Token expired"));
      }
    }
    next(error);
  }
}


export function authorize(...roles: Role[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(unauthorized("Authentication required"));
    }

    if (!roles.includes(req.user.role)) {
      return next(forbidden("You do not have permission to perform this action"));
    }

    next();
  };
}