import { useQuery } from '@tanstack/react-query'

import { transactionsQueryOptions } from '../transactions/api'
import { categoriesQueryOptions } from './api'

export function useCategoryStats() {
  const { data: categories = [] } = useQuery(categoriesQueryOptions)
  const { data: transactions = [] } = useQuery(transactionsQueryOptions)

  return categories.map((category) => {
    const categoryTransactions = transactions.filter((t) => t.category.id === category.id)
    const totalInCents = categoryTransactions.reduce((total, t) => total + t.amountInCents, 0)

    return {
      category,
      itemCount: categoryTransactions.length,
      totalInCents,
    }
  })
}
