export const accountTypeDefs = /* GraphQL */ `
  extend type Mutation {
    updateProfile(name: String!): User!
    logout: Boolean!
  }
`
