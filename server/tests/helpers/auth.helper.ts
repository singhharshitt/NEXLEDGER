import jwt from 'jsonwebtoken';
import type { Role } from '../../src/types/common';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-testing-only-32chars';

export function generateToken(role: Role, userId = 'test-user-id-00000000-0000-0000-0000-000000000001'): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '1h' });
}

export function getAuthHeader(role: Role): { Authorization: string } {
  return { Authorization: `Bearer ${generateToken(role)}` };
}
