import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  DATABASE_URL: z.string().url("DATABASE_URL must be a PostgreSQL connection string"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("1d"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
});

const result = schema.safeParse(process.env);

if (!result.success) {
  const message = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
  throw new Error(`Environment validation failed: ${message}`);
}

export const env = result.data;
