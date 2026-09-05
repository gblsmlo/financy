import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { PrismaLibSql } from '@prisma/adapter-libsql'

import { PrismaClient } from '../../generated/prisma/client'

// Client próprio deste arquivo, com log de query por evento: o singleton de produção não liga
// log, e a model delegate do Prisma é um Proxy que ignora `spyOn`, então contar SQL de verdade é
// o único jeito de provar a propriedade.
const prisma = new PrismaClient({
  adapter: new PrismaLibSql({ url: process.env.DATABASE_URL as string }),
  log: [{ emit: 'event', level: 'query' }],
})

mock.module('../../prisma', () => ({ prisma }))

const { buildApp } = await import('../../http/app')
const { createTestUser, graphqlRequest, resetDatabase } = await import('../test-helpers')

const TRANSACTIONS_WITH_CATEGORY = /* GraphQL */ `
  query Transactions {
    transactions {
      id
      description
      category {
        id
        name
      }
    }
  }
`

async function countQueriesListing(transactionCount: number): Promise<number> {
  await resetDatabase()

  const app = buildApp()
  const { token, user } = await createTestUser(app)

  const category = await prisma.category.create({
    data: { name: 'Volume', icon: 'home', color: 'BLUE', userId: user.id },
  })

  await prisma.transaction.createMany({
    data: Array.from({ length: transactionCount }, (_, index) => ({
      amountInCents: 100,
      categoryId: category.id,
      date: new Date('2026-09-01T00:00:00.000Z'),
      description: `t${index}`,
      type: 'EXPENSE' as const,
      userId: user.id,
    })),
  })

  let queries = 0
  const count = () => {
    queries++
  }

  prisma.$on('query', count)
  const result = await graphqlRequest(app, TRANSACTIONS_WITH_CATEGORY, undefined, token)

  expect(result.errors).toBeUndefined()
  expect(result.data?.transactions).toHaveLength(transactionCount)

  return queries
}

beforeEach(async () => {
  await resetDatabase()
})

describe('listagem de transações', () => {
  /**
   * `Transaction.category` resolve por transação, o que parece N+1 na leitura — mas os resolvers
   * de campo rodam concorrentes e o Prisma junta as `findUnique` do mesmo tick numa query com
   * `IN`. Medir 3 contra 12 linhas prova a propriedade sem depender desse mecanismo: se alguém
   * trocar por uma busca sequencial (ou o Prisma parar de agrupar), o custo passa a crescer com
   * o número de linhas e o teste quebra.
   */
  test('custo em queries não cresce com o número de transações', async () => {
    const poucas = await countQueriesListing(3)
    const muitas = await countQueriesListing(12)

    expect(muitas).toBe(poucas)
  })
})
