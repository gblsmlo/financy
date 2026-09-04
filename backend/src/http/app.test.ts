import { describe, expect, test } from 'bun:test'

import { buildApp } from './app'

describe('GraphQL bootstrap', () => {
  test('responds to a health query', async () => {
    const app = buildApp()

    const response = await app.inject({
      method: 'POST',
      url: '/graphql',
      payload: { query: '{ health { status } }' },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json<{ data: { health: { status: string } } }>()).toEqual({
      data: { health: { status: 'ok' } },
    })
  })
})
