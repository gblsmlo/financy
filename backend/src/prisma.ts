import { PrismaLibSql } from '@prisma/adapter-libsql'

import { env } from './env'
import { PrismaClient } from './generated/prisma/client'

export const prisma = new PrismaClient({
  adapter: new PrismaLibSql({ url: env.DATABASE_URL }),
})
