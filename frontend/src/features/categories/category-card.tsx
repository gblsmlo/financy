import { Pencil, Trash2 } from 'lucide-react'

import { DeleteConfirmDialog } from '../../components/delete-confirm-dialog'
import { Card } from '../../components/ui/card'
import type { Category } from '../../gql/schema-types'
import { CategoryFormDialog } from './category-form-dialog'
import { CategoryBadge, CategoryIconBox } from './category-visual'

type CategoryCardProps = {
  category: Pick<Category, 'id' | 'name' | 'description' | 'icon' | 'color'>
  itemCount: number
  onDelete: () => void
}

export function CategoryCard({ category, itemCount, onDelete }: CategoryCardProps) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <CategoryIconBox category={category} />

        <div className="flex items-center gap-2">
          <DeleteConfirmDialog
            trigger={
              <button
                type="button"
                aria-label="Apagar categoria"
                className="flex size-8 items-center justify-center rounded-lg text-danger hover:bg-red-100"
              >
                <Trash2 className="size-4" />
              </button>
            }
            title="Apagar categoria"
            description={`Tem certeza que quer apagar "${category.name}"? Essa ação não pode ser desfeita.`}
            onConfirm={onDelete}
          />
          <CategoryFormDialog
            category={category}
            trigger={
              <button
                type="button"
                aria-label="Editar categoria"
                className="flex size-8 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100"
              >
                <Pencil className="size-4" />
              </button>
            }
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-base/6 font-medium text-gray-800">{category.name}</p>
        {category.description && <p className="text-sm/5 text-gray-600">{category.description}</p>}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3">
        <CategoryBadge category={category} />
        <span className="text-sm/5 text-gray-500">
          {itemCount} {itemCount === 1 ? 'item' : 'itens'}
        </span>
      </div>
    </Card>
  )
}
