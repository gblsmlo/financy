import { GraphQLError } from 'graphql'

import { Prisma } from '../generated/prisma/client'

type KnownErrorMessages = {
  uniqueConstraint?: string
  foreignKey?: string
}

/** Rethrows `error`: a known Prisma code becomes a GraphQLError, anything else passes through as-is. */
export function rethrowPrismaError(error: unknown, messages: KnownErrorMessages): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002' && messages.uniqueConstraint) {
      throw new GraphQLError(messages.uniqueConstraint, { extensions: { code: 'CONFLICT' } })
    }

    if (error.code === 'P2003' && messages.foreignKey) {
      throw new GraphQLError(messages.foreignKey, { extensions: { code: 'CONFLICT' } })
    }
  }

  throw error
}

export function notFoundError(message: string): GraphQLError {
  return new GraphQLError(message, { extensions: { code: 'NOT_FOUND' } })
}
