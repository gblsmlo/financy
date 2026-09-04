import { Pencil, Trash2 } from 'lucide-react'
import { DeleteConfirmDialog } from '../../components/delete-confirm-dialog'
import { Card } from '../../components/ui/card'
import type { Category } from '../../gql/schema-types'
import { formatCents } from '../../lib/money'
import { cn } from '../../lib/utils'
import { CategoryFormDialog } from './category-form-dialog'
import { categoryColorClasses, categoryIcons, isCategoryIconName } from './visuals'

type CategoryCardProps = {
  category: Pick<Category, 'id' | 'name' | 'description' | 'icon' | 'color'>
  itemCount: number
  totalInCents: number
  onDelete: () => void
}

export function CategoryCard({ category, itemCount, totalInCents, onDelete }: CategoryCardProps) {
  const colors = categoryColorClasses[category.color]
  const Icon = isCategoryIconName(category.icon) ? categoryIcons[category.icon] : null

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className={cn('flex size-10 items-center justify-center rounded-lg', colors.bg)}>
          {Icon && <Icon className={cn('size-5', colors.text)} />}
        </div>

        <div className="flex items-center gap-1">
          <CategoryFormDialog
            category={category}
            trigger={
              <button
                type="button"
                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <Pencil className="size-4" />
              </button>
            }
          />
          <DeleteConfirmDialog
            trigger={
              <button
                type="button"
                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-danger"
              >
                <Trash2 className="size-4" />
              </button>
            }
            title="Apagar categoria"
            description={`Tem certeza que quer apagar "${category.name}"? Essa ação não pode ser desfeita.`}
            onConfirm={onDelete}
          />
        </div>
      </div>

      <div>
        <p className="font-medium text-gray-900">{category.name}</p>
        {category.description && (
          <p className="mt-1 text-sm text-gray-500">{category.description}</p>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span
          className={cn('rounded-full px-2.5 py-1 text-xs font-medium', colors.bg, colors.text)}
        >
          {category.name}
        </span>
        <span className="text-gray-500">
          {itemCount} {itemCount === 1 ? 'item' : 'itens'}
          {itemCount > 0 && ` · ${formatCents(totalInCents)}`}
        </span>
      </div>
    </Card>
  )
}
