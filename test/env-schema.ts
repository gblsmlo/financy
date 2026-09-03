import { z } from 'zod'

export const testEnvSchema = z
  .object({
    NODE_ENV: z.literal('test').default('test'),
    TZ: z.literal('UTC').default('UTC'),
  })
  .strict()

export type TestEnv = z.infer<typeof testEnvSchema>

export function createTestEnv(): TestEnv {
  return testEnvSchema.parse({
    NODE_ENV: 'test',
    TZ: 'UTC',
  })
}
