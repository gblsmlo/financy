import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ClientError } from 'graphql-request'
import { Plus, Tag, TrendingUp } from 'lucide-react'
import { useState } from 'react'

import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { deleteCategory } from '../../features/categories/api'
import { CategoryCard } from '../../features/categories/category-card'
import { CategoryFormDialog } from '../../features/categories/category-form-dialog'
import { useCategoryStats } from '../../features/categories/use-category-stats'
import { categoryIcons, isCategoryIconName } from '../../features/categories/visuals'

export const Route = createFileRoute('/_authenticated/categorias')({
  component: CategoriasPage,
})

function CategoriasPage() {
  const stats = useCategoryStats()
  const queryClient = useQueryClient()
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const totalTransactions = stats.reduce((total, s) => total + s.itemCount, 0)
  const mostUsedCandidate = [...stats].sort((a, b) => b.itemCount - a.itemCount)[0]
  const mostUsed =
    mostUsedCandidate && mostUsedCandidate.itemCount > 0 ? mostUsedCandidate : undefined

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      setDeleteError(null)
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (error) => {
      setDeleteError(
        error instanceof ClientError
          ? (error.response.errors?.[0]?.message ?? 'Erro ao apagar.')
          : 'Erro ao apagar.',
      )
    },
  })

  const MostUsedIcon =
    mostUsed && isCategoryIconName(mostUsed.category.icon)
      ? categoryIcons[mostUsed.category.icon]
      : Tag

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Categorias</h1>
          <p className="text-sm text-gray-500">Organize suas transações por categorias</p>
        </div>
        <CategoryFormDialog
          trigger={
            <Button>
              <Plus className="size-4" />
              Nova categoria
            </Button>
          }
        />
      </div>

      {deleteError && <p className="text-sm text-danger">{deleteError}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-3">
          <Tag className="size-5 text-gray-400" />
          <div>
            <p className="text-2xl font-semibold text-gray-900">{stats.length}</p>
            <p className="text-xs text-gray-500">Total de categorias</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <TrendingUp className="size-5 text-gray-400" />
          <div>
            <p className="text-2xl font-semibold text-gray-900">{totalTransactions}</p>
            <p className="text-xs text-gray-500">Total de transações</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <MostUsedIcon className="size-5 text-gray-400" />
          <div>
            <p className="text-2xl font-semibold text-gray-900">
              {mostUsed ? mostUsed.category.name : '—'}
            </p>
            <p className="text-xs text-gray-500">Categoria mais utilizada</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ category, itemCount, totalInCents }) => (
          <CategoryCard
            key={category.id}
            category={category}
            itemCount={itemCount}
            totalInCents={totalInCents}
            onDelete={() => deleteMutation.mutate(category.id)}
          />
        ))}
        {stats.length === 0 && <p className="text-sm text-gray-500">Nenhuma categoria ainda.</p>}
      </div>
    </div>
  )
}
