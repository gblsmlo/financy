import { beforeEach, describe, expect, test } from 'bun:test'

import { buildApp } from '../../http/app'
import { prisma } from '../../prisma'
import { createTestUser, graphqlRequest, resetDatabase } from '../test-helpers'

const CREATE_CATEGORY = /* GraphQL */ `
  mutation CreateCategory($input: CategoryInput!) {
    createCategory(input: $input) {
      id
      name
      description
      icon
      color
    }
  }
`

const UPDATE_CATEGORY = /* GraphQL */ `
  mutation UpdateCategory($id: ID!, $input: CategoryInput!) {
    updateCategory(id: $id, input: $input) {
      id
      name
    }
  }
`

const DELETE_CATEGORY = /* GraphQL */ `
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`

const CATEGORIES = /* GraphQL */ `
  query Categories {
    categories {
      id
      name
    }
  }
`

function categoryInput(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    color: 'GREEN',
    icon: 'briefcase',
    name: 'Salário',
    ...overrides,
  }
}

describe('category resolvers', () => {
  beforeEach(async () => {
    await resetDatabase()
  })

  test('categories is denied without a token', async () => {
    const app = buildApp()

    const result = await graphqlRequest(app, CATEGORIES)

    expect(result.data).toBeFalsy()
    expect(result.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED')
  })

  test('createCategory creates a category owned by the caller', async () => {
    const app = buildApp()
    const { token } = await createTestUser(app)

    const result = await graphqlRequest(
      app,
      CREATE_CATEGORY,
      { input: categoryInput({ description: 'Renda mensal' }) },
      token,
    )

    expect(result.errors).toBeUndefined()
    const category = result.data?.createCategory as {
      name: string
      description: string
      icon: string
      color: string
    }
    expect(category.name).toBe('Salário')
    expect(category.description).toBe('Renda mensal')
    expect(category.icon).toBe('briefcase')
    expect(category.color).toBe('GREEN')
  })

  test('createCategory rejects a duplicate name for the same user', async () => {
    const app = buildApp()
    const { token } = await createTestUser(app)

    await graphqlRequest(app, CREATE_CATEGORY, { input: categoryInput() }, token)
    const result = await graphqlRequest(app, CREATE_CATEGORY, { input: categoryInput() }, token)

    expect(result.data).toBeFalsy()
    expect(result.errors?.[0]?.extensions?.code).toBe('CONFLICT')
  })

  test('createCategory rejects a blank name', async () => {
    const app = buildApp()
    const { token } = await createTestUser(app)

    const result = await graphqlRequest(
      app,
      CREATE_CATEGORY,
      { input: categoryInput({ name: '   ' }) },
      token,
    )

    expect(result.data).toBeFalsy()
    expect(result.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT')
  })

  test('categories only lists the caller own categories', async () => {
    const app = buildApp()
    const owner = await createTestUser(app)
    const other = await createTestUser(app)

    await graphqlRequest(app, CREATE_CATEGORY, { input: categoryInput() }, owner.token)
    await graphqlRequest(
      app,
      CREATE_CATEGORY,
      { input: categoryInput({ name: 'Aluguel' }) },
      other.token,
    )

    const result = await graphqlRequest(app, CATEGORIES, undefined, owner.token)

    const categories = result.data?.categories as Array<{ name: string }>
    expect(categories).toHaveLength(1)
    expect(categories[0]?.name).toBe('Salário')
  })

  test('updateCategory denies a category owned by another user', async () => {
    const app = buildApp()
    const owner = await createTestUser(app)
    const attacker = await createTestUser(app)

    const created = await graphqlRequest(
      app,
      CREATE_CATEGORY,
      { input: categoryInput() },
      owner.token,
    )
    const categoryId = (created.data?.createCategory as { id: string }).id

    const result = await graphqlRequest(
      app,
      UPDATE_CATEGORY,
      { id: categoryId, input: categoryInput({ name: 'Hackeado' }) },
      attacker.token,
    )

    expect(result.data).toBeFalsy()
    expect(result.errors?.[0]?.extensions?.code).toBe('NOT_FOUND')

    const stillOwned = await prisma.category.findUniqueOrThrow({ where: { id: categoryId } })
    expect(stillOwned.name).toBe('Salário')
  })

  test('deleteCategory denies a category owned by another user', async () => {
    const app = buildApp()
    const owner = await createTestUser(app)
    const attacker = await createTestUser(app)

    const created = await graphqlRequest(
      app,
      CREATE_CATEGORY,
      { input: categoryInput() },
      owner.token,
    )
    const categoryId = (created.data?.createCategory as { id: string }).id

    const result = await graphqlRequest(app, DELETE_CATEGORY, { id: categoryId }, attacker.token)

    expect(result.data).toBeFalsy()
    expect(result.errors?.[0]?.extensions?.code).toBe('NOT_FOUND')

    const stillThere = await prisma.category.findUniqueOrThrow({ where: { id: categoryId } })
    expect(stillThere).toBeTruthy()
  })

  test('deleteCategory succeeds for the owner and removes the category', async () => {
    const app = buildApp()
    const { token } = await createTestUser(app)

    const created = await graphqlRequest(app, CREATE_CATEGORY, { input: categoryInput() }, token)
    const categoryId = (created.data?.createCategory as { id: string }).id

    const result = await graphqlRequest(app, DELETE_CATEGORY, { id: categoryId }, token)

    expect(result.errors).toBeUndefined()
    expect(result.data?.deleteCategory).toBe(true)
    expect(await prisma.category.findUnique({ where: { id: categoryId } })).toBeNull()
  })

  test('deleteCategory refuses a category with linked transactions', async () => {
    const app = buildApp()
    const { token, user } = await createTestUser(app)

    const created = await graphqlRequest(app, CREATE_CATEGORY, { input: categoryInput() }, token)
    const categoryId = (created.data?.createCategory as { id: string }).id

    await prisma.transaction.create({
      data: {
        amountInCents: 1000,
        categoryId,
        date: new Date(),
        description: 'Pagamento',
        type: 'INCOME',
        userId: user.id,
      },
    })

    const result = await graphqlRequest(app, DELETE_CATEGORY, { id: categoryId }, token)

    expect(result.data).toBeFalsy()
    expect(result.errors?.[0]?.extensions?.code).toBe('CONFLICT')
  })
})
