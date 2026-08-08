// src/types/common.ts
// Re-exports all domain types from the canonical index.ts so that existing
// imports of '../types/common' continue to resolve without change.
export * from './index';

import type { Request } from 'express';
import type { Role } from './index';

// ---------------------------------------------------------------------------
// Internal / legacy types kept for backward-compatibility with existing code.
// New code should import directly from './index'.
// ---------------------------------------------------------------------------

/** Lower-case role string used in some client-facing response mappers. */
export type ClientRole = 'admin' | 'sales' | 'warehouse' | 'accounts';

/**
 * @deprecated No longer used — JWT payload only carries userId and role.
 * Kept here temporarily to avoid breaking any lingering import references.
 */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: Role;
  };
  requestId?: string;
}

/** Internal pagination helper used by repository query builders. */
export interface Pagination {
  page: number;
  pageSize: number;
  limit: number;
  offset: number;
}

// MovementType alias kept for any code that imports it by the old name.
// The canonical name in the design is StockMovementType (re-exported above).
export type { StockMovementType as MovementType } from './index';
