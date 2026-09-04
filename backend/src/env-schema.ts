import { z } from 'zod'

export const serverEnvSchema = z
  .object({
    CORS_ORIGIN: z.url().default('http://localhost:5173'),
    DATABASE_URL: z.string().min(1),
    JWT_SECRET: z.string().min(1),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65_535).default(3333),
  })
  .strict()

export type ServerEnv = z.infer<typeof serverEnvSchema>

export function createServerEnv(runtimeEnv: Record<string, unknown> = process.env): ServerEnv {
  return serverEnvSchema.parse({
    CORS_ORIGIN: runtimeEnv.CORS_ORIGIN,
    DATABASE_URL: runtimeEnv.DATABASE_URL,
    JWT_SECRET: runtimeEnv.JWT_SECRET,
    NODE_ENV: runtimeEnv.NODE_ENV,
    PORT: runtimeEnv.PORT,
  })
}
