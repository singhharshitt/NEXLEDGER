import * as userRepo from '../repositories/user.repository';
import { conflict, notFound } from '../utils/errors';
import type { SafeUser, Role } from '../types/index';

function toSafeUser(row: Record<string, unknown>): SafeUser {
  return {
    id: row.id as string,
    email: row.email as string,
    full_name: row.full_name as string,
    role: row.role as Role,
    is_active: row.is_active as boolean,
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at as string,
    updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at as string,
  };
}

export async function listUsers(): Promise<SafeUser[]> {
  const rows = await userRepo.listUsers();
  return rows.map(toSafeUser);
}

export async function getUserById(id: string): Promise<SafeUser> {
  const user = await userRepo.findUserById(id);
  if (!user) throw notFound('User');
  return toSafeUser(user);
}

export async function createUser(data: {
  fullName: string;
  email: string;
  password: string;
  role: string;
}): Promise<SafeUser> {
  const existing = await userRepo.findUserByEmail(data.email);
  if (existing) throw conflict('A user with this email already exists');
  const user = await userRepo.createUser(data);
  return toSafeUser(user);
}

export async function updateUser(
  id: string,
  data: { fullName?: string; email?: string; role?: string; isActive?: boolean }
): Promise<SafeUser> {
  const existing = await userRepo.findUserById(id);
  if (!existing) throw notFound('User');

  // Prevent removing the last active admin
  if (
    (data.role && data.role !== 'ADMIN' && existing.role === 'ADMIN') ||
    (data.isActive === false && existing.role === 'ADMIN')
  ) {
    const adminCount = await userRepo.countActiveAdmins(id);
    if (adminCount === 0) {
      throw conflict('Cannot remove or deactivate the only active admin');
    }
  }

  const user = await userRepo.updateUser(id, data);
  if (!user) throw notFound('User');
  return toSafeUser(user);
}
