import { APIError } from 'better-auth'
import { GraphQLError } from 'graphql'

import { auth } from '../auth'
import type { GraphQLContext } from './context'
import { requireUser } from './require-user'

function toAuthError(error: unknown): GraphQLError {
  if (error instanceof APIError) {
    return new GraphQLError(error.body?.message ?? error.message, {
      extensions: { code: error.body?.code ?? error.status },
    })
  }

  throw error
}

export const authResolvers = {
  Mutation: {
    async login(_parent: unknown, args: { email: string; password: string }) {
      try {
        const result = await auth.api.signInEmail({
          body: { email: args.email, password: args.password },
        })

        return { token: result.token, user: result.user }
      } catch (error) {
        throw toAuthError(error)
      }
    },

    async signup(_parent: unknown, args: { name: string; email: string; password: string }) {
      try {
        const result = await auth.api.signUpEmail({
          body: { name: args.name, email: args.email, password: args.password },
        })

        if (!result.token) {
          throw new GraphQLError('Cadastro criado, mas sem sessão iniciada.', {
            extensions: { code: 'SIGNUP_NO_SESSION' },
          })
        }

        return { token: result.token, user: result.user }
      } catch (error) {
        throw toAuthError(error)
      }
    },
  },

  Query: {
    health: () => ({ status: 'ok' }),

    me(_parent: unknown, _args: unknown, context: GraphQLContext) {
      return requireUser(context)
    },
  },
}
