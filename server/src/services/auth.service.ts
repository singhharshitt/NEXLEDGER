import * as userRepo from '../repositories/user.repository';
import { signToken } from '../utils/jwt';
import { unauthorized } from '../utils/errors';
import type { SafeUser } from '../types/index';

function toSafeUser(user: {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: Date | string;
  updated_at: Date | string;
  password_hash?: string;
}): SafeUser {
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role as SafeUser['role'],
    is_active: user.is_active,
    created_at: user.created_at instanceof Date ? user.created_at.toISOString() : user.created_at,
    updated_at: user.updated_at instanceof Date ? user.updated_at.toISOString() : user.updated_at,
  };
}

export async function login(
  email: string,
  password: string
): Promise<{ token: string; user: SafeUser }> {
  const user = await userRepo.findUserByEmail(email);

  // Never reveal whether the email or password was wrong
  if (!user || !user.is_active) {
    throw unauthorized('Invalid email or password');
  }

  const valid = await userRepo.verifyPassword(user.password_hash, password);
  if (!valid) {
    throw unauthorized('Invalid email or password');
  }

  const token = signToken({ userId: user.id, role: user.role });

  return {
    token,
    user: toSafeUser(user),
  };
}

export async function getMe(userId: string): Promise<SafeUser> {
  const user = await userRepo.findUserById(userId);

  if (!user || !user.is_active) {
    throw unauthorized('User no longer active');
  }

  return toSafeUser(user);
}
