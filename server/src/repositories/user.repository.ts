import bcrypt from "bcrypt";
import { pool } from "../config/database";
import { env } from "../config/env";
import type { Role } from "../types/common";
import { toDbRole } from "../utils/mappers";

export async function findUserByEmail(email: string) {
  const { rows } = await pool.query(
    `SELECT id, full_name, email, password_hash, role, is_active, created_at, updated_at
     FROM users WHERE LOWER(email) = LOWER($1)`,
    [email.trim()]
  );
  return rows[0] ?? null;
}

export async function findUserById(id: string) {
  const { rows } = await pool.query(
    `SELECT id, full_name, email, role, is_active, created_at, updated_at
     FROM users WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function listUsers() {
  const { rows } = await pool.query(
    `SELECT id, full_name, email, role, is_active, created_at, updated_at
     FROM users ORDER BY created_at DESC`
  );
  return rows;
}

export async function findUsersByRoles(roles: string[]) {
  if (roles.length === 0) return [];
  const { rows } = await pool.query(
    `SELECT id FROM users WHERE role = ANY($1) AND is_active = TRUE`,
    [roles]
  );
  return rows.map(r => r.id);
}

export async function createUser(data: {
  fullName: string;
  email: string;
  password: string;
  role: string;
}) {
  const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS);
  const role = toDbRole(data.role);
  const { rows } = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, role)
     VALUES ($1, LOWER($2), $3, $4)
     RETURNING id, full_name, email, role, is_active, created_at, updated_at`,
    [data.fullName, data.email.trim(), passwordHash, role]
  );
  return rows[0];
}

export async function updateUser(
  id: string,
  data: { fullName?: string; email?: string; role?: string; isActive?: boolean }
) {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.fullName !== undefined) {
    fields.push(`full_name = $${idx++}`);
    values.push(data.fullName);
  }
  if (data.email !== undefined) {
    fields.push(`email = LOWER($${idx++})`);
    values.push(data.email.trim());
  }
  if (data.role !== undefined) {
    fields.push(`role = $${idx++}`);
    values.push(toDbRole(data.role));
  }
  if (data.isActive !== undefined) {
    fields.push(`is_active = $${idx++}`);
    values.push(data.isActive);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const { rows } = await pool.query(
    `UPDATE users SET ${fields.join(", ")} WHERE id = $${idx}
     RETURNING id, full_name, email, role, is_active, created_at, updated_at`,
    values
  );
  return rows[0] ?? null;
}

export async function countActiveAdmins(excludeId?: string): Promise<number> {
  const params: unknown[] = ["ADMIN"];
  let sql = `SELECT COUNT(*)::int AS count FROM users WHERE role = $1 AND is_active = TRUE`;
  if (excludeId) {
    sql += ` AND id != $2`;
    params.push(excludeId);
  }
  const { rows } = await pool.query(sql, params);
  return rows[0].count;
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export type { Role };
