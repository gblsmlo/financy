import { GraphQLError } from 'graphql'
import { z } from 'zod'
import { prisma } from '../../prisma'
import type { GraphQLContext } from '../context'
import { notFoundError, rethrowPrismaError } from '../prisma-errors'
import { requireUser } from '../require-user'

const categoryColors = ['BLUE', 'PURPLE', 'PINK', 'RED', 'ORANGE', 'YELLOW', 'GREEN'] as const

const categoryInputSchema = z.object({
  color: z.enum(categoryColors),
  description: z.string().trim().max(200, 'Descrição tem no máximo 200 caracteres.').optional(),
  icon: z.string().trim().min(1, 'Ícone é obrigatório.'),
  name: z
    .string()
    .trim()
    .min(1, 'Nome é obrigatório.')
    .max(100, 'Nome tem no máximo 100 caracteres.'),
})

function parseInput(input: unknown): z.infer<typeof categoryInputSchema> {
  const result = categoryInputSchema.safeParse(input)

  if (!result.success) {
    throw new GraphQLError(result.error.issues[0]?.message ?? 'Entrada inválida.', {
      extensions: { code: 'BAD_USER_INPUT' },
    })
  }

  return result.data
}

export const categoryResolvers = {
  Mutation: {
    async createCategory(_parent: unknown, args: { input: unknown }, context: GraphQLContext) {
      const user = requireUser(context)
      const input = parseInput(args.input)

      try {
        return await prisma.category.create({ data: { ...input, userId: user.id } })
      } catch (error) {
        rethrowPrismaError(error, { uniqueConstraint: 'Você já tem uma categoria com esse nome.' })
      }
    },

    async deleteCategory(_parent: unknown, args: { id: string }, context: GraphQLContext) {
      const user = requireUser(context)

      try {
        const { count } = await prisma.category.deleteMany({
          where: { id: args.id, userId: user.id },
        })

        if (count === 0) throw notFoundError('Categoria não encontrada.')

        return true
      } catch (error) {
        rethrowPrismaError(error, {
          foreignKey: 'Categoria tem transações vinculadas — mova ou apague-as antes.',
        })
      }
    },

    async updateCategory(
      _parent: unknown,
      args: { id: string; input: unknown },
      context: GraphQLContext,
    ) {
      const user = requireUser(context)
      const input = parseInput(args.input)

      try {
        const { count } = await prisma.category.updateMany({
          where: { id: args.id, userId: user.id },
          data: input,
        })

        if (count === 0) throw notFoundError('Categoria não encontrada.')

        return await prisma.category.findUniqueOrThrow({ where: { id: args.id } })
      } catch (error) {
        rethrowPrismaError(error, { uniqueConstraint: 'Você já tem uma categoria com esse nome.' })
      }
    },
  },

  Query: {
    categories(_parent: unknown, _args: unknown, context: GraphQLContext) {
      const user = requireUser(context)

      return prisma.category.findMany({
        where: { userId: user.id },
        orderBy: { name: 'asc' },
      })
    },
  },

  Category: {
    createdAt: (category: { createdAt: Date }) => category.createdAt.toISOString(),
    updatedAt: (category: { updatedAt: Date }) => category.updatedAt.toISOString(),
  },
}
