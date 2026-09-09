import * as LabelPrimitive from '@radix-ui/react-label'
import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

export function Label({ className, ...props }: ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn('text-sm/5 font-medium text-gray-700', className)}
      {...props}
    />
  )
}
