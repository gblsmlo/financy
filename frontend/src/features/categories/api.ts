import { queryOptions } from '@tanstack/react-query'

import { graphql } from '../../gql'
import { graphqlClient } from '../../lib/graphql-client'

const categoriesDocument = graphql(`
  query Categories {
    categories {
      id
      name
      description
      icon
      color
    }
  }
`)

export const categoriesQueryOptions = queryOptions({
  queryKey: ['categories'],
  queryFn: async () => {
    const { categories } = await graphqlClient.request(categoriesDocument)
    return categories
  },
})
