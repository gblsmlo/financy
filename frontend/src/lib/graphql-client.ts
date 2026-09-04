import { GraphQLClient } from 'graphql-request'

import { env } from '../env'
import { getToken } from './auth-token'

export const graphqlClient = new GraphQLClient(`${env.VITE_BACKEND_URL}/graphql`)

const initialToken = getToken()
if (initialToken) graphqlClient.setHeader('authorization', `Bearer ${initialToken}`)

export function setAuthHeader(token: string): void {
  graphqlClient.setHeader('authorization', `Bearer ${token}`)
}

export function clearAuthHeader(): void {
  graphqlClient.setHeaders({})
}
