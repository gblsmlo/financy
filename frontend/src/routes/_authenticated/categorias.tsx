import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { Card } from '../../components/ui/card'
import { categoriesQueryOptions } from '../../features/categories/api'

export const Route = createFileRoute('/_authenticated/categorias')({
  component: CategoriasPage,
})

function CategoriasPage() {
  const { data: categories = [] } = useQuery(categoriesQueryOptions)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Categorias</h1>
        <p className="text-sm text-gray-500">Organize suas transações por categorias</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <p className="font-medium text-gray-900">{category.name}</p>
            {category.description && (
              <p className="mt-1 text-sm text-gray-500">{category.description}</p>
            )}
          </Card>
        ))}
        {categories.length === 0 && (
          <p className="text-sm text-gray-500">Nenhuma categoria ainda.</p>
        )}
      </div>
    </div>
  )
}
