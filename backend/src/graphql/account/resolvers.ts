import { GraphQLError } from 'graphql'
import { z } from 'zod'

import { auth } from '../../auth'
import { prisma } from '../../prisma'
import type { GraphQLContext } from '../context'
import { requireUser } from '../require-user'

const nameSchema = z.string().trim().min(1, 'Nome é obrigatório.').max(100)

export const accountResolvers = {
  Mutation: {
    async updateProfile(_parent: unknown, args: { name: string }, context: GraphQLContext) {
      const user = requireUser(context)
      const result = nameSchema.safeParse(args.name)

      if (!result.success) {
        throw new GraphQLError(result.error.issues[0]?.message ?? 'Nome inválido.', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }

      await auth.api.updateUser({ headers: context.headers, body: { name: result.data } })

      return prisma.user.findUniqueOrThrow({ where: { id: user.id } })
    },

    async logout(_parent: unknown, _args: unknown, context: GraphQLContext) {
      requireUser(context)
      await auth.api.signOut({ headers: context.headers })

      return true
    },
  },
}
