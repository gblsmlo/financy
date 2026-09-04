import { z } from 'zod'

export const testEnvSchema = z
  .object({
    DATABASE_URL: z.string().default('file:./test.db'),
    JWT_SECRET: z.string().default('test-secret'),
    NODE_ENV: z.literal('test').default('test'),
    TZ: z.literal('UTC').default('UTC'),
  })
  .strict()

export type TestEnv = z.infer<typeof testEnvSchema>

export function createTestEnv(): TestEnv {
  return testEnvSchema.parse({
    DATABASE_URL: 'file:./test.db',
    JWT_SECRET: 'test-secret',
    NODE_ENV: 'test',
    TZ: 'UTC',
  })
}
