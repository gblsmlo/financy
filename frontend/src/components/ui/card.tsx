import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('rounded-xl border border-gray-200 bg-white p-6 shadow-sm', className)}
      {...props}
    />
  )
}
