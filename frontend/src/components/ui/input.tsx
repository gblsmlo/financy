import type { LucideIcon } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'

import { cn } from '../../lib/utils'

type InputProps = ComponentProps<'input'> & {
  icon?: LucideIcon
  /** Ação ancorada na direita de dentro do campo (o olho de "mostrar senha", por exemplo). */
  action?: ReactNode
}

export function Input({ className, icon: Icon, action, ...props }: InputProps) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
      )}
      <input
        className={cn(
          'h-12 w-full rounded-lg border border-gray-300 bg-white px-3 text-base/6 text-gray-800 outline-none placeholder:text-gray-400 focus:border-brand-base focus:ring-1 focus:ring-brand-base disabled:cursor-not-allowed disabled:text-gray-400 aria-invalid:border-danger aria-invalid:focus:border-danger aria-invalid:focus:ring-danger',
          Icon && 'pl-10',
          action && 'pr-10',
          className,
        )}
        {...props}
      />
      {action && <div className="absolute right-3 top-1/2 -translate-y-1/2">{action}</div>}
    </div>
  )
}
