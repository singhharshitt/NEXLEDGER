import { Pool } from "pg";
import { env } from "./env";

const isLocalDatabase =
  env.DATABASE_URL.includes("localhost") ||
  env.DATABASE_URL.includes("127.0.0.1") ||
  env.DATABASE_URL.includes("host.docker.internal");

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: isLocalDatabase ? false : { rejectUnauthorized: false },
});

export async function checkDatabase(): Promise<void> {
  await pool.query("SELECT 1");
}

export async function closeDatabase(): Promise<void> {
  await pool.end();
}
