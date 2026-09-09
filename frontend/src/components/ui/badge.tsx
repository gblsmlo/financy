import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

export function Badge({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center rounded-full px-3 text-sm/5 font-medium',
        className,
      )}
      {...props}
    />
  )
}
