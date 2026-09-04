import type { FastifyRequest } from 'fastify'

import { auth } from '../auth'

function toHeaders(rawHeaders: FastifyRequest['headers']): Headers {
  const headers = new Headers()

  for (const [key, value] of Object.entries(rawHeaders)) {
    if (value === undefined) continue
    headers.set(key, Array.isArray(value) ? value.join(', ') : value)
  }

  return headers
}

export async function buildContext(request: FastifyRequest) {
  const session = await auth.api.getSession({ headers: toHeaders(request.headers) })

  return { user: session?.user ?? null }
}

export type GraphQLContext = Awaited<ReturnType<typeof buildContext>>

declare module 'mercurius' {
  interface MercuriusContext extends GraphQLContext {}
}
