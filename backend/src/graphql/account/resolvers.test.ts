import { beforeEach, describe, expect, test } from 'bun:test'

import { buildApp } from '../../http/app'
import { createTestUser, graphqlRequest, resetDatabase } from '../test-helpers'

const UPDATE_PROFILE = /* GraphQL */ `
  mutation UpdateProfile($name: String!) {
    updateProfile(name: $name) {
      id
      name
      email
    }
  }
`

const LOGOUT = /* GraphQL */ `
  mutation Logout {
    logout
  }
`

const ME = /* GraphQL */ `
  query Me {
    me {
      name
    }
  }
`

describe('account resolvers', () => {
  beforeEach(async () => {
    await resetDatabase()
  })

  test('updateProfile is denied without a token', async () => {
    const app = buildApp()

    const result = await graphqlRequest(app, UPDATE_PROFILE, { name: 'Hackeado' })

    expect(result.data).toBeFalsy()
    expect(result.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED')
  })

  test('updateProfile changes the caller own name', async () => {
    const app = buildApp()
    const { token } = await createTestUser(app, { name: 'Ada Lovelace' })

    const result = await graphqlRequest(app, UPDATE_PROFILE, { name: 'Ada L.' }, token)

    expect(result.errors).toBeUndefined()
    expect((result.data?.updateProfile as { name: string }).name).toBe('Ada L.')

    const me = await graphqlRequest(app, ME, undefined, token)
    expect((me.data?.me as { name: string }).name).toBe('Ada L.')
  })

  test('updateProfile rejects a blank name', async () => {
    const app = buildApp()
    const { token } = await createTestUser(app)

    const result = await graphqlRequest(app, UPDATE_PROFILE, { name: '   ' }, token)

    expect(result.data).toBeFalsy()
    expect(result.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT')
  })

  test('logout is denied without a token', async () => {
    const app = buildApp()

    const result = await graphqlRequest(app, LOGOUT)

    expect(result.data).toBeFalsy()
    expect(result.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED')
  })

  test('logout revokes the session', async () => {
    const app = buildApp()
    const { token } = await createTestUser(app)

    const result = await graphqlRequest(app, LOGOUT, undefined, token)
    expect(result.errors).toBeUndefined()
    expect(result.data?.logout).toBe(true)

    const me = await graphqlRequest(app, ME, undefined, token)
    expect(me.data?.me).toBeNull()
    expect(me.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED')
  })
})
