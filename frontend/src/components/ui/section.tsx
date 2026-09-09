import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

/** Card sem padding próprio: cabeçalho, corpo e rodapé são separados por divisórias. */
export function Section({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('overflow-hidden rounded-xl border border-gray-200 bg-white', className)}
      {...props}
    />
  )
}

export function SectionHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 border-b border-gray-200 py-5 pl-6 pr-3',
        className,
      )}
      {...props}
    />
  )
}

export function SectionFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 border-t border-gray-200 px-6 py-5',
        className,
      )}
      {...props}
    />
  )
}

/** Rótulo em caixa alta do Style Guide: 12/16 medium, tracking 0.6px, gray-500. */
export function Eyebrow({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      className={cn('text-xs/4 font-medium uppercase tracking-[0.6px] text-gray-500', className)}
      {...props}
    />
  )
}
