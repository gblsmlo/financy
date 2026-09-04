import { authResolvers } from './auth-resolvers'
import { authTypeDefs } from './auth-type-defs'
import { categoryResolvers } from './categories/resolvers'
import { categoryTypeDefs } from './categories/type-defs'
import { transactionResolvers } from './transactions/resolvers'
import { transactionTypeDefs } from './transactions/type-defs'

export const typeDefs = [authTypeDefs, categoryTypeDefs, transactionTypeDefs].join('\n')

export const resolvers = {
  Mutation: {
    ...authResolvers.Mutation,
    ...categoryResolvers.Mutation,
    ...transactionResolvers.Mutation,
  },
  Query: {
    ...authResolvers.Query,
    ...categoryResolvers.Query,
    ...transactionResolvers.Query,
  },
  Category: categoryResolvers.Category,
  Transaction: transactionResolvers.Transaction,
}
