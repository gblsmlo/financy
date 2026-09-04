import { queryOptions } from '@tanstack/react-query'
import { graphql } from '../../gql'
import type { CategoryInput } from '../../gql/graphql'
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

const createCategoryDocument = graphql(`
  mutation CreateCategory($input: CategoryInput!) {
    createCategory(input: $input) {
      id
      name
      description
      icon
      color
    }
  }
`)

export async function createCategory(input: CategoryInput) {
  const { createCategory: category } = await graphqlClient.request(createCategoryDocument, {
    input,
  })
  return category
}

const updateCategoryDocument = graphql(`
  mutation UpdateCategory($id: ID!, $input: CategoryInput!) {
    updateCategory(id: $id, input: $input) {
      id
      name
      description
      icon
      color
    }
  }
`)

export async function updateCategory(args: { id: string; input: CategoryInput }) {
  const { updateCategory: category } = await graphqlClient.request(updateCategoryDocument, args)
  return category
}

const deleteCategoryDocument = graphql(`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`)

export async function deleteCategory(id: string) {
  await graphqlClient.request(deleteCategoryDocument, { id })
}
