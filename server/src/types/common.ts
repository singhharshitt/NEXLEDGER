import type { Request } from "express";

export type Role = "ADMIN" | "SALES" | "WAREHOUSE" | "ACCOUNTS";
export type ClientRole = "admin" | "sales" | "warehouse" | "accounts";
export type CustomerType = "RETAIL" | "WHOLESALE" | "DISTRIBUTOR";
export type CustomerStatus = "LEAD" | "ACTIVE" | "INACTIVE";
export type MovementType = "IN" | "OUT";
export type ChallanStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  requestId?: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  limit: number;
  offset: number;
}
