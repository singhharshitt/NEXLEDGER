import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(1),
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_ROUNDS: z.coerce.number().int().min(8).max(14).default(10),
}).superRefine((val, ctx) => {
  if (val.NODE_ENV === 'production' && val.JWT_SECRET.length < 32) {
    ctx.addIssue({
      code: 'custom',
      message: 'JWT_SECRET must be at least 32 characters in production',
    });
  }
});

let env: z.infer<typeof EnvSchema>;

try {
  env = EnvSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Environment validation failed:');
    error.issues.forEach((e) => {
      console.error(`  - ${e.path.join('.')}: ${e.message}`);
    });
  } else {
    console.error('❌ Environment validation failed:', error);
  }
  process.exit(1);
}

export { env };
export type Env = z.infer<typeof EnvSchema>;

export const getAllowedOrigins = (): string[] => {
  const origins = new Set<string>();
  
  if (env.CORS_ORIGIN) {
    env.CORS_ORIGIN.split(",").forEach(o => origins.add(o.trim()));
  }
  
  if (process.env.CLIENT_URL) {
    const url = process.env.CLIENT_URL.trim();
    if (!url.startsWith('http')) {
      origins.add(`https://${url}`);
      origins.add(`http://${url}`);
    } else {
      origins.add(url);
    }
  }
  
  return Array.from(origins);
};
