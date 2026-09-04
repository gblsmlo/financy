import cors from '@fastify/cors'
import fastify from 'fastify'
import mercurius from 'mercurius'

import { env } from '../env'
import { buildContext } from '../graphql/context'
import { resolvers } from '../graphql/resolvers'
import { typeDefs } from '../graphql/type-defs'

export function buildApp() {
  const app = fastify()

  app.register(cors, { origin: env.CORS_ORIGIN })

  app.register(mercurius, {
    context: buildContext,
    graphiql: env.NODE_ENV !== 'production',
    resolvers,
    schema: typeDefs,
  })

  return app
}
