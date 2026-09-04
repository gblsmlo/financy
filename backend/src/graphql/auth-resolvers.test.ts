import { beforeEach, describe, expect, test } from 'bun:test'

import { buildApp } from '../http/app'
import { graphqlRequest, resetDatabase } from './test-helpers'

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
    await resetDatabase()
  })

  test('signup creates the user and returns a session token', async () => {
    const app = buildApp()

    const result = await graphqlRequest(app, SIGNUP, {
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

    await graphqlRequest(app, SIGNUP, variables)
    const result = await graphqlRequest(app, SIGNUP, variables)

    expect(result.data).toBeFalsy()
    expect(result.errors?.[0]?.message).toBeTruthy()
  })

  test('login succeeds with correct credentials', async () => {
    const app = buildApp()
    await graphqlRequest(app, SIGNUP, {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'super-secret-123',
    })

    const result = await graphqlRequest(app, LOGIN, {
      email: 'ada@example.com',
      password: 'super-secret-123',
    })

    expect(result.errors).toBeUndefined()
    const login = result.data?.login as { token: string }
    expect(login.token).toBeTruthy()
  })

  test('login rejects incorrect credentials', async () => {
    const app = buildApp()
    await graphqlRequest(app, SIGNUP, {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'super-secret-123',
    })

    const result = await graphqlRequest(app, LOGIN, {
      email: 'ada@example.com',
      password: 'wrong-password',
    })

    expect(result.data).toBeFalsy()
    expect(result.errors?.[0]?.message).toBeTruthy()
  })

  test('me is denied without a token', async () => {
    const app = buildApp()

    const result = await graphqlRequest(app, ME)

    expect(result.data?.me).toBeNull()
    expect(result.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED')
  })

  test('me returns the authenticated user with a valid token', async () => {
    const app = buildApp()
    const signup = await graphqlRequest(app, SIGNUP, {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'super-secret-123',
    })
    const token = (signup.data?.signup as { token: string }).token

    const result = await graphqlRequest(app, ME, undefined, token)

    expect(result.errors).toBeUndefined()
    expect((result.data?.me as { email: string }).email).toBe('ada@example.com')
  })
})
