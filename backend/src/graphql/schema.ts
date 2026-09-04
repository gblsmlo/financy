export const typeDefs = /* GraphQL */ `
  type Health {
    status: String!
  }

  type Query {
    health: Health!
  }
`

export const resolvers = {
  Query: {
    health: () => ({ status: 'ok' }),
  },
}
