import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { bearer } from 'better-auth/plugins'

import { env } from './env'
import { prisma } from './prisma'

export const auth = betterAuth({
  baseURL: `http://localhost:${env.PORT}`,
  database: prismaAdapter(prisma, { provider: 'sqlite' }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [bearer()],
  secret: env.JWT_SECRET,
  trustedOrigins: [env.CORS_ORIGIN],
})
