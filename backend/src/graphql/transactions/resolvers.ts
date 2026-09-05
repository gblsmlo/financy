import { GraphQLError } from 'graphql'
import { z } from 'zod'
import type { TransactionType } from '../../generated/prisma/enums'
import { prisma } from '../../prisma'
import type { GraphQLContext } from '../context'
import { notFoundError } from '../prisma-errors'
import { requireUser } from '../require-user'

const createInputSchema = z.object({
  amountInCents: z.number().int().positive('Valor precisa ser maior que zero.'),
  categoryId: z.string().min(1, 'Selecione uma categoria.'),
  date: z
    .union([z.iso.datetime({ offset: true }), z.iso.date()], 'Data inválida.')
    .describe('AAAA-MM-DD ou ISO 8601 com offset'),
  description: z
    .string()
    .trim()
    .min(1, 'Descrição é obrigatória.')
    .max(200, 'Descrição tem no máximo 200 caracteres.'),
  type: z.enum(['INCOME', 'EXPENSE'], 'Tipo inválido.'),
})

const updateInputSchema = createInputSchema.partial()

function parseInput<T extends z.ZodType>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input)

  if (!result.success) {
    throw new GraphQLError(result.error.issues[0]?.message ?? 'Entrada inválida.', {
      extensions: { code: 'BAD_USER_INPUT' },
    })
  }

  return result.data
}

async function assertOwnCategory(userId: string, categoryId: string): Promise<void> {
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId } })

  if (!category) throw notFoundError('Categoria não encontrada.')
}

export const transactionResolvers = {
  Mutation: {
    async createTransaction(_parent: unknown, args: { input: unknown }, context: GraphQLContext) {
      const user = requireUser(context)
      const input = parseInput(createInputSchema, args.input)

      await assertOwnCategory(user.id, input.categoryId)

      return prisma.transaction.create({
        data: {
          amountInCents: input.amountInCents,
          categoryId: input.categoryId,
          date: new Date(input.date),
          description: input.description,
          type: input.type as TransactionType,
          userId: user.id,
        },
      })
    },

    async deleteTransaction(_parent: unknown, args: { id: string }, context: GraphQLContext) {
      const user = requireUser(context)

      const { count } = await prisma.transaction.deleteMany({
        where: { id: args.id, userId: user.id },
      })

      if (count === 0) throw notFoundError('Transação não encontrada.')

      return true
    },

    async updateTransaction(
      _parent: unknown,
      args: { id: string; input: unknown },
      context: GraphQLContext,
    ) {
      const user = requireUser(context)
      const input = parseInput(updateInputSchema, args.input)

      if (input.categoryId) await assertOwnCategory(user.id, input.categoryId)

      const { count } = await prisma.transaction.updateMany({
        where: { id: args.id, userId: user.id },
        data: {
          amountInCents: input.amountInCents,
          categoryId: input.categoryId,
          date: input.date ? new Date(input.date) : undefined,
          description: input.description,
          type: input.type as TransactionType | undefined,
        },
      })

      if (count === 0) throw notFoundError('Transação não encontrada.')

      return prisma.transaction.findUniqueOrThrow({ where: { id: args.id } })
    },
  },

  Query: {
    transactions(_parent: unknown, _args: unknown, context: GraphQLContext) {
      const user = requireUser(context)

      return prisma.transaction.findMany({
        where: { userId: user.id },
        orderBy: { date: 'desc' },
      })
    },
  },

  Transaction: {
    date: (transaction: { date: Date }) => transaction.date.toISOString(),
    createdAt: (transaction: { createdAt: Date }) => transaction.createdAt.toISOString(),
    updatedAt: (transaction: { updatedAt: Date }) => transaction.updatedAt.toISOString(),

    // Uma chamada por transação, mas o Prisma junta as `findUnique` concorrentes de um mesmo
    // tick numa query só — ver o teste em n-plus-one.test.ts.
    category(transaction: { categoryId: string }) {
      return prisma.category.findUniqueOrThrow({ where: { id: transaction.categoryId } })
    },
  },
}
