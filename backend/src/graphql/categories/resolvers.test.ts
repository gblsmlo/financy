import { beforeEach, describe, expect, test } from 'bun:test'

import { buildApp } from '../../http/app'
import { prisma } from '../../prisma'
import { createTestUser, graphqlRequest } from '../test-helpers'

const CREATE_CATEGORY = /* GraphQL */ `
  mutation CreateCategory($name: String!) {
    createCategory(name: $name) {
      id
      name
    }
  }
`

const UPDATE_CATEGORY = /* GraphQL */ `
  mutation UpdateCategory($id: ID!, $name: String!) {
    updateCategory(id: $id, name: $name) {
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

describe('category resolvers', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany()
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

    const result = await graphqlRequest(app, CREATE_CATEGORY, { name: 'Salário' }, token)

    expect(result.errors).toBeUndefined()
    expect((result.data?.createCategory as { name: string }).name).toBe('Salário')
  })

  test('createCategory rejects a duplicate name for the same user', async () => {
    const app = buildApp()
    const { token } = await createTestUser(app)

    await graphqlRequest(app, CREATE_CATEGORY, { name: 'Salário' }, token)
    const result = await graphqlRequest(app, CREATE_CATEGORY, { name: 'Salário' }, token)

    expect(result.data).toBeFalsy()
    expect(result.errors?.[0]?.extensions?.code).toBe('CONFLICT')
  })

  test('createCategory rejects a blank name', async () => {
    const app = buildApp()
    const { token } = await createTestUser(app)

    const result = await graphqlRequest(app, CREATE_CATEGORY, { name: '   ' }, token)

    expect(result.data).toBeFalsy()
    expect(result.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT')
  })

  test('categories only lists the caller own categories', async () => {
    const app = buildApp()
    const owner = await createTestUser(app)
    const other = await createTestUser(app)

    await graphqlRequest(app, CREATE_CATEGORY, { name: 'Salário' }, owner.token)
    await graphqlRequest(app, CREATE_CATEGORY, { name: 'Aluguel' }, other.token)

    const result = await graphqlRequest(app, CATEGORIES, undefined, owner.token)

    const categories = result.data?.categories as Array<{ name: string }>
    expect(categories).toHaveLength(1)
    expect(categories[0]?.name).toBe('Salário')
  })

  test('updateCategory denies a category owned by another user', async () => {
    const app = buildApp()
    const owner = await createTestUser(app)
    const attacker = await createTestUser(app)

    const created = await graphqlRequest(app, CREATE_CATEGORY, { name: 'Salário' }, owner.token)
    const categoryId = (created.data?.createCategory as { id: string }).id

    const result = await graphqlRequest(
      app,
      UPDATE_CATEGORY,
      { id: categoryId, name: 'Hackeado' },
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

    const created = await graphqlRequest(app, CREATE_CATEGORY, { name: 'Salário' }, owner.token)
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

    const created = await graphqlRequest(app, CREATE_CATEGORY, { name: 'Salário' }, token)
    const categoryId = (created.data?.createCategory as { id: string }).id

    const result = await graphqlRequest(app, DELETE_CATEGORY, { id: categoryId }, token)

    expect(result.errors).toBeUndefined()
    expect(result.data?.deleteCategory).toBe(true)
    expect(await prisma.category.findUnique({ where: { id: categoryId } })).toBeNull()
  })

  test('deleteCategory refuses a category with linked transactions', async () => {
    const app = buildApp()
    const { token, user } = await createTestUser(app)

    const created = await graphqlRequest(app, CREATE_CATEGORY, { name: 'Salário' }, token)
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
