import jwt, { type SignOptions, type JwtPayload as BaseJwtPayload } from "jsonwebtoken";
import { env } from "../config/env";
import type { Role } from "../types/common";


export interface JwtPayload {
  userId: string;
  role: Role;
}


export function signToken(payload: JwtPayload): string {

  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as string, // "1d" | "7d" | "30d" etc.
  };

  return jwt.sign(payload, env.JWT_SECRET, options);
}


export function verifyToken(token: string): JwtPayload {

  const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

  // Extra safety check: ensure required fields exist (though the signature already guarantees the payload)
  if (!decoded.userId || !decoded.role) {
    throw new jwt.JsonWebTokenError("Token payload missing required claims");
  }

  return decoded;
}