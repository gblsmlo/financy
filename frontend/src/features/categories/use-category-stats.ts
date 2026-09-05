import { useQuery } from '@tanstack/react-query'

import { transactionsQueryOptions } from '../transactions/api'
import { categoriesQueryOptions } from './api'

export function useCategoryStats() {
  const categoriesQuery = useQuery(categoriesQueryOptions)
  const transactionsQuery = useQuery(transactionsQueryOptions)

  const categories = categoriesQuery.data ?? []
  const transactions = transactionsQuery.data ?? []

  const stats = categories.map((category) => {
    const categoryTransactions = transactions.filter((t) => t.category.id === category.id)
    const totalInCents = categoryTransactions.reduce((total, t) => total + t.amountInCents, 0)

    return {
      category,
      itemCount: categoryTransactions.length,
      totalInCents,
    }
  })

  return {
    stats,
    isLoading: categoriesQuery.isLoading || transactionsQuery.isLoading,
    error: categoriesQuery.error ?? transactionsQuery.error,
  }
}
