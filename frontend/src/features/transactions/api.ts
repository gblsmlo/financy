import { queryOptions } from '@tanstack/react-query'

import { graphql } from '../../gql'
import { graphqlClient } from '../../lib/graphql-client'

const transactionsDocument = graphql(`
  query Transactions {
    transactions {
      id
      description
      amountInCents
      type
      date
      category {
        id
        name
        color
      }
    }
  }
`)

export const transactionsQueryOptions = queryOptions({
  queryKey: ['transactions'],
  queryFn: async () => {
    const { transactions } = await graphqlClient.request(transactionsDocument)
    return transactions
  },
})
