import { ClientError } from 'graphql-request'

import { graphql } from '../../gql'
import { clearToken, setToken } from '../../lib/auth-token'
import { clearAuthHeader, graphqlClient, setAuthHeader } from '../../lib/graphql-client'

export const meDocument = graphql(`
  query Me {
    me {
      id
      name
      email
    }
  }
`)

const signupDocument = graphql(`
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
`)

const loginDocument = graphql(`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
      }
    }
  }
`)

const logoutDocument = graphql(`
  mutation Logout {
    logout
  }
`)

const updateProfileDocument = graphql(`
  mutation UpdateProfile($name: String!) {
    updateProfile(name: $name) {
      id
      name
      email
    }
  }
`)

export async function fetchSession() {
  try {
    const { me } = await graphqlClient.request(meDocument)
    return me
  } catch (error) {
    if (error instanceof ClientError && isUnauthenticated(error)) return null
    throw error
  }
}

export async function signup(input: { name: string; email: string; password: string }) {
  const { signup: result } = await graphqlClient.request(signupDocument, input)
  setToken(result.token)
  setAuthHeader(result.token)
  return result.user
}

export async function login(input: { email: string; password: string }) {
  const { login: result } = await graphqlClient.request(loginDocument, input)
  setToken(result.token)
  setAuthHeader(result.token)
  return result.user
}

export async function logout() {
  try {
    await graphqlClient.request(logoutDocument)
  } finally {
    clearToken()
    clearAuthHeader()
  }
}

export async function updateProfile(input: { name: string }) {
  const { updateProfile: user } = await graphqlClient.request(updateProfileDocument, input)
  return user
}

function isUnauthenticated(error: ClientError): boolean {
  return error.response.errors?.[0]?.extensions?.code === 'UNAUTHENTICATED'
}
