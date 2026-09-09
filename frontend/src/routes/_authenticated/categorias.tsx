import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ArrowUpDown, type LucideIcon, Plus, Tag } from 'lucide-react'
import { useState } from 'react'

import { PageHeader } from '../../components/page-header'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Eyebrow } from '../../components/ui/section'
import { deleteCategory } from '../../features/categories/api'
import { CategoryCard } from '../../features/categories/category-card'
import { CategoryFormDialog } from '../../features/categories/category-form-dialog'
import { useCategoryStats } from '../../features/categories/use-category-stats'
import {
  categoryColorClasses,
  categoryIcons,
  isCategoryIconName,
} from '../../features/categories/visuals'
import { apiErrorMessage } from '../../lib/api-error'

export const Route = createFileRoute('/_authenticated/categorias')({
  component: CategoriasPage,
})

function StatCard({
  icon: Icon,
  iconClassName,
  value,
  label,
}: {
  icon: LucideIcon
  iconClassName: string
  value: string
  label: string
}) {
  return (
    <Card className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <Icon className={`size-5 shrink-0 ${iconClassName}`} />
        <p className="truncate text-[28px]/8 font-bold text-gray-800">{value}</p>
      </div>
      <Eyebrow>{label}</Eyebrow>
    </Card>
  )
}

function CategoriasPage() {
  const { stats, isLoading, error } = useCategoryStats()
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
      setDeleteError(apiErrorMessage(error, 'Erro ao apagar.'))
    },
  })

  const MostUsedIcon =
    mostUsed && isCategoryIconName(mostUsed.category.icon)
      ? categoryIcons[mostUsed.category.icon]
      : Tag

  return (
    <>
      <PageHeader
        title="Categorias"
        description="Organize suas transações por categorias"
        action={
          <CategoryFormDialog
            trigger={
              <Button>
                <Plus className="size-4" />
                Nova categoria
              </Button>
            }
          />
        }
      />

      {deleteError && <p className="text-sm/5 text-danger">{deleteError}</p>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <StatCard
          icon={Tag}
          iconClassName="text-purple-600"
          value={String(stats.length)}
          label="Total de categorias"
        />
        <StatCard
          icon={ArrowUpDown}
          iconClassName="text-blue-600"
          value={String(totalTransactions)}
          label="Total de transações"
        />
        <StatCard
          icon={MostUsedIcon}
          iconClassName={
            mostUsed ? categoryColorClasses[mostUsed.category.color].icon : 'text-gray-400'
          }
          value={mostUsed ? mostUsed.category.name : '—'}
          label="Categoria mais utilizada"
        />
      </div>

      {isLoading && <p className="text-sm/5 text-gray-500">Carregando…</p>}

      {!isLoading && error && (
        <p className="text-sm/5 text-danger">
          {apiErrorMessage(error, 'Não foi possível carregar as categorias.')}
        </p>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ category, itemCount }) => (
            <CategoryCard
              key={category.id}
              category={category}
              itemCount={itemCount}
              onDelete={() => deleteMutation.mutate(category.id)}
            />
          ))}
          {stats.length === 0 && (
            <p className="text-sm/5 text-gray-500">Nenhuma categoria ainda.</p>
          )}
        </div>
      )}
    </>
  )
}
