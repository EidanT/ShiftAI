import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SECRET_KEY: z.string().min(1).optional(),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  process.stderr.write('\n[ENV] Variables de entorno inválidas:\n');
  process.stderr.write(JSON.stringify(result.error.flatten().fieldErrors, null, 2));
  process.stderr.write('\n\n');
  process.exit(1);
}

export const env = result.data;
