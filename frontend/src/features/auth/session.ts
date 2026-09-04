import { queryOptions, useQuery } from '@tanstack/react-query'

import { fetchSession } from './api'

export const sessionQueryOptions = queryOptions({
  queryKey: ['session'],
  queryFn: fetchSession,
  staleTime: 60_000,
})

export function useSession() {
  const query = useQuery(sessionQueryOptions)

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
  }
}
