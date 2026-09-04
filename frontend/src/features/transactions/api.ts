import { queryOptions } from '@tanstack/react-query'
import { graphql } from '../../gql'
import type { CreateTransactionInput, UpdateTransactionInput } from '../../gql/graphql'
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

const createTransactionDocument = graphql(`
  mutation CreateTransaction($input: CreateTransactionInput!) {
    createTransaction(input: $input) {
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

export async function createTransaction(input: CreateTransactionInput) {
  const { createTransaction: transaction } = await graphqlClient.request(
    createTransactionDocument,
    { input },
  )
  return transaction
}

const updateTransactionDocument = graphql(`
  mutation UpdateTransaction($id: ID!, $input: UpdateTransactionInput!) {
    updateTransaction(id: $id, input: $input) {
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

export async function updateTransaction(args: { id: string; input: UpdateTransactionInput }) {
  const { updateTransaction: transaction } = await graphqlClient.request(
    updateTransactionDocument,
    args,
  )
  return transaction
}

const deleteTransactionDocument = graphql(`
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(id: $id)
  }
`)

export async function deleteTransaction(id: string) {
  await graphqlClient.request(deleteTransactionDocument, { id })
}
