import cors from '@fastify/cors'
import fastify from 'fastify'
import mercurius from 'mercurius'

import { env } from '../env'
import { resolvers, typeDefs } from '../graphql/schema'

export function buildApp() {
  const app = fastify()

  app.register(cors, { origin: env.CORS_ORIGIN })

  app.register(mercurius, {
    graphiql: env.NODE_ENV !== 'production',
    resolvers,
    schema: typeDefs,
  })

  return app
}
