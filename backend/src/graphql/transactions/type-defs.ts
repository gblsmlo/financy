export const transactionTypeDefs = /* GraphQL */ `
  enum TransactionType {
    INCOME
    EXPENSE
  }

  type Transaction {
    id: ID!
    description: String!
    amountInCents: Int!
    type: TransactionType!
    date: String!
    category: Category!
    createdAt: String!
    updatedAt: String!
  }

  input CreateTransactionInput {
    description: String!
    amountInCents: Int!
    type: TransactionType!
    date: String!
    categoryId: ID!
  }

  input UpdateTransactionInput {
    description: String
    amountInCents: Int
    type: TransactionType
    date: String
    categoryId: ID
  }

  extend type Query {
    transactions: [Transaction!]!
  }

  extend type Mutation {
    createTransaction(input: CreateTransactionInput!): Transaction!
    updateTransaction(id: ID!, input: UpdateTransactionInput!): Transaction!
    deleteTransaction(id: ID!): Boolean!
  }
`
