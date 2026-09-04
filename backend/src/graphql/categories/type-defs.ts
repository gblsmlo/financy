export const categoryTypeDefs = /* GraphQL */ `
  enum CategoryColor {
    BLUE
    PURPLE
    PINK
    RED
    ORANGE
    YELLOW
    GREEN
  }

  type Category {
    id: ID!
    name: String!
    description: String
    icon: String!
    color: CategoryColor!
    createdAt: String!
    updatedAt: String!
  }

  input CategoryInput {
    name: String!
    description: String
    icon: String!
    color: CategoryColor!
  }

  extend type Query {
    categories: [Category!]!
  }

  extend type Mutation {
    createCategory(input: CategoryInput!): Category!
    updateCategory(id: ID!, input: CategoryInput!): Category!
    deleteCategory(id: ID!): Boolean!
  }
`
