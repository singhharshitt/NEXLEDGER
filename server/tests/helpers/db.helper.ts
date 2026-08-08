import { pool } from '../../src/config/database';
import bcrypt from 'bcrypt';
import type { Role } from '../../src/types/common';

/** Truncate all tables in reverse FK dependency order for test isolation */
export async function cleanDatabase(): Promise<void> {
  await pool.query(`
    TRUNCATE TABLE
      challan_items,
      challans,
      challan_sequences,
      stock_movements,
      customer_followups,
      customers,
      products,
      users
    RESTART IDENTITY CASCADE
  `);
}

/** Insert a minimal user for auth tests. Returns the user row. */
export async function seedTestUser(role: Role = 'ADMIN', overrides: Partial<{
  email: string;
  full_name: string;
  password: string;
}> = {}): Promise<{ id: string; email: string; role: Role }> {
  const email = overrides.email ?? `${role.toLowerCase()}@test.example.com`;
  const full_name = overrides.full_name ?? `Test ${role}`;
  const password = overrides.password ?? 'TestPass@1234';
  const passwordHash = await bcrypt.hash(password, 8);

  const { rows } = await pool.query(
    `INSERT INTO users (email, full_name, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, role`,
    [email, full_name, passwordHash, role]
  );
  return { ...rows[0], password };
}
