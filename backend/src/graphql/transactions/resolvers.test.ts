import { beforeEach, describe, expect, test } from 'bun:test'

import { buildApp } from '../../http/app'
import { prisma } from '../../prisma'
import { createTestUser, graphqlRequest, resetDatabase } from '../test-helpers'

const CREATE_CATEGORY = /* GraphQL */ `
  mutation CreateCategory($input: CategoryInput!) {
    createCategory(input: $input) {
      id
    }
  }
`

const CREATE_TRANSACTION = /* GraphQL */ `
  mutation CreateTransaction($input: CreateTransactionInput!) {
    createTransaction(input: $input) {
      id
      description
      amountInCents
      type
      date
      category {
        id
      }
    }
  }
`

const UPDATE_TRANSACTION = /* GraphQL */ `
  mutation UpdateTransaction($id: ID!, $input: UpdateTransactionInput!) {
    updateTransaction(id: $id, input: $input) {
      id
      description
      amountInCents
    }
  }
`

const DELETE_TRANSACTION = /* GraphQL */ `
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(id: $id)
  }
`

const TRANSACTIONS = /* GraphQL */ `
  query Transactions {
    transactions {
      id
      description
      category {
        id
      }
    }
  }
`

async function createCategory(app: ReturnType<typeof buildApp>, token: string, name = 'Salário') {
  const input = { color: 'GREEN', icon: 'briefcase', name }
  const result = await graphqlRequest(app, CREATE_CATEGORY, { input }, token)
  return (result.data?.createCategory as { id: string }).id
}

describe('transaction resolvers', () => {
  beforeEach(async () => {
    await resetDatabase()
  })

  test('transactions is denied without a token', async () => {
    const app = buildApp()

    const result = await graphqlRequest(app, TRANSACTIONS)

    expect(result.data).toBeFalsy()
    expect(result.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED')
  })

  test('createTransaction creates a transaction owned by the caller', async () => {
    const app = buildApp()
    const { token } = await createTestUser(app)
    const categoryId = await createCategory(app, token)

    const result = await graphqlRequest(
      app,
      CREATE_TRANSACTION,
      {
        input: {
          amountInCents: 5000,
          categoryId,
          date: '2026-01-05',
          description: 'Salário de janeiro',
          type: 'INCOME',
        },
      },
      token,
    )

    expect(result.errors).toBeUndefined()
    const transaction = result.data?.createTransaction as {
      description: string
      amountInCents: number
      category: { id: string }
    }
    expect(transaction.description).toBe('Salário de janeiro')
    expect(transaction.amountInCents).toBe(5000)
    expect(transaction.category.id).toBe(categoryId)
  })

  test('createTransaction rejects a category owned by another user', async () => {
    const app = buildApp()
    const owner = await createTestUser(app)
    const attacker = await createTestUser(app)
    const categoryId = await createCategory(app, owner.token)

    const result = await graphqlRequest(
      app,
      CREATE_TRANSACTION,
      {
        input: {
          amountInCents: 5000,
          categoryId,
          date: '2026-01-05',
          description: 'Tentativa',
          type: 'INCOME',
        },
      },
      attacker.token,
    )

    expect(result.data).toBeFalsy()
    expect(result.errors?.[0]?.extensions?.code).toBe('NOT_FOUND')
  })

  test('createTransaction rejects a non-positive amount', async () => {
    const app = buildApp()
    const { token } = await createTestUser(app)
    const categoryId = await createCategory(app, token)

    const result = await graphqlRequest(
      app,
      CREATE_TRANSACTION,
      {
        input: {
          amountInCents: 0,
          categoryId,
          date: '2026-01-05',
          description: 'Inválida',
          type: 'INCOME',
        },
      },
      token,
    )

    expect(result.data).toBeFalsy()
    expect(result.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT')
  })

  test('transactions only lists the caller own transactions', async () => {
    const app = buildApp()
    const owner = await createTestUser(app)
    const other = await createTestUser(app)
    const ownerCategoryId = await createCategory(app, owner.token)
    const otherCategoryId = await createCategory(app, other.token)

    await graphqlRequest(
      app,
      CREATE_TRANSACTION,
      {
        input: {
          amountInCents: 5000,
          categoryId: ownerCategoryId,
          date: '2026-01-05',
          description: 'Do dono',
          type: 'INCOME',
        },
      },
      owner.token,
    )
    await graphqlRequest(
      app,
      CREATE_TRANSACTION,
      {
        input: {
          amountInCents: 1000,
          categoryId: otherCategoryId,
          date: '2026-01-05',
          description: 'Do outro',
          type: 'EXPENSE',
        },
      },
      other.token,
    )

    const result = await graphqlRequest(app, TRANSACTIONS, undefined, owner.token)

    const transactions = result.data?.transactions as Array<{ description: string }>
    expect(transactions).toHaveLength(1)
    expect(transactions[0]?.description).toBe('Do dono')
  })

  test('updateTransaction denies a transaction owned by another user', async () => {
    const app = buildApp()
    const owner = await createTestUser(app)
    const attacker = await createTestUser(app)
    const categoryId = await createCategory(app, owner.token)

    const created = await graphqlRequest(
      app,
      CREATE_TRANSACTION,
      {
        input: {
          amountInCents: 5000,
          categoryId,
          date: '2026-01-05',
          description: 'Original',
          type: 'INCOME',
        },
      },
      owner.token,
    )
    const transactionId = (created.data?.createTransaction as { id: string }).id

    const result = await graphqlRequest(
      app,
      UPDATE_TRANSACTION,
      { id: transactionId, input: { description: 'Hackeada' } },
      attacker.token,
    )

    expect(result.data).toBeFalsy()
    expect(result.errors?.[0]?.extensions?.code).toBe('NOT_FOUND')

    const stillOriginal = await prisma.transaction.findUniqueOrThrow({
      where: { id: transactionId },
    })
    expect(stillOriginal.description).toBe('Original')
  })

  test('deleteTransaction denies a transaction owned by another user', async () => {
    const app = buildApp()
    const owner = await createTestUser(app)
    const attacker = await createTestUser(app)
    const categoryId = await createCategory(app, owner.token)

    const created = await graphqlRequest(
      app,
      CREATE_TRANSACTION,
      {
        input: {
          amountInCents: 5000,
          categoryId,
          date: '2026-01-05',
          description: 'Original',
          type: 'INCOME',
        },
      },
      owner.token,
    )
    const transactionId = (created.data?.createTransaction as { id: string }).id

    const result = await graphqlRequest(
      app,
      DELETE_TRANSACTION,
      { id: transactionId },
      attacker.token,
    )

    expect(result.data).toBeFalsy()
    expect(result.errors?.[0]?.extensions?.code).toBe('NOT_FOUND')

    const stillThere = await prisma.transaction.findUniqueOrThrow({
      where: { id: transactionId },
    })
    expect(stillThere).toBeTruthy()
  })

  test('deleteTransaction succeeds for the owner', async () => {
    const app = buildApp()
    const { token } = await createTestUser(app)
    const categoryId = await createCategory(app, token)

    const created = await graphqlRequest(
      app,
      CREATE_TRANSACTION,
      {
        input: {
          amountInCents: 5000,
          categoryId,
          date: '2026-01-05',
          description: 'Original',
          type: 'INCOME',
        },
      },
      token,
    )
    const transactionId = (created.data?.createTransaction as { id: string }).id

    const result = await graphqlRequest(app, DELETE_TRANSACTION, { id: transactionId }, token)

    expect(result.errors).toBeUndefined()
    expect(result.data?.deleteTransaction).toBe(true)
    expect(await prisma.transaction.findUnique({ where: { id: transactionId } })).toBeNull()
  })
})
