import type { buildApp } from '../http/app'

export async function graphqlRequest(
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

export async function createTestUser(
  app: ReturnType<typeof buildApp>,
  overrides: Partial<{ name: string; email: string; password: string }> = {},
) {
  const variables = {
    name: overrides.name ?? 'Ada Lovelace',
    email: overrides.email ?? `user-${crypto.randomUUID()}@example.com`,
    password: overrides.password ?? 'super-secret-123',
  }

  const result = await graphqlRequest(app, SIGNUP, variables)
  const signup = result.data?.signup as { token: string; user: { id: string; email: string } }

  return { token: signup.token, user: signup.user }
}
