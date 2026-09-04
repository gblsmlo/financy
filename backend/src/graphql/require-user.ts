import { GraphQLError } from 'graphql'

import type { GraphQLContext } from './context'

export function requireUser(context: GraphQLContext) {
  if (!context.user) {
    throw new GraphQLError('Não autenticado.', { extensions: { code: 'UNAUTHENTICATED' } })
  }

  return context.user
}
