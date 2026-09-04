export const categoryTypeDefs = /* GraphQL */ `
  type Category {
    id: ID!
    name: String!
    createdAt: String!
    updatedAt: String!
  }

  extend type Query {
    categories: [Category!]!
  }

  extend type Mutation {
    createCategory(name: String!): Category!
    updateCategory(id: ID!, name: String!): Category!
    deleteCategory(id: ID!): Boolean!
  }
`
