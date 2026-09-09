import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

export function Field({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-2', className)} {...props} />
}

export function FieldHelper({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cn('text-xs/4 text-gray-500', className)} {...props} />
}

export function FieldError({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cn('text-xs/4 text-danger', className)} {...props} />
}
