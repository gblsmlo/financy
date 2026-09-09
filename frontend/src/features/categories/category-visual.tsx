import { Tag } from 'lucide-react'

import { Badge } from '../../components/ui/badge'
import type { Category } from '../../gql/schema-types'
import { cn } from '../../lib/utils'
import { categoryColorClasses, categoryIcons, isCategoryIconName } from './visuals'

type CategoryVisual = Pick<Category, 'name' | 'icon' | 'color'>

export function CategoryIconBox({
  category,
  className,
}: {
  category: Pick<Category, 'icon' | 'color'>
  className?: string
}) {
  const colors = categoryColorClasses[category.color]
  const Icon = isCategoryIconName(category.icon) ? categoryIcons[category.icon] : Tag

  return (
    <span
      className={cn(
        'flex size-10 shrink-0 items-center justify-center rounded-lg',
        colors.bg,
        className,
      )}
    >
      <Icon className={cn('size-4', colors.icon)} />
    </span>
  )
}

export function CategoryBadge({ category }: { category: CategoryVisual }) {
  const colors = categoryColorClasses[category.color]

  return <Badge className={cn(colors.bg, colors.text)}>{category.name}</Badge>
}
