import { beforeEach, describe, expect, test } from 'bun:test'

import { buildApp } from '../http/app'
import { prisma } from '../prisma'

async function graphql(
  app: ReturnType<typeof buildApp>,
  query: string,
  variables?: Record<string, unknown>,
  token?: string,
) {
  const response = await app.inject({
    method: 'POST',
    url: '/graphql',
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
    payload: { query, variables },
  })

  return response.json<{
    data?: Record<string, unknown>
    errors?: Array<{ message: string; extensions?: { code?: string } }>
  }>()
}

const SIGNUP = /* GraphQL */ `
  mutation Signup($name: String!, $email: String!, $password: String!) {
    signup(name: $name, email: $email, password: $password) {
      token
      user {
        id
        name
        email
      }
    }
  }
`

const LOGIN = /* GraphQL */ `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
      }
    }
  }
`

const ME = /* GraphQL */ `
  query Me {
    me {
      id
      email
    }
  }
`

describe('auth resolvers', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany()
  })

  test('signup creates the user and returns a session token', async () => {
    const app = buildApp()

    const result = await graphql(app, SIGNUP, {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'super-secret-123',
    })

    expect(result.errors).toBeUndefined()
    const signup = result.data?.signup as { token: string; user: { email: string } }
    expect(signup.token).toBeTruthy()
    expect(signup.user.email).toBe('ada@example.com')
  })

  test('signup rejects a duplicate email', async () => {
    const app = buildApp()
    const variables = {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'super-secret-123',
    }

    await graphql(app, SIGNUP, variables)
    const result = await graphql(app, SIGNUP, variables)

    expect(result.data).toBeFalsy()
    expect(result.errors?.[0]?.message).toBeTruthy()
  })

  test('login succeeds with correct credentials', async () => {
    const app = buildApp()
    await graphql(app, SIGNUP, {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'super-secret-123',
    })

    const result = await graphql(app, LOGIN, {
      email: 'ada@example.com',
      password: 'super-secret-123',
    })

    expect(result.errors).toBeUndefined()
    const login = result.data?.login as { token: string }
    expect(login.token).toBeTruthy()
  })

  test('login rejects incorrect credentials', async () => {
    const app = buildApp()
    await graphql(app, SIGNUP, {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'super-secret-123',
    })

    const result = await graphql(app, LOGIN, {
      email: 'ada@example.com',
      password: 'wrong-password',
    })

    expect(result.data).toBeFalsy()
    expect(result.errors?.[0]?.message).toBeTruthy()
  })

  test('me is denied without a token', async () => {
    const app = buildApp()

    const result = await graphql(app, ME)

    expect(result.data?.me).toBeNull()
    expect(result.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED')
  })

  test('me returns the authenticated user with a valid token', async () => {
    const app = buildApp()
    const signup = await graphql(app, SIGNUP, {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'super-secret-123',
    })
    const token = (signup.data?.signup as { token: string }).token

    const result = await graphql(app, ME, undefined, token)

    expect(result.errors).toBeUndefined()
    expect((result.data?.me as { email: string }).email).toBe('ada@example.com')
  })
})
